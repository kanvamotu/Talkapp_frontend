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
  const [allUsers, setAllUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const API_URL = process.env.REACT_APP_BASE_URL;

  /* ================= SOCKET CONNECT ================= */
  useEffect(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  /* ================= ONLINE USERS ================= */
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [socket]);

  /* ================= FETCH CHAT USERS ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/chat-users/${user.id}`, {
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
  }, [API_URL, user.id]);

  /* ================= FETCH ALL USERS (FOR ADD USER) ================= */
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await res.json();
        setAllUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchAllUsers();
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

  /* ================= RECEIVE MESSAGE ================= */
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;

        if (
          currentChat &&
          ((String(msg.sender) === String(user.id) &&
            String(msg.receiver) === String(currentChat.id)) ||
            (String(msg.sender) === String(currentChat.id) &&
              String(msg.receiver) === String(user.id)))
        ) {
          return [...prev, msg];
        }

        return prev;
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, currentChat, user]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = (msg) => {
    if (!currentChat || !socket) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: String(user.id),
      receiver: String(currentChat.id),
      message: msg.message || "",
      type: msg.type || "text",
      mediaUrl: msg.mediaUrl || null,
      createdAt: new Date(),
      replyTo: replyMessage,
    };

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

  /* ================= ADD USER ================= */
  const addUser = (newUser) => {
    if (!newUser) return;

    if (!chats.find((u) => u.id === newUser.id)) {
      setChats((prev) => [...prev, newUser]);
    }

    setShowAddUser(false);
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

  const cancelReply = () => setReplyMessage(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* SIDEBAR */}
      <Sidebar
        chats={chats}
        selectChat={selectChat}
        currentChat={currentChat}
        darkMode={darkMode}
        openAddUser={() => setShowAddUser(true)}
        openProfile={() => setShowProfile(true)}
      />

      {/* CHAT AREA */}
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
              onlineUsers={onlineUsers}
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

      {/* ADD USER MODAL */}
      {showAddUser && (
        <AddUserModal
          users={allUsers}
          addUser={addUser}
          onClose={() => setShowAddUser(false)}
          darkMode={darkMode}
        />
      )}

      {/* PROFILE */}
      {showProfile && (
        <Profile
          user={user}
          darkMode={darkMode}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* DELETE POPUP */}
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