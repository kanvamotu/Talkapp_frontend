import React, { useEffect, useRef, useCallback } from "react";

const Call = ({ socket, callData, setCallData }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

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

    setCallData(null);
  }, [setCallData]);

  /* -------------------- START MEDIA -------------------- */
  const startMedia = useCallback(
    async (pc, callData) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callData.video,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      if (callData.type === "outgoing") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("callUser", {
          to: callData.userId,
          offer,
        });
      }
    },
    [socket],
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

    return () => {
      cleanupCall();
    };
  }, [callData, socket, startMedia, cleanupCall]);

  /* -------------------- SOCKET EVENTS -------------------- */
  useEffect(() => {
    if (!peerRef.current) return;

    socket.on("callAccepted", async ({ answer }) => {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (candidate) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("callEnded", cleanupCall);

    return () => {
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("callEnded");
    };
  }, [socket, cleanupCall]);

  /* -------------------- ACCEPT -------------------- */
  const acceptCall = async () => {
    const pc = peerRef.current;
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("acceptCall", {
      to: callData.userId,
      answer,
    });
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
  <div style={styles.container}>
    
    {/* Remote Video (Full Screen) */}
    <video
      ref={remoteVideoRef}
      autoPlay
      playsInline
      style={styles.remoteVideo}   // ✅ APPLY THIS
    />

    {/* Local Video (Small Box) */}
    <video
      ref={localVideoRef}
      autoPlay
      playsInline
      muted
      style={styles.localVideo}   // ✅ APPLY THIS
    />

    {/* Incoming Call Buttons */}
    {callData.type === "incoming" && (
      <div style={styles.controls}>   {/* ✅ APPLY */}
        <button onClick={acceptCall}>Accept</button>
        <button onClick={rejectCall}>Reject</button>
      </div>
    )}

    {/* End Call Button */}
    <div style={styles.controls}>
      <button onClick={endCall} style={styles.endBtn}>
        End Call
      </button>
    </div>

  </div>
);
};

export default Call;



const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "black",
    zIndex: 9999,
  },

  remoteVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  localVideo: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: "100px",
    height: "140px",
    borderRadius: "10px",
    border: "2px solid white",
    objectFit: "cover",
  },

  controls: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },

  endBtn: {
    padding: "12px 20px",
    backgroundColor: "red",
    color: "white",
    border: "none",
    borderRadius: "10px",
  },
};