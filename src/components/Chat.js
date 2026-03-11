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
      const res = await fetch(
        `${API_URL}/messages/${user.id}/${chat.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  /* ================= SOCKET RECEIVE MESSAGE ================= */

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (msg) => {
      if (
        msg.sender === currentChat?.id ||
        msg.receiver === currentChat?.id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [socket, currentChat]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = (msg) => {
    if (!currentChat || !socket) return;

    socket.emit("sendMessage", {
      receiver: currentChat.id,
      message: msg.message,
      type: msg.type || "text",
      replyTo: replyMessage,
    });

    setReplyMessage(null);
  };

  /* ================= DELETE MESSAGE ================= */

  const deleteMessage = (id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  /* ================= CANCEL REPLY ================= */

  const cancelReply = () => {
    setReplyMessage(null);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* ================= SIDEBAR ================= */}

      <Sidebar
        chats={chats}
        selectChat={selectChat}
        currentChat={currentChat}
        darkMode={darkMode}
      />

      {/* ================= CHAT AREA ================= */}

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

            <ReplyBar
              replyMessage={replyMessage}
              cancelReply={cancelReply}
              darkMode={darkMode}
            />

            <MessageList
              messages={messages}
              userId={user?.id}
              darkMode={darkMode}
              openDeletePopup={setDeleteMsg}
            />

            <MessageInput
              sendMessage={sendMessage}
              darkMode={darkMode}
            />
          </>
        )}
      </div>

      {/* ================= ADD USER MODAL ================= */}

      {showAddUser && (
        <AddUserModal
          users={[]}
          addUser={() => {}}
          onClose={() => setShowAddUser(false)}
          darkMode={darkMode}
        />
      )}

      {/* ================= PROFILE MODAL ================= */}

      {showProfile && (
        <Profile
          user={currentChat}
          darkMode={darkMode}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* ================= DELETE POPUP ================= */}

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