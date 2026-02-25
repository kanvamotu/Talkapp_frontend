import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { connectSocket } from "../socket";
import Profile from "./Profile";
import DeletePopup from "./deletePopup";
import Call from "./Call";

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 300,
  maxHeight: "80vh",
  overflowY: "auto",
};

const Chat = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("accessToken");
  const userId = String(userData.id);

  const [users, setUsers] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [message, setMessage] = useState("");
  const [messagesByUser, setMessagesByUser] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recording, setRecording] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true",
  );

  const [showAddModal, setShowAddModal] = useState(false); // control modal
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [deletePopupPosition, setDeletePopupPosition] = useState({
    x: null,
    y: null,
  });
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [currentMsgForPopup, setCurrentMsgForPopup] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectionMode, setSelectionMode] = useState(false);
  const [callData, setCallData] = useState(null);

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);
  const receiverRef = useRef(null);
  const listenersAttachedRef = useRef(false);

  const API_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesByUser, receiver]);

  useEffect(() => {
    receiverRef.current = receiver;
  }, [receiver]);

  /* 🔌 INIT SOCKET */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    socketRef.current = connectSocket(token); // <-- call connectSocket with token
  }, []);

  /* 🛡 SAFE EMIT */
  const safeEmit = (event, payload) => {
    const s = socketRef.current;
    if (s && s.connected) s.emit(event, payload);
    else console.error("Socket not connected!");
  };

  /* 🌙 DARK MODE */
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };

  /* 📥 FETCH USERS */
  useEffect(() => {
    axios
      .get(`${API_URL}/chat-users/${userId}`)
      .then((res) => setUsers(res.data.filter((u) => String(u.id) !== userId)))
      .catch((err) => console.error("❌ Fetch users error:", err.message));
  }, [userId, API_URL]);

  /* 🔔 SOCKET LISTENERS */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || listenersAttachedRef.current) return;
    listenersAttachedRef.current = true;

    /* RECEIVE MESSAGE */
    socket.on("receiveMessage", (data) => {
      const other =
        String(data.sender) === userId
          ? String(data.receiver)
          : String(data.sender);

      setMessagesByUser((prev) => ({
        ...prev,
        [other]: [...(prev[other] || []), data],
      }));

      // ✅ AUTO MARK SEEN IF CHAT IS OPEN
      if (
        receiverRef.current &&
        String(receiverRef.current.id) === other &&
        String(data.sender) !== userId
      ) {
        safeEmit("markSeen", { senderId: other });
      }
    });

    /* ONLINE USERS */
    socket.on("onlineUsers", setOnlineUsers);

    /* MESSAGE SEEN */
    socket.on("messagesSeen", ({ senderId }) => {
      setMessagesByUser((prev) => {
        const updated = { ...prev };
        const chatUserId = String(senderId);

        if (updated[chatUserId]) {
          updated[chatUserId] = updated[chatUserId].map((msg) =>
            String(msg.sender) === userId ? { ...msg, status: "seen" } : msg,
          );
        }

        return updated;
      });
    });

    /* 🗑 DELETE FOR ME */
    socket.on("messageDeletedForMe", ({ messageId }) => {
      setMessagesByUser((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((chatUserId) => {
          updated[chatUserId] = updated[chatUserId].filter(
            (msg) => msg.id !== messageId,
          );
        });
        return updated;
      });
    });

    /* 🗑 DELETE FOR EVERYONE */
    socket.on("messageDeletedForEveryone", ({ messageId }) => {
      setMessagesByUser((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((chatUserId) => {
          updated[chatUserId] = updated[chatUserId].filter(
            (msg) => msg.id !== messageId,
          );
        });

        return updated;
      });
    });

    /* 📞 INCOMING CALL */
    socket.on("incomingCall", ({ from, offer }) => {
      setCallData({
        type: "incoming",
        userId: String(from),
        offer,
      });
    });

    /* ✏️ MESSAGE EDITED */
    socket.on("messageEdited", ({ messageId, newText }) => {
      setMessagesByUser((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((chatUserId) => {
          updated[chatUserId] = updated[chatUserId].map((msg) =>
            msg.id === messageId
              ? { ...msg, message: newText, edited: true }
              : msg,
          );
        });
        return updated;
      });
    });

    return () => {
      socket.removeAllListeners();
      listenersAttachedRef.current = false;
    };
  }, [userId, receiver]);

  /* 📜 CURRENT CHAT */
  const currentMessages = receiver
    ? messagesByUser[String(receiver.id)] || []
    : [];

  /* 📤 SEND MESSAGE */
  const sendMessage = () => {
    if (!receiver) return;

    const tempMessage = {
      id: Date.now(),
      sender: userId,
      receiver: String(receiver.id),
      message,
      type: "text",
      status: "sent",
      createdAt: new Date(),
    };

    setMessagesByUser((prev) => ({
      ...prev,
      [receiver.id]: [...(prev[receiver.id] || []), tempMessage],
    }));

    const s = socketRef.current;
    if (!s || !s.connected) {
      console.error("Socket not connected!");
      return;
    }

    /* ✏️ EDIT MODE */
    if (editingMessage) {
      if (!editedText.trim()) return;

      s.emit("editMessage", {
        messageId: editingMessage.id,
        newText: editedText,
      });

      // Optimistic update
      setMessagesByUser((prev) => {
        const updated = { ...prev };

        updated[receiver.id] = updated[receiver.id].map((msg) =>
          msg.id === editingMessage.id
            ? { ...msg, message: editedText, edited: true }
            : msg,
        );

        return updated;
      });

      setEditingMessage(null);
      setEditedText("");
      return;
    }

    /* 📨 NORMAL SEND */
    if (!message.trim()) return;

    console.log("Sending message:", message, "to", receiver.id);

    s.emit("sendMessage", {
      receiver: String(receiver.id),
      message,
      type: "text",
      replyTo: replyTo
        ? {
            id: replyTo.id,
            message: replyTo.message,
            sender: replyTo.sender,
            type: replyTo.type,
          }
        : null,
    });

    setMessage("");
    setReplyTo(null); // 👈 clear reply after sending
  };

  /* =======================
     ADD USER TO CHAT FUNCTION
     ======================= */
  const addUserToChat = (newUser) => {
    if (!users.some((u) => u.id === newUser.id)) {
      setUsers((prev) => [...prev, newUser]);
      setShowAddModal(false);
    }
  };

  /* 📞 START CALL */
  const startCall = (receiverId, isVideo = true) => {
    if (!receiverId) return;

    setCallData({
      type: "outgoing",
      userId: String(receiverId),
      isVideo,
    });
  };

  /* 🎤 START RECORDING */
  const startRecording = async () => {
    if (!receiver) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
      audioBitsPerSecond: 128000,
    });

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        if (audioBlob.size < 1000) return;

        const formData = new FormData();
        formData.append("audio", audioBlob, `audio_${Date.now()}.webm`);

        const res = await axios.post(`${API_URL}/upload-audio`, formData);

        safeEmit("sendMessage", {
          receiver: receiver.id,
          type: "audio",
          mediaUrl: res.data.url,
        });

        audioChunksRef.current = [];
      } catch (err) {
        console.error(
          "❌ Audio upload failed:",
          err.response?.data || err.message,
        );
      }
    };

    mediaRecorder.start(250); // 🔥 critical
    setRecording(true);
  };

  /* ⏹️ STOP RECORDING */
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    // ⏳ give MediaRecorder time to flush last chunk
    setTimeout(() => {
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.stream
        ?.getTracks()
        .forEach((track) => track.stop());

      setRecording(false);
    }, 200);
  };

  /* 📎 MEDIA UPLOAD */
  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !receiver) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API_URL}/upload-media`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const type = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
        ? "video"
        : "file";

    safeEmit("sendMessage", {
      receiver: receiver.id,
      type,
      mediaUrl: res.data.url,
    });

    e.target.value = "";
  };

  /* DELETE MESSAGES */
  const deleteMessage = (msgId, type) => {
    if (!receiver) return;

    safeEmit("deleteMessage", {
      messageId: msgId, // ✅ FIXED
      type, // "me" or "everyone"
    });

    // Update UI instantly
    setMessagesByUser((prev) => {
      const updated = { ...prev };
      updated[receiver.id] = updated[receiver.id].filter(
        (msg) => msg.id !== msgId,
      );
      return updated;
    });
  };

  /* LOAD MESSAGES */
  const loadMessages = async (receiverId) => {
    try {
      const res = await axios.get(
        `${API_URL}/messages/${userId}/${receiverId}?limit=50&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessagesByUser((prev) => ({
        ...prev,
        [receiverId]: res.data,
      }));

      // 🔵 ADD THIS LINE
      safeEmit("markSeen", {
        senderId: receiverId,
      });
    } catch (err) {
      console.error("❌ Failed to load messages:", err.message);
    }
  };

  /* ADD USER MODAL */

  const openAddUserModal = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`, // <-- add this
        },
      });

      // Filter out current user and already added users
      const newUsers = res.data.filter(
        (u) =>
          String(u.id) !== userId && !users.some((user) => user.id === u.id),
      );

      setSearchResults(newUsers); // add filtered users to search results
      setShowAddModal(true);
    } catch (err) {
      console.error(
        "❌ Failed to load users:",
        err.response?.data || err.message,
      );
    }
  };

  return (
    <div
      style={{ ...styles.app, background: darkMode ? "#0b141a" : "#e5ddd5" }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          ...styles.sidebar,
          width: isMobile ? "100%" : "28%",
          display: isMobile && receiver ? "none" : "flex",
          background: darkMode ? "#111b21" : "#fff",
          color: darkMode ? "#e9edef" : "#000",
        }}
      >
        <div style={styles.sidebarHeader}>
          <strong>{userData.username}</strong>
          <button
            onClick={openAddUserModal}
            style={{ marginLeft: 10, padding: "5px 10px", cursor: "pointer" }}
          >
            {" "}
            ➕ Add User{" "}
          </button>
        </div>

        {showAddModal && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h3>Add a user</h3>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Enter username"
                value={searchText}
                onChange={async (e) => {
                  const val = e.target.value;
                  setSearchText(val);

                  if (!val.trim()) {
                    setSearchResults([]);
                    return;
                  }

                  try {
                    const res = await axios.get(
                      `${API_URL}/search-user?username=${val}&userId=${userId}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    );

                    // Exclude already added users
                    setSearchResults(
                      res.data.filter(
                        (u) => !users.some((user) => user.id === u.id),
                      ),
                    );
                  } catch (err) {
                    console.error("❌ Search failed:", err.message);
                  }
                }}
                style={{ width: "100%", padding: 8, marginBottom: 10 }}
              />

              {/* Search Button */}
              <button
                onClick={async () => {
                  if (!searchText.trim()) {
                    setSearchResults([]);
                    return;
                  }

                  try {
                    const res = await axios.get(
                      `${API_URL}/search-user?username=${searchText}&userId=${userId}`,
                    );
                    setSearchResults(
                      res.data.filter(
                        (u) => !users.some((user) => user.id === u.id),
                      ),
                    );
                  } catch (err) {
                    console.error("❌ Search failed:", err.message);
                  }
                }}
                style={{
                  padding: "6px 12px",
                  marginBottom: 10,
                  cursor: "pointer",
                  borderRadius: 5,

                  color: "#fff",
                  border: "none",
                }}
              >
                Search
              </button>

              {/* Search Results */}
              {searchText.trim() !== "" && searchResults.length === 0 && (
                <p>No users found</p>
              )}

              {searchResults.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: 5,
                  }}
                >
                  <span>{u.username}</span>
                  <button
                    onClick={() => {
                      addUserToChat(u);
                      setSearchText("");
                      setSearchResults([]);
                    }}
                  >
                    Add
                  </button>
                </div>
              ))}

              <button
                onClick={() => setShowAddModal(false)}
                style={{ marginTop: 10 }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {users.map((u) => (
          <div
            key={u.id}
            onClick={async () => {
              setReceiver(u);
              await loadMessages(u.id);
            }}
            style={{
              ...styles.userItem,
              background:
                receiver?.id === u.id
                  ? darkMode
                    ? "#202c33"
                    : "#e9edef"
                  : "transparent",
            }}
          >
            <div>
              <strong>{u.username}</strong>
              <div style={styles.lastMessage}>
                {(() => {
                  const last = messagesByUser[u.id]?.slice(-1)[0];
                  if (!last) return "No messages";
                  if (last.type === "image") return "📷 Photo";
                  if (last.type === "video") return "🎥 Video";
                  if (last.type === "audio") return "🎤 Voice message";
                  return last.message;
                })()}
              </div>
            </div>
            {onlineUsers.includes(String(u.id)) && <span>🟢</span>}
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div
        style={{
          ...styles.chatArea,
          display: isMobile && !receiver ? "none" : "flex",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            ...styles.chatHeader,
            background: darkMode ? "#202c33" : "#075e54",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {selectionMode ? (
            <>
              {/* LEFT SIDE */}
              <span>{selectedMessages.length} selected</span>

              {/* RIGHT SIDE */}
              <div style={{ display: "flex", gap: 15 }}>
                {/* DELETE BUTTON */}
                <button
                  onClick={() => {
                    selectedMessages.forEach((id) =>
                      deleteMessage(id, "everyone"),
                    );
                    setSelectedMessages([]);
                    setSelectionMode(false);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                  title="Delete Selected"
                >
                  🗑
                </button>

                {/* CANCEL BUTTON */}
                <button
                  onClick={() => {
                    setSelectedMessages([]);
                    setSelectionMode(false);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                  title="Cancel"
                >
                  ✖
                </button>
              </div>
            </>
          ) : (
            <>
              {/* NORMAL HEADER MODE */}

              {/* LEFT: USERNAME */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {isMobile && receiver && (
                  <button
                    onClick={() => setReceiver(null)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: 20,
                      cursor: "pointer",
                    }}
                  >
                    ←
                  </button>
                )}

                <span>{receiver ? receiver.username : "Select a chat"}</span>
              </div>

              {/* RIGHT SIDE */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => receiver && startCall(receiver.id, false)}
                  disabled={!receiver}
                  style={styles.callBtn}
                  title="Audio Call"
                >
                  {" "}
                  📞{" "}
                </button>

                <button
                  onClick={() => receiver && startCall(receiver.id, true)}
                  disabled={!receiver}
                  style={styles.callBtn}
                  title="Video Call"
                >
                  {" "}
                  🎥{" "}
                </button>

                <button onClick={toggleDarkMode} style={styles.darkToggle}>
                  {" "}
                  {darkMode ? "☀️" : "🌙"}{" "}
                </button>

                <button
                  onClick={() => setShowProfile(!showProfile)}
                  style={{
                    border: "none",
                    background: "#334155",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    cursor: "pointer",
                  }}
                >
                  {" "}
                  👤{" "}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 👇 ADD PROFILE HERE 👇 */}

        {showProfile && (
          <div
            style={{ position: "absolute", top: 70, right: 20, zIndex: 2000 }}
          >
            {" "}
            <Profile user={userData} />{" "}
          </div>
        )}

        {/* MESSAGES */}
        <div
          style={{
            ...styles.messages,
            background: darkMode ? "#0b141a" : "#efeae2",
          }}
        >
          {currentMessages.map((msg, i) => {
            const isSender = String(msg.sender) === userId;

            return (
              <div
                id={`msg-${msg.id}`}
                key={msg.id || i}
                onContextMenu={(e) => {
                  e.preventDefault();

                  if (String(msg.sender) === userId) {
                    setSelectionMode(true);
                    setSelectedMessages([msg.id]);
                  }

                  setCurrentMsgForPopup(msg); // save this message for popup
                  setDeletePopupPosition({ x: e.clientX, y: e.clientY }); // position popup
                  setShowDeletePopup(true); // show popup
                }}
                onClick={() => {
                  if (selectionMode && isSender) {
                    if (selectedMessages.includes(msg.id)) {
                      setSelectedMessages(
                        selectedMessages.filter((id) => id !== msg.id),
                      );
                    } else {
                      setSelectedMessages([...selectedMessages, msg.id]);
                    }
                  }
                }}
                ref={i === currentMessages.length - 1 ? chatRef : null}
                style={{
                  ...styles.bubble,
                  position: "relative",
                  alignSelf: isSender ? "flex-end" : "flex-start",
                  background: selectedMessages.includes(msg.id)
                    ? "#93c5fd"
                    : isSender
                      ? "#3B82F6"
                      : "#E2E8F0",
                  color: isSender ? "#fff" : "#0F172A",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {/* MESSAGE CONTENT */}
                {msg.type === "audio" && (
                  <audio controls style={{ maxWidth: 220 }}>
                    <source src={msg.mediaUrl} type="audio/webm" />
                  </audio>
                )}

                {msg.type === "image" && (
                  <img
                    src={msg.mediaUrl}
                    alt="sent"
                    style={{ maxWidth: 220, borderRadius: 8 }}
                  />
                )}

                {msg.type === "video" && (
                  <video controls style={{ maxWidth: 220 }}>
                    <source src={msg.mediaUrl} />
                  </video>
                )}

                {/* 🔁 REPLY PREVIEW */}
                {msg.replyTo && (
                  <div
                    onClick={() => {
                      const el = document.getElementById(
                        `msg-${msg.replyTo.id}`,
                      );
                      if (el) {
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                        el.style.background = "#fde68a";
                        setTimeout(() => {
                          el.style.background = "";
                        }, 1500);
                      }
                    }}
                    style={{
                      borderLeft: "3px solid #60a5fa",
                      background: isSender
                        ? "rgba(255,255,255,0.2)"
                        : "#cbd5e1",
                      padding: "5px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      marginBottom: 6,
                      cursor: "pointer",
                    }}
                  >
                    <strong style={{ fontSize: 11 }}>
                      {msg.replyTo.sender === userId
                        ? "You"
                        : receiver?.username}
                    </strong>
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 200,
                      }}
                    >
                      {" "}
                      {msg.replyTo.message}{" "}
                    </div>
                  </div>
                )}

                {msg.type === "text" && <span>{msg.message}</span>}

                {/* ⏰ TIME + STATUS */}
                <div
                  style={{
                    fontSize: 11,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 4,
                    opacity: 0.7,
                  }}
                >
                  {msg.createdAt &&
                    new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}

                  {isSender && (
                    <span>
                      {msg.status === "sent" && "✓"}
                      {msg.status === "delivered" && "✓✓"}
                      {msg.status === "seen" && (
                        <span style={{ color: "#53bdeb" }}>✓✓</span>
                      )}
                    </span>
                  )}
                </div>

                {/* SCROLL REF */}
                <div
                  ref={i === currentMessages.length - 1 ? bottomRef : null}
                />
              </div>
            );
          })}

          {/* 🔴 DELETE POPUP - OUTSIDE OF MESSAGE MAP */}
          {showDeletePopup && currentMsgForPopup && (
            <DeletePopup
              x={deletePopupPosition.x}
              y={deletePopupPosition.y}
              onClose={() => setShowDeletePopup(false)}
              showEveryone={currentMsgForPopup.sender === userId}
              onDeleteForMe={() => {
                deleteMessage(currentMsgForPopup.id, "me");
                setShowDeletePopup(false);
              }}
              onDeleteForEveryone={() => {
                deleteMessage(currentMsgForPopup.id, "everyone");
                setShowDeletePopup(false);
              }}
              onEdit={() => {
                setEditingMessage(currentMsgForPopup);
                setEditedText(currentMsgForPopup.message);
              }}
              onReply={() => {
                setReplyTo(currentMsgForPopup);
              }}
            />
          )}
        </div>

        {callData && (
          <Call
            socket={socketRef.current}
            callData={callData}
            setCallData={setCallData}
            currentUser={userData}
          />
        )}

        {/* 🔁 REPLY BAR */}
        {replyTo && (
          <div
            style={{
              padding: "8px 12px",
              background: darkMode ? "#1f2c34" : "#f1f5f9",
              borderLeft: "4px solid #3B82F6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 13 }}>
              <strong>
                {replyTo.sender === userId
                  ? "Replying to yourself"
                  : "Replying"}
              </strong>
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 250,
                }}
              >
                {replyTo.message}
              </div>
            </div>

            <button
              onClick={() => setReplyTo(null)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>
        )}

        {/* INPUT */}
        <div
          style={{
            ...styles.inputBar,
            background: darkMode ? "#202c33" : "#f0f2f5",
          }}
        >
          <input
            value={editingMessage ? editedText : message}
            onChange={(e) =>
              editingMessage
                ? setEditedText(e.target.value)
                : setMessage(e.target.value)
            }
            placeholder="Type a message"
            style={{
              ...styles.input,
              background: darkMode ? "#111b21" : "#fff",
              color: darkMode ? "#e9edef" : "#000",
            }}
            disabled={!receiver}
          />

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            style={{ display: "none" }}
          />

          <button
            onClick={() => fileInputRef.current.click()}
            disabled={!receiver}
            style={{
              border: "none",
              background: "#E2E8F0",
              color: "#0F172A",
              borderRadius: "50%",
              width: 40,
              height: 40,
              cursor: "pointer",
              fontSize: 18,
            }}
            title="Attach File"
          >
            {" "}
            🔗{" "}
          </button>

          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={!receiver}
            style={{
              border: "none",
              background: recording ? "#ff4d4d" : "#075e54",
              color: "#fff",
              borderRadius: "50%",
              width: 40,
              cursor: "pointer",
            }}
          >
            {" "}
            {recording ? "⏹️" : "🎤"}{" "}
          </button>

          <button style={styles.sendBtn} onClick={sendMessage}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

/* 🎨 STYLES */
/* 🎨 IMPROVED STYLES */
const styles = {
  app: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#F7F9FA",
    color: "#1F2937",
  },

  callBtn: {
    border: "none",
    background: "transparent",
    color: "#fff",
    fontSize: 20,
    cursor: "pointer",
    padding: 5,
  },

  sidebar: {
    width: "28%",
    minWidth: 250,
    borderRight: "1px solid #ccc",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    overflowY: "auto",
  },

  sidebarHeader: {
    padding: "20px 15px",
    fontWeight: "bold",
    fontSize: 18,
    background: "#075e54",
    color: "#fff",
    borderBottom: "1px solid #E5E7EB",
  },

  userItem: {
    padding: 15,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    borderBottom: "1px solid #E5E7EB",
    transition: "background 0.2s",
    gap: 10,
  },

  userItemHover: {
    background: "#EFF6FF",
  },
  deletePopup: {
    position: "absolute",
    background: "#fff",
    padding: 12,
    borderRadius: 8,
    boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 10000,
  },

  deleteBtnEveryone: {
    backgroundColor: "#EF4444", // red
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    transition: "background 0.2s",
  },

  deleteBtnMe: {
    backgroundColor: "#FBBF24", // amber/yellow for less destructive
    color: "#111827",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    transition: "background 0.2s",
  },

  lastMessage: {
    fontSize: 13,
    color: "#667781",
    marginTop: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 200,
  },

  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#F7F9FA",
    position: "relative",
  },

  chatHeader: {
    padding: "15px 20px",
    fontWeight: "bold",
    fontSize: 16,
    background: "#075e54",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #E5E7EB",
  },

  darkToggle: {
    border: "none",
    background: "transparent",
    color: "#fff",
    fontSize: 20,
    cursor: "pointer",
    padding: 5,
    transition: "transform 0.2s",
  },

  messages: {
    flex: 1,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
    background: "#F7F9FA",
  },

  bubble: {
    padding: "10px 15px",
    borderRadius: 12,
    maxWidth: "70%",
    fontSize: 14,
    lineHeight: 1.4,
    wordWrap: "break-word",
    boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
  },

  bubbleSender: {
    background: "#2563EB",
    color: "#fff",
    alignSelf: "flex-end",
  },

  bubbleReceiver: {
    background: "#E5E7EB",
    color: "#1F2937",
    alignSelf: "flex-start",
  },

  inputBar: {
    display: "flex",
    alignItems: "center",
    padding: 10,
    gap: 10,
    borderTop: "1px solid #E5E7EB",
    background: "#fff",
  },

  input: {
    flex: 1,
    padding: "12px 15px",
    borderRadius: 25,
    border: "1px solid #D1D5DB",
    fontSize: 14,
    outline: "none",
    background: "#F9FAFB",
    color: "#111827",
  },

  sendBtn: {
    border: "none",
    background: "#075e54",
    color: "#fff",
    borderRadius: "50%",
    width: 40,
    height: 40,
    fontSize: 18,
    cursor: "pointer",
  },

  sendBtnHover: {
    background: "#064d45",
  },

  callBtnHover: {
    background: "#1eb859",
  },

  videoContainer: {
    display: "flex",
    gap: 10,
    padding: 10,
    justifyContent: "flex-start",
    alignItems: "center",
  },

  videoSmall: {
    width: 120,
    height: 90,
    borderRadius: 8,
    background: "#000",
    objectFit: "cover",
  },

  videoLarge: {
    width: 250,
    height: 180,
    borderRadius: 8,
    background: "#000",
    objectFit: "cover",
    boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
  },
};

export default Chat;
