import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ReplyBar from "./ReplyBar";
import AddUserModal from "./AddUserModal";
import Profile from "./Profile";
import DeletePopup from "./DeletePopup";

const Chat = ({ user, darkMode, socket }) => {

  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);

  const [showAddUser, setShowAddUser] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(null);

  // select chat from sidebar
  const selectChat = (chat) => {
    setCurrentChat(chat);
    setMessages(chat.messages || []);
  };

  // send message
  const sendMessage = (msg) => {
    if (!currentChat) return;

    const newMessage = {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: currentChat.id,
      message: msg.message,
      type: msg.type,
      created_at: new Date()
    };

    setMessages((prev) => [...prev, newMessage]);

    if (socket) {
      socket.emit("send_message", newMessage);
    }
  };

  // delete message
  const deleteMessage = (id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  // cancel reply
  const cancelReply = () => {
    setReplyMessage(null);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* Sidebar */}
      <Sidebar
        selectChat={selectChat}
        currentChat={currentChat}
        darkMode={darkMode}
      />

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

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
          userId={user.id}
          darkMode={darkMode}
          openDeletePopup={setDeleteMsg}
        />

        <MessageInput
          sendMessage={sendMessage}
          darkMode={darkMode}
        />
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserModal
          users={[]}
          addUser={() => {}}
          onClose={() => setShowAddUser(false)}
          darkMode={darkMode}
        />
      )}

      {/* Profile */}
      {showProfile && (
        <Profile
          user={currentChat}
          darkMode={darkMode}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Delete Popup */}
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