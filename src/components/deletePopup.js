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

  const buttonStyle = {
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    transition: "background 0.2s, color 0.2s",
    textAlign: "center",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: y,
        left: x,
        background: "#fff",
        padding: 14,
        borderRadius: 8,
        boxShadow: "0px 6px 16px rgba(0,0,0,0.2)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        minWidth: 170,
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      }}
      onMouseLeave={onClose}
    >
      {/* Delete for me */}
      <div
        style={{
          ...buttonStyle,
          backgroundColor: "#F3F4F6", // Light professional gray
          color: "#374151", // Dark gray text
          marginBottom: showEveryone ? 8 : 0,
        }}
        onClick={() => {
          onDeleteForMe();
          onClose();
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#E5E7EB"; // Slightly darker gray
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#F3F4F6";
        }}
      >
        Delete for me
      </div>
      {/* Reply */}
<div
  style={{
    ...buttonStyle,
    backgroundColor: "#F9FAFB",
    color: "#111827",
    marginBottom: 8,
  }}
  onClick={() => {
    onReply();
    onClose();
  }}
>
  ↩ Reply
</div>

{/* Edit */}
{showEveryone && (
  <div
    style={{
      ...buttonStyle,
      backgroundColor: "#F9FAFB",
      color: "#111827",
      marginBottom: 8,
    }}
    onClick={() => {
      onEdit();
      onClose();
    }}
  >
    ✏️ Edit
  </div>
)}


      {/* Delete for everyone */}
      {showEveryone && (
        <div
          style={{
            ...buttonStyle,
            backgroundColor: "#B91C1C", // Professional dark red
            color: "#fff",
          }}
          onClick={() => {
            onDeleteForEveryone();
            onClose();
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#991B1B")} // darker red on hover
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#B91C1C")}
        >
          Delete for everyone
        </div>
      )}
    </div>
  );
};

export default DeletePopup;
