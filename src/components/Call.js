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
        video: true,
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
    [socket]
  );

  /* -------------------- CREATE PEER -------------------- */
  useEffect(() => {
    if (!callData) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
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
        new RTCSessionDescription(answer)
      );
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (candidate) {
        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
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

    await pc.setRemoteDescription(
      new RTCSessionDescription(callData.offer)
    );

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
    <div className="call-container">
      <video ref={remoteVideoRef} autoPlay playsInline />
      <video ref={localVideoRef} autoPlay playsInline muted />

      {callData.type === "incoming" && (
        <div>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}

      <button onClick={endCall}>End Call</button>
    </div>
  );
};

export default Call;