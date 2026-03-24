import React, { useEffect, useRef, useState, useCallback } from "react";

const Call = ({ socket, callData, setCallData }) => {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const iceQueue = useRef([]);
  const timerRef = useRef(null);

  const [time, setTime] = useState(0);
  const [status, setStatus] = useState("Connecting...");
  const [network, setNetwork] = useState("good");
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [minimized, setMinimized] = useState(false);

  /* ---------------- TIMER ---------------- */
  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setTime(0);
  };

  const formatTime = () =>
    `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(
      time % 60
    ).padStart(2, "0")}`;

  /* ---------------- CLEANUP ---------------- */
  const cleanup = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    iceQueue.current = [];
    stopTimer();
    setCallData(null);
  }, [setCallData]);

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

    pc.onicecandidate = e => {
      if (e.candidate && callData?.userId) {
        socket.emit("iceCandidate", {
          to: callData.userId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = e => {
      if (remoteRef.current) {
        remoteRef.current.srcObject = e.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;

      if (state === "connected") {
        setStatus("Connected");
        setNetwork("good");
        startTimer();
      }
      if (state === "connecting") {
        setStatus("Connecting...");
        setNetwork("medium");
      }
      if (state === "disconnected") {
        setStatus("Reconnecting...");
        setNetwork("poor");
      }
      if (state === "failed") {
        setStatus("Connection failed");
        setNetwork("poor");
        cleanup();
      }
      if (state === "closed") cleanup();
    };

    return pc;
  }, [socket, callData?.userId, cleanup]);

  /* ---------------- MEDIA ---------------- */
  const startMedia = async (video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio: true,
      });

      streamRef.current = stream;

      if (localRef.current) {
        localRef.current.srcObject = stream;
        localRef.current.muted = true;
      }

      stream.getTracks().forEach(track => {
        peerRef.current?.addTrack(track, stream);
      });
    } catch {
      setStatus("Camera/Mic denied ❌");
    }
  };

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    if (!socket) return;

    const incoming = ({ from, offer }) => {
      setStatus("Incoming call...");
      setCallData({
        type: "incoming",
        userId: from,
        offer,
        video: true,
      });
    };

    const accepted = async ({ answer }) => {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      for (let c of iceQueue.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
        } catch {}
      }
      iceQueue.current = [];

      setCallData(p => ({ ...p, type: "ongoing" }));
    };

    const ice = async ({ candidate }) => {
      if (!peerRef.current) return;

      if (peerRef.current.remoteDescription) {
        try {
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch {}
      } else {
        iceQueue.current.push(candidate);
      }
    };

    socket.on("incomingCall", incoming);
    socket.on("callAccepted", accepted);
    socket.on("iceCandidate", ice);
    socket.on("callEnded", cleanup);
    socket.on("callRejected", cleanup);

    return () => {
      socket.off("incomingCall", incoming);
      socket.off("callAccepted", accepted);
      socket.off("iceCandidate", ice);
      socket.off("callEnded", cleanup);
      socket.off("callRejected", cleanup);
    };
  }, [socket, cleanup, setCallData]);

  /* ---------------- OUTGOING ---------------- */
  useEffect(() => {
    if (!callData || callData.type !== "outgoing") return;

    setStatus("Calling...");
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
  }, [callData, createPeer, socket]);

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
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
      } catch {}
    }
    iceQueue.current = [];

    setCallData(p => ({ ...p, type: "ongoing" }));
  };

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
    streamRef.current?.getAudioTracks().forEach(t => {
      t.enabled = !t.enabled;
    });
    setIsMuted(p => !p);
  };

  const toggleCamera = () => {
    streamRef.current?.getVideoTracks().forEach(t => {
      t.enabled = !t.enabled;
    });
    setIsCamOff(p => !p);
  };

  /* ---------------- SCREEN SHARE ---------------- */
  const shareScreen = async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    const track = screen.getVideoTracks()[0];

    const sender = peerRef.current
      .getSenders()
      .find(s => s.track.kind === "video");

    if (sender) sender.replaceTrack(track);

    track.onended = () => {
      const camTrack = streamRef.current.getVideoTracks()[0];
      sender.replaceTrack(camTrack);
    };
  };

  if (!callData) return null;

  return (
    <div style={minimized ? styles.min : styles.full}>
      <div style={styles.videoContainer}>
        <video ref={remoteRef} autoPlay playsInline style={styles.remote} />
        <video ref={localRef} autoPlay playsInline muted style={styles.local} />
      </div>

      {/* TOP */}
      <div style={styles.top}>
        <div>{callData.userId}</div>
        <div style={{ fontSize: 12 }}>
          {callData.type === "ongoing" ? formatTime() : status}
        </div>
        <div style={{ fontSize: 10 }}>Network: {network}</div>
      </div>

      {/* CONTROLS */}
      <div style={styles.controls}>
        {callData.type === "incoming" ? (
          <>
            <button style={{ ...styles.btn, background: "#22c55e" }} onClick={acceptCall}>📞</button>
            <button style={{ ...styles.btn, background: "#ef4444" }} onClick={rejectCall}>❌</button>
          </>
        ) : (
          <>
            <button style={styles.btn} onClick={toggleMute}>
              {isMuted ? "🔇" : "🎤"}
            </button>
            <button style={styles.btn} onClick={toggleCamera}>
              {isCamOff ? "📷❌" : "📷"}
            </button>
            <button style={styles.btn} onClick={shareScreen}>🖥️</button>
            <button style={styles.btn} onClick={() => setMinimized(!minimized)}>
              {minimized ? "⬆️" : "⬇️"}
            </button>
            <button style={{ ...styles.btn, background: "#dc2626" }} onClick={endCall}>
              🔴
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Call;

/* ---------------- STYLES ---------------- */
const styles = {
  full: {
    position: "fixed",
    inset: 0,
    background: "#0f172a",
  },
  min: {
    position: "fixed",
    bottom: 20,
    right: 20,
    width: 200,
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    background: "#0f172a",
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  remote: { width: "100%", height: "100%", objectFit: "cover" },
  local: {
    position: "absolute",
    width: 120,
    bottom: 90,
    right: 20,
    borderRadius: 10,
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
    gap: 15,
  },
  btn: {
    width: 55,
    height: 55,
    borderRadius: "50%",
    border: "none",
    background: "#334155",
    color: "white",
    fontSize: 18,
  },
};