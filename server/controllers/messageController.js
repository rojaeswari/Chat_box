const pool = require("../db");
const { getIO } = require("../socket");
const cloudinary = require("cloudinary").v2;


const sendMessage = async (req, res) => {
  try {
    const {
      receiver_id,
      message,
      image,
      image_public_id,
      image_resource_type,
      document,
      document_public_id,
      document_resource_type,
      video,
      video_public_id,
      video_resource_type,
      audio,
      audio_public_id,
      audio_resource_type,
    } = req.body;

    const sender_id = req.user.id;

    if (!receiver_id) {
      return res.status(400).json({
        message: "Receiver ID is required",
      });
    }

    const result = await pool.query(
  `INSERT INTO messages (
    sender_id,
    receiver_id,
    message,
    image,
    document,
    video,
    audio,
    image_public_id,
    image_resource_type,
    document_public_id,
    document_resource_type,
    video_public_id,
    video_resource_type,
    audio_public_id,
    audio_resource_type,
    image_delivery_type,
    document_delivery_type,
    video_delivery_type,
    audio_delivery_type,
    status
  )
  VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
    $11,$12,$13,$14,$15,$16,$17,$18,$19,$20
  )
  RETURNING *`,
  [
    sender_id,
    receiver_id,
    message || null,
    image || null,
    document || null,
    video || null,
    audio || null,
    image_public_id || null,
    image_resource_type || null,
    document_public_id || null,
    document_resource_type || null,
    video_public_id || null,
    video_resource_type || null,
    audio_public_id || null,
    audio_resource_type || null,
    image_public_id ? "authenticated" : null,
    document_public_id ? "authenticated" : null,
    video_public_id ? "authenticated" : null,
    audio_public_id ? "authenticated" : null,
    "sent",
  ]
);
    const savedMessage = result.rows[0];
    console.log("SAVED MESSAGE:", savedMessage.id);
console.log("EMITTING TO:", `user_${receiver_id}`, `user_${sender_id}`);
    const io = getIO();

    io.to(`user_${receiver_id}`).emit("receive_message", savedMessage);
    io.to(`user_${sender_id}`).emit("receive_message", savedMessage);

    return res.status(201).json(savedMessage);

  } catch (err) {
    console.error("Send message error:", err);

    return res.status(500).json({
      message: "Unable to send message",
    });
  }
};



// Get Messages
const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const loggedInUserId = req.user.id;

    if (
      String(loggedInUserId) !== String(senderId) &&
      String(loggedInUserId) !== String(receiverId)
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this conversation",
      });
    }

    const result = await pool.query(
      `
      SELECT
        messages.*,
        users.name
      FROM messages
      JOIN users ON users.id = messages.sender_id
      WHERE
        (sender_id = $1 AND receiver_id = $2)
        OR
        (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
      `,
      [senderId, receiverId]
    );

    return res.json(result.rows);

  } catch (err) {
    console.error("Get messages error:", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};


const getPrivateFileUrl = async (req, res) => {
  try {
    const { messageId, field } = req.params;
    const userId = req.user.id;

    const allowedFields = {
      image: ["image_public_id", "image_resource_type", "image_delivery_type"],
      document: ["document_public_id", "document_resource_type", "document_delivery_type"],
      video: ["video_public_id", "video_resource_type", "video_delivery_type"],
      audio: ["audio_public_id", "audio_resource_type", "audio_delivery_type"],
    };

    if (!allowedFields[field]) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const result = await pool.query(
      `SELECT * FROM messages
       WHERE id = $1
       AND (sender_id = $2 OR receiver_id = $2)`,
      [messageId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    const file = result.rows[0];
    const [publicIdColumn, resourceTypeColumn, deliveryTypeColumn] =
      allowedFields[field];

    const publicId = file[publicIdColumn];
    const resourceType = file[resourceTypeColumn];
    const deliveryType = file[deliveryTypeColumn];

    if (!publicId || deliveryType !== "authenticated") {
      return res.status(404).json({ message: "Private file not found" });
    }

    const signedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      type: "authenticated",
      sign_url: true,
      secure: true,
    });

    return res.json({ url: signedUrl });
  } catch (err) {
    console.error("Get private file URL error:", err);
    return res.status(500).json({ message: "Unable to access file" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user.id;

    const result = await pool.query(
      `DELETE FROM messages
       WHERE id = $1 AND sender_id = $2
       RETURNING *`,
      [id, loggedInUserId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "You can delete only your own messages",
      });
    }

    return res.json({
      message: "Message Deleted",
    });

  } catch (err) {
    console.error("Delete message error:", err);

    return res.status(500).json({
      message: "Unable to delete message",
    });
  }
};
// const updateMessageStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     await pool.query(
//       "UPDATE messages SET status=$1 WHERE id=$2",
//       [status, id]
//     );

//     res.json({
//       message: "Status Updated"
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "Server Error"
//     });
//   }
// };

const updateMessageStatus = async (req, res) => {
  try {
    console.log("params:", req.params);
    console.log("body:", req.body);

    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE messages SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );

    console.log(result.rows);

    res.json({
      message: "Status Updated",
    });

  } catch (err) {
    console.log("ERROR:", err);
    console.log(err.stack);

    res.status(500).json({
      message: err.message,
    });
  }
};


const updateSeenStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user.id;

    const result = await pool.query(
      `UPDATE messages
       SET status = 'seen'
       WHERE id = $1
       AND receiver_id = $2
       AND status != 'seen'
       RETURNING sender_id, receiver_id`,
      [id, loggedInUserId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "You are not allowed to update this message",
      });
    }

    const { sender_id, receiver_id } = result.rows[0];
    const io = getIO();

    io.to(`user_${sender_id}`).emit("message_seen", {
      id: Number(id),
      status: "seen",
    });

    io.to(`user_${receiver_id}`).emit("message_seen", {
      id: Number(id),
      status: "seen",
    });

    return res.json({
      message: "Seen Updated",
    });

  } catch (err) {
    console.error("Update seen status error:", err);

    return res.status(500).json({
      message: "Unable to update seen status",
    });
  }
};

const getUnreadCounts = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        sender_id,
        COUNT(*) AS unread_count
      FROM messages
      WHERE receiver_id = $1
        AND status != 'seen'
      GROUP BY sender_id
      `,
      [loggedInUserId]
    );

    return res.json(result.rows);

  } catch (err) {
    console.error("Get unread counts error:", err);

    return res.status(500).json({
      message: "Unable to get unread counts",
    });
  }
};

// Edit Private Message - 15 Minutes Restriction
const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const loggedInUserId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    const result = await pool.query(
      `UPDATE messages
       SET message = $1
       WHERE id = $2
       AND sender_id = $3
       AND created_at >= NOW() - INTERVAL '15 minutes'
       RETURNING *`,
      [message.trim(), id, loggedInUserId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "Message cannot be edited. Only your own messages sent within 15 minutes can be edited.",
      });
    }

    const updatedMessage = result.rows[0];
    const io = getIO();

    io.to(`user_${updatedMessage.sender_id}`).emit(
      "message_edited",
      updatedMessage
    );

    io.to(`user_${updatedMessage.receiver_id}`).emit(
      "message_edited",
      updatedMessage
    );

    return res.json(updatedMessage);

  } catch (err) {
    console.error("Edit message error:", err);

    return res.status(500).json({
      message: "Unable to edit message",
    });
  }
};
module.exports = {
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
  updateMessageStatus,
  updateSeenStatus,
  getUnreadCounts,
  getPrivateFileUrl,
};