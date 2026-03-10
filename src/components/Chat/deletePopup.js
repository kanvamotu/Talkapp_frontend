import React from "react";

const DeletePopup = ({
  x,
  y,
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
  onEdit,
  onReply,
  showEveryone,
}) => {
  if (x === null || y === null) return null;

  const itemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    fontSize: 14,
    cursor: "pointer",
    borderRadius: 6,
    transition: "background 0.2s",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: y,
        left: x,
        background: "#ffffff",
        borderRadius: 10,
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        zIndex: 10000,
        minWidth: 190,
        padding: 8,
        fontFamily: "Inter, Segoe UI, sans-serif",
      }}
      onMouseLeave={onClose}
    >
      {/* Reply */}
      <div
        style={itemStyle}
        onClick={() => {
          onReply();
          onClose();
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span>↩</span>
        Reply
      </div>

      {/* Edit */}
      {showEveryone && (
        <div
          style={itemStyle}
          onClick={() => {
            onEdit();
            onClose();
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span>✏️</span>
          Edit Message
        </div>
      )}

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "#E5E7EB",
          margin: "6px 0",
        }}
      />

      {/* Delete for me */}
      <div
        style={{
          ...itemStyle,
          color: "#374151",
        }}
        onClick={() => {
          onDeleteForMe();
          onClose();
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span>🗑</span>
        Delete for me
      </div>

      {/* Delete for everyone */}
      {showEveryone && (
        <div
          style={{
            ...itemStyle,
            color: "#DC2626",
            fontWeight: 500,
          }}
          onClick={() => {
            onDeleteForEveryone();
            onClose();
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#FEE2E2")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span>🚫</span>
          Delete for everyone
        </div>
      )}
    </div>
  );
};

export default DeletePopup;