import React, { useEffect, useRef, useState, useCallback } from "react";

const Call = ({ socket, callData, setCallData }) => {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const iceQueue = useRef([]);
  const ringtone = useRef(null);
  const timerRef = useRef(null);

  const [time, setTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [minimized, setMinimized] = useState(false);

  /* ---------------- TIMER ---------------- */
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setTime(0);
  }, []);

  const formatTime = () => {
    const m = String(Math.floor(time / 60)).padStart(2, "0");
    const s = String(time % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ---------------- PEER ---------------- */
  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && callData?.userId) {
        socket.emit("iceCandidate", {
          to: callData.userId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteRef.current) {
        remoteRef.current.srcObject = e.streams[0];
      }
    };

    return pc;
  }, [socket, callData?.userId]);

  /* ---------------- MEDIA ---------------- */
  const startMedia = useCallback(async (video = true) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video,
      audio: true,
    });

    streamRef.current = stream;

    if (localRef.current) {
      localRef.current.srcObject = stream;
      localRef.current.muted = true;
    }

    if (!peerRef.current) return;

    stream.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, stream);
    });
  }, []);

  /* ---------------- CLEANUP ---------------- */
  const cleanup = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    iceQueue.current = [];

    ringtone.current?.pause();
    if (ringtone.current) ringtone.current.currentTime = 0;

    stopTimer();
    setCallData(null);
  }, [setCallData, stopTimer]);

  /* ---------------- INCOMING ---------------- */
  useEffect(() => {
    if (!socket) return;

    const handler = ({ from, offer }) => {
      setCallData({
        type: "incoming",
        userId: from,
        offer,
        video: true,
      });
    };

    socket.on("incomingCall", handler);
    return () => socket.off("incomingCall", handler);
  }, [socket, setCallData]);

  /* ---------------- RINGTONE ---------------- */
  useEffect(() => {
    if (callData?.type === "incoming") {
      ringtone.current?.play().catch(() => {});
    } else {
      ringtone.current?.pause();
    }
  }, [callData]);

  /* ---------------- OUTGOING ---------------- */
  useEffect(() => {
    if (!callData || callData.type !== "outgoing") return;

    peerRef.current = createPeer();

    (async () => {
      await startMedia(callData.video);

      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);

      socket.emit("callUser", {
        to: callData.userId,
        offer,
      });
    })();
  }, [callData, createPeer, startMedia, socket]);

  /* ---------------- ACCEPT ---------------- */
  const acceptCall = async () => {
    peerRef.current = createPeer();

    await startMedia(true);

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(callData.offer)
    );

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    socket.emit("acceptCall", {
      to: callData.userId,
      answer,
    });

    for (let c of iceQueue.current) {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
    }
    iceQueue.current = [];

    setCallData((p) => ({ ...p, type: "ongoing" }));
    startTimer();
  };

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    if (!socket) return;

    const handleAccepted = async ({ answer }) => {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      for (let c of iceQueue.current) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
      }
      iceQueue.current = [];

      setCallData((p) => ({ ...p, type: "ongoing" }));
      startTimer();
    };

    const handleICE = async ({ candidate }) => {
      if (!peerRef.current) return;

      if (peerRef.current.remoteDescription) {
        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } else {
        iceQueue.current.push(candidate);
      }
    };

    const handleEnd = () => cleanup();
    const handleReject = () => cleanup();

    socket.on("callAccepted", handleAccepted);
    socket.on("iceCandidate", handleICE);
    socket.on("callEnded", handleEnd);
    socket.on("callRejected", handleReject);

    return () => {
      socket.off("callAccepted", handleAccepted);
      socket.off("iceCandidate", handleICE);
      socket.off("callEnded", handleEnd);
      socket.off("callRejected", handleReject);
    };
  }, [socket, cleanup, startTimer, setCallData]);

  /* ---------------- ACTIONS ---------------- */
  const endCall = () => {
    socket.emit("endCall", { to: callData.userId });
    cleanup();
  };

  const rejectCall = () => {
    socket.emit("rejectCall", { to: callData.userId });
    cleanup();
  };

  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((p) => !p);
  };

  const toggleCamera = () => {
    streamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCamOff((p) => !p);
  };

  if (!callData) return null;

  return (
    <div style={minimized ? styles.min : styles.full}>
      <audio ref={ringtone} loop src="/ringtone.mp3" />

      <video ref={remoteRef} autoPlay playsInline style={styles.remote} />
      <video ref={localRef} autoPlay playsInline muted style={styles.local} />

      <div style={styles.top}>
        {callData.type === "ongoing" && <span>{formatTime()}</span>}
      </div>

      <div style={styles.controls}>
        {callData.type === "incoming" ? (
          <>
            <button onClick={acceptCall}>Accept</button>
            <button onClick={rejectCall}>Reject</button>
          </>
        ) : (
          <>
            <button onClick={toggleMute}>
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button onClick={toggleCamera}>
              {isCamOff ? "Cam On" : "Cam Off"}
            </button>
            <button onClick={() => setMinimized(!minimized)}>
              {minimized ? "⬆️" : "⬇️"}
            </button>
            <button onClick={endCall}>End</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Call;

/* ---------------- STYLES ---------------- */
const styles = {
  full: { position: "fixed", inset: 0, background: "black" },
  min: {
    position: "fixed",
    bottom: 20,
    right: 20,
    width: 200,
    height: 260,
    background: "black",
  },
  remote: { width: "100%", height: "100%", objectFit: "cover" },
  local: {
    position: "absolute",
    width: 120,
    bottom: 80,
    right: 10,
  },
  top: {
    position: "absolute",
    top: 10,
    width: "100%",
    textAlign: "center",
    color: "white",
  },
  controls: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: 10,
  },
};