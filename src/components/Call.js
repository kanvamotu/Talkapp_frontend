import React, { useEffect, useRef, useCallback, useState } from "react";

const Call = ({ socket, callData, setCallData }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const ringtoneRef = useRef(null);
  const iceQueueRef = useRef([]);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  /* ---------------- CLEANUP ---------------- */
  const cleanupCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    ringtoneRef.current?.pause();
    if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;

    setCallData(null);
  }, [setCallData]);

  /* ---------------- INCOMING CALL ---------------- */
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      setCallData({
        type: "incoming",
        userId: data.from,
        offer: data.offer,
        video: true,
      });
    };

    socket.on("incomingCall", handleIncomingCall);
    return () => socket.off("incomingCall", handleIncomingCall);
  }, [socket, setCallData]);

  /* ---------------- RINGTONE ---------------- */
  useEffect(() => {
    if (callData?.type === "incoming") {
      ringtoneRef.current?.play().catch(() => {});
    } else {
      ringtoneRef.current?.pause();
      if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
    }
  }, [callData]);

  /* ---------------- START MEDIA ---------------- */
  const startMedia = useCallback(async (pc, data) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: data.video,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.play().catch(() => {});
      }

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      if (data.type === "outgoing") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("callUser", {
          to: data.userId,
          offer,
        });
      }
    } catch (err) {
      console.error("Media error:", err);
    }
  }, [socket]);

  /* ---------------- CREATE PEER ---------------- */
  useEffect(() => {
    if (!callData) return;

    iceQueueRef.current = [];

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

    peerRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("iceCandidate", {
          to: callData.userId,
          candidate: e.candidate,
        });
      }
    };

    // ✅ FIXED ontrack
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (callData.type === "outgoing") {
      startMedia(pc, callData);
    }

    return () => cleanupCall();
  }, [callData, socket, startMedia, cleanupCall]);

  /* ---------------- SOCKET EVENTS ---------------- */
  useEffect(() => {
    if (!socket) return;

    const handleAccepted = async ({ answer }) => {
      const pc = peerRef.current;
      if (!pc) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (e) {
        console.error("Remote desc error", e);
      }

      for (let c of iceQueueRef.current) {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      }
      iceQueueRef.current = [];

      setCallData((p) => ({ ...p, type: "ongoing" }));
    };

    const handleICE = async ({ candidate }) => {
      const pc = peerRef.current;
      if (!pc || !candidate) return;

      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        iceQueueRef.current.push(candidate);
      }
    };

    socket.on("callAccepted", handleAccepted);
    socket.on("iceCandidate", handleICE);
    socket.on("callEnded", cleanupCall);
    socket.on("callRejected", cleanupCall); // ✅ added

    return () => {
      socket.off("callAccepted", handleAccepted);
      socket.off("iceCandidate", handleICE);
      socket.off("callEnded", cleanupCall);
      socket.off("callRejected", cleanupCall);
    };
  }, [socket, cleanupCall, setCallData]);

  /* ---------------- ACCEPT CALL ---------------- */
  const acceptCall = async () => {
    const pc = peerRef.current;
    if (!pc) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      localVideoRef.current.play().catch(() => {});
    }

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("acceptCall", {
      to: callData.userId,
      answer,
    });

    for (let c of iceQueueRef.current) {
      await pc.addIceCandidate(new RTCIceCandidate(c));
    }
    iceQueueRef.current = [];

    setCallData((p) => ({ ...p, type: "ongoing" }));
  };

  const rejectCall = () => {
    socket.emit("rejectCall", { to: callData.userId });
    cleanupCall();
  };

  const endCall = () => {
    socket.emit("endCall", { to: callData.userId });
    cleanupCall();
  };

  /* ---------------- CONTROLS ---------------- */
  const toggleMute = () => {
    const newMuted = !isMuted;

    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !newMuted;
    });

    setIsMuted(newMuted);
  };

  const toggleCamera = () => {
    const newCam = !isCameraOff;

    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !newCam;
    });

    setIsCameraOff(newCam);
  };

  if (!callData) return null;

  return (
    <div style={isMinimized ? styles.minimized : styles.full}>
      <audio ref={ringtoneRef} loop src="/ringtone.mp3" />

      <video ref={remoteVideoRef} autoPlay playsInline style={styles.remote} />
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={styles.local}
      />

      <div style={styles.controls}>
        {callData.type === "incoming" ? (
          <div style={styles.popup}>
            <h3>Incoming Call</h3>
            <div style={styles.row}>
              <button style={styles.accept} onClick={acceptCall}>
                Accept
              </button>
              <button style={styles.reject} onClick={rejectCall}>
                Reject
              </button>
            </div>
          </div>
        ) : (
          <>
            <button onClick={toggleMute}>
              {isMuted ? "Unmute 🎤" : "Mute 🎤"}
            </button>
            <button onClick={toggleCamera}>
              {isCameraOff ? "Camera On 📷" : "Camera Off 📷"}
            </button>
            <button onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? "⬆️" : "⬇️"}
            </button>
            <button style={styles.end} onClick={endCall}>
              End
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
    background: "black",
    zIndex: 9999,
  },

  minimized: {
    position: "fixed",
    bottom: "env(safe-area-inset-bottom, 10px)",
    right: "10px",
    width: "35vw",
    height: "45vw",
    maxWidth: "200px",
    maxHeight: "260px",
    borderRadius: "12px",
    overflow: "hidden",
    background: "black",
    zIndex: 9999,
  },

  remote: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  local: {
    position: "absolute",
    bottom: "80px",
    right: "10px",
    width: "30vw",
    maxWidth: "120px",
    borderRadius: "10px",
    border: "2px solid white",
  },

  controls: {
    position: "absolute",
    bottom: "env(safe-area-inset-bottom, 15px)",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  popup: {
    background: "rgba(0,0,0,0.7)",
    padding: "16px",
    borderRadius: "12px",
    textAlign: "center",
  },

  row: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },

  accept: {
    padding: "12px 18px",
    background: "green",
    color: "white",
    borderRadius: "30px",
    border: "none",
  },

  reject: {
    padding: "12px 18px",
    background: "gray",
    color: "white",
    borderRadius: "30px",
    border: "none",
  },

  end: {
    padding: "12px 18px",
    background: "red",
    color: "white",
    borderRadius: "30px",
    border: "none",
  },
};
