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
  const [unreadCounts, setUnreadCounts] = useState({});

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API_URL = process.env.REACT_APP_BASE_URL;

  /* SCREEN DETECTION */

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* SOCKET CONNECT */

  useEffect(() => {
    if (socket && !socket.connected) socket.connect();
  }, [socket]);

  /* ONLINE USERS */

  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users) => setOnlineUsers(users);

    socket.on("onlineUsers", handleOnlineUsers);

    return () => socket.off("onlineUsers", handleOnlineUsers);
  }, [socket]);

  /* FETCH CHAT USERS */

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

  /* FETCH ALL USERS */

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

  /* SELECT CHAT */

  const selectChat = async (chat) => {
    if (!chat) return;

    setCurrentChat(chat);

    setUnreadCounts((prev) => ({
      ...prev,
      [chat.id]: 0,
    }));

    if (socket) {
      socket.emit("markSeen", {
        senderId: chat.id,
      });
    }

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

  /* RECEIVE MESSAGE */

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      // IF CHAT NOT OPEN → INCREASE UNREAD
      if (!currentChat || String(msg.sender) !== String(currentChat.id)) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
      }

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

    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [socket, currentChat, user]);

  useEffect(() => {
    if (!socket) return;

    const handleSeen = ({ senderId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender === user.id && msg.receiver === senderId
            ? { ...msg, status: "seen" }
            : msg,
        ),
      );
    };

    socket.on("messagesSeen", handleSeen);

    return () => socket.off("messagesSeen", handleSeen);
  }, [socket, user]);

  /* SEND MESSAGE */

  const sendMessage = (msg) => {
    if (!currentChat || !socket) return;

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

  /* ADD USER */

  const addUser = (newUser) => {
    if (!newUser) return;

    if (!chats.find((u) => u.id === newUser.id)) {
      setChats((prev) => [...prev, newUser]);
    }

    setShowAddUser(false);
  };

  /* DELETE MESSAGE */

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

      {(!currentChat || !isMobile) && (
        <Sidebar
          chats={chats}
          selectChat={selectChat}
          currentChat={currentChat}
          darkMode={darkMode}
          unreadCounts={unreadCounts}
          openAddUser={() => setShowAddUser(true)}
          openProfile={() => setShowProfile(true)}
        />
      )}

      {/* CHAT AREA */}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
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
              goBack={() => setCurrentChat(null)}
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

      {/* MODALS */}

      {showAddUser && (
        <AddUserModal
          users={allUsers}
          addUser={addUser}
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
