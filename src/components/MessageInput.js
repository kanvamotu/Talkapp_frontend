import React, { useState, useRef } from "react";

const MessageInput = ({ sendMessage, darkMode }) => {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);

  const fileRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const API_URL = process.env.REACT_APP_BASE_URL;

  const sendText = () => {
    if (!text.trim()) return;

    sendMessage({ message: text, type: "text" });
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendText();
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/upload-media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    });

    const data = await res.json();
    const type = file.type.startsWith("image") ? "image" : "video";

    sendMessage({ message: "", type, mediaUrl: data.url });
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      chunksRef.current = [];

      const formData = new FormData();
      formData.append("audio", blob);

      const res = await fetch(`${API_URL}/upload-audio`, { method: "POST", body: formData });
      const data = await res.json();

      sendMessage({ message: "", type: "audio", mediaUrl: data.url });
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: 10,
        borderTop: "1px solid #ddd",
        background: darkMode ? "#111b21" : "#f1f5f9",
      }}
    >
      <button onClick={() => fileRef.current.click()} style={buttonStyle(darkMode)}>📎</button>
      <input type="file" hidden ref={fileRef} onChange={handleFile} />

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type a message"
        style={{
          flex: 1,
          padding: 8,
          borderRadius: 6,
          border: "1px solid #ccc"
        }}
      />

      <button onClick={sendText} style={buttonStyle(darkMode)}>➤</button>
      {!recording ? (
        <button onClick={startRecording} style={buttonStyle(darkMode)}>🎤</button>
      ) : (
        <button onClick={stopRecording} style={buttonStyle(darkMode)}>⏹</button>
      )}
    </div>
  );
};

const buttonStyle = (darkMode) => ({
  border: "none",
  background: darkMode ? "#2563EB" : "#e5e7eb",
  color: darkMode ? "#fff" : "#111",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 16,
});

export default MessageInput;