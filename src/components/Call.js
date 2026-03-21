import React, { useEffect, useRef, useCallback, useState } from "react";

const Call = ({ socket, callData, setCallData }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const ringtoneRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  /* -------------------- CLEANUP -------------------- */
  const cleanupCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }

    setCallData(null);
  }, [setCallData]);

  /* -------------------- RINGTONE -------------------- */
  useEffect(() => {
    if (callData?.type === "incoming") {
      ringtoneRef.current?.play().catch(() => {});
    } else {
      ringtoneRef.current?.pause();
      if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
    }
  }, [callData]);

  /* -------------------- START MEDIA -------------------- */
  const startMedia = useCallback(
    async (pc, data) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: data.video,
          audio: true,
        });

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
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
    },
    [socket]
  );

  /* -------------------- CREATE PEER -------------------- */
  useEffect(() => {
    if (!callData) return;

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

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: callData.userId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    startMedia(pc, callData);

    return () => cleanupCall();
  }, [callData, socket, startMedia, cleanupCall]);

  /* -------------------- SOCKET EVENTS -------------------- */
  useEffect(() => {
    if (!socket) return;

    const handleCallAccepted = async ({ answer }) => {
      if (!peerRef.current) return;

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      setCallData((prev) => ({ ...prev, type: "ongoing" }));
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (candidate && peerRef.current) {
        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    };

    const handleCallEnded = () => cleanupCall();

    socket.on("callAccepted", handleCallAccepted);
    socket.on("iceCandidate", handleIceCandidate);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("callAccepted", handleCallAccepted);
      socket.off("iceCandidate", handleIceCandidate);
      socket.off("callEnded", handleCallEnded);
    };
  }, [socket, cleanupCall, setCallData]);

  /* -------------------- CONTROLS -------------------- */
  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });

    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOff;
    });

    setIsCameraOff(!isCameraOff);
  };

  /* -------------------- ACTIONS -------------------- */
  const acceptCall = async () => {
    const pc = peerRef.current;
    if (!pc) return;

    await pc.setRemoteDescription(
      new RTCSessionDescription(callData.offer)
    );

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("acceptCall", {
      to: callData.userId,
      answer,
    });

    setCallData((prev) => ({ ...prev, type: "ongoing" }));
  };

  const rejectCall = () => {
    socket.emit("rejectCall", { to: callData.userId });
    cleanupCall();
  };

  const endCall = () => {
    socket.emit("endCall", { to: callData.userId });
    cleanupCall();
  };

  if (!callData) return null;

  return (
    <div style={isMinimized ? styles.minimizedContainer : styles.container}>
      {/* 🔊 RINGTONE */}
      <audio ref={ringtoneRef} loop src="/ringtone.mp3" />

      {/* 🎥 Remote */}
      <video ref={remoteVideoRef} autoPlay playsInline style={styles.remoteVideo} />

      {/* 🎥 Local */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={styles.localVideo}
      />

      {/* 🎛 Controls */}
      <div style={styles.controls}>
        {callData.type === "incoming" ? (
          <div style={styles.incomingBox}>
            <h3 style={{ color: "white" }}>Incoming Call...</h3>
            <div style={{ display: "flex", gap: "20px" }}>
              <button style={styles.acceptBtn} onClick={acceptCall}>
                Accept
              </button>
              <button style={styles.rejectBtn} onClick={rejectCall}>
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
              {isMinimized ? "Maximize 🪟" : "Minimize 🪟"}
            </button>

            <button style={styles.endBtn} onClick={endCall}>
              End Call
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Call;

/* -------------------- STYLES -------------------- */
const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "black",
    zIndex: 9999,
  },

  minimizedContainer: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "200px",
    height: "260px",
    backgroundColor: "black",
    borderRadius: "10px",
    overflow: "hidden",
    zIndex: 9999,
  },

  remoteVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  localVideo: {
    position: "absolute",
    bottom: "12vh",
    right: "3vw",
    width: "28vw",
    maxWidth: "160px",
    aspectRatio: "3/4",
    borderRadius: "10px",
    border: "2px solid white",
    objectFit: "cover",
  },

  controls: {
    position: "absolute",
    bottom: "env(safe-area-inset-bottom, 20px)",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  incomingBox: {
    background: "rgba(0,0,0,0.7)",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
  },

  acceptBtn: {
    padding: "14px 24px",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "50px",
  },

  rejectBtn: {
    padding: "14px 24px",
    backgroundColor: "gray",
    color: "white",
    border: "none",
    borderRadius: "50px",
  },

  endBtn: {
    padding: "14px 24px",
    backgroundColor: "red",
    color: "white",
    border: "none",
    borderRadius: "50px",
  },
};