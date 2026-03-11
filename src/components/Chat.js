import React, { useState, useEffect } from "react";
import Sidebar from "./SideBar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ReplyBar from "./ReplyBar";
import AddUserModal from "./AddUserModal";
import Profile from "./Profile";
import DeletePopup from "./deletePopup";

const Chat = ({ user, darkMode, socket }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(null);

  const API_URL = process.env.REACT_APP_BASE_URL;

  /* ================= ENSURE SOCKET CONNECTED ================= */
  useEffect(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await res.json();
        setChats(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [API_URL]);

  /* ================= SELECT CHAT ================= */
  const selectChat = async (chat) => {
    if (!chat) return;

    setCurrentChat(chat);

    try {
      const res = await fetch(`${API_URL}/messages/${user.id}/${chat.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  /* ================= RECEIVE REAL TIME MESSAGE ================= */
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      setMessages((prev) => {
        // prevent duplicates
        if (prev.some((m) => m.id === msg.id)) return prev;

        // only show if message belongs to current chat
        if (
          currentChat &&
          ((msg.sender === user.id && msg.receiver === currentChat.id) ||
            (msg.sender === currentChat.id && msg.receiver === user.id))
        ) {
          return [...prev, msg];
        }

        return prev;
      });
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [socket, currentChat, user]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = (msg) => {
    if (!currentChat || !socket) return;

    const tempMessage = {
      id: Date.now(),
      sender: user.id,
      receiver: currentChat.id,
      message: msg.message,
      type: msg.type || "text",
      createdAt: new Date(),
      replyTo: replyMessage,
    };

    // show instantly
    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("sendMessage", {
      sender: user.id,
      receiver: currentChat.id,
      message: msg.message || "",
      type: msg.type || "text",
      mediaUrl: msg.mediaUrl || null,
      replyTo: replyMessage,
    });

    setReplyMessage(null);
  };

  /* ================= DELETE MESSAGE ================= */
  const deleteMessage = (id) => {
    if (!socket) return;

    socket.emit("deleteMessage", {
      messageId: id,
      type: "me",
    });

    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  /* ================= CANCEL REPLY ================= */
  const cancelReply = () => setReplyMessage(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        chats={chats}
        selectChat={selectChat}
        currentChat={currentChat}
        darkMode={darkMode}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!currentChat ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 18,
              color: "#64748B",
            }}
          >
            Select a user to start chatting
          </div>
        ) : (
          <>
            <ChatHeader
              receiver={currentChat}
              darkMode={darkMode}
              onlineUsers={[]}
              openProfile={() => setShowProfile(true)}
              startCall={() => {}}
              startVideoCall={() => {}}
            />

            {replyMessage && (
              <ReplyBar
                replyMessage={replyMessage}
                cancelReply={cancelReply}
                darkMode={darkMode}
              />
            )}

            <MessageList
              messages={messages}
              userId={user?.id}
              darkMode={darkMode}
              openDeletePopup={setDeleteMsg}
            />

            <MessageInput sendMessage={sendMessage} darkMode={darkMode} />
          </>
        )}
      </div>

      {showAddUser && (
        <AddUserModal
          users={[]}
          addUser={() => {}}
          onClose={() => setShowAddUser(false)}
          darkMode={darkMode}
        />
      )}

      {showProfile && (
        <Profile
          user={user}
          darkMode={darkMode}
          onClose={() => setShowProfile(false)}
        />
      )}

      {deleteMsg && (
        <DeletePopup
          msg={deleteMsg}
          onDelete={deleteMessage}
          onClose={() => setDeleteMsg(null)}
        />
      )}
    </div>
  );
};

export default Chat;