const pool = require("../db");
const { getIO } = require("../socket");
const cloudinary = require("cloudinary").v2;

// Send Group Message
const sendGroupMessage = async (req, res) => {
  try {
    const {
      group_id,
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

    if (!group_id) {
      return res.status(400).json({
        message: "Group ID is required",
      });
    }

    // Verify group membership
    const memberCheck = await pool.query(
      `SELECT 1
       FROM group_members
       WHERE group_id = $1
       AND user_id = $2`,
      [group_id, sender_id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const result = await pool.query(
  `INSERT INTO group_messages (
    group_id,
    sender_id,
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
    group_id,
    sender_id,
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

    const sender = await pool.query(
      "SELECT name FROM users WHERE id = $1",
      [sender_id]
    );

    const senderName = sender.rows[0]?.name || "";

    const savedMessage = result.rows[0];

    const members = await pool.query(
      `SELECT user_id
       FROM group_members
       WHERE group_id = $1`,
      [group_id]
    );

    const io = getIO();

    io.to(`group_${group_id}`).emit("receive_group_message", {
      ...savedMessage,
      name: senderName,
    });

    // Calculate unread count for every member except sender
    for (const member of members.rows) {
      if (Number(member.user_id) === Number(sender_id)) continue;

      const unread = await pool.query(
        `SELECT COUNT(*) AS unread_count
         FROM group_messages gm
         WHERE gm.group_id = $1
           AND gm.sender_id != $2
           AND NOT EXISTS (
             SELECT 1
             FROM group_message_seen gms
             WHERE gms.message_id = gm.id
               AND gms.user_id = $2
           )`,
        [group_id, member.user_id]
      );

      io.to(`user_${member.user_id}`).emit("group_unread_count", {
        group_id,
        unread_count: Number(unread.rows[0].unread_count),
      });
    }

    // Mention notifications
    if (message && message.trim()) {
      const mentionRegex = /@(\w+)/g;
      const mentions = [...message.matchAll(mentionRegex)];
      const mentionedUsers = new Set();

      for (const m of mentions) {
        const username = m[1].toLowerCase();

        if (mentionedUsers.has(username)) continue;
        mentionedUsers.add(username);

        const user = await pool.query(
          "SELECT id,name FROM users WHERE LOWER(name)=LOWER($1)",
          [username]
        );

        if (user.rows.length) {
          const mentionedUser = user.rows[0];

          if (Number(mentionedUser.id) === Number(sender_id)) continue;

          await pool.query(
            `INSERT INTO notifications
             (user_id,sender_id,group_id,message)
             VALUES($1,$2,$3,$4)`,
            [
              mentionedUser.id,
              sender_id,
              group_id,
              `${mentionedUser.name} mentioned in group`,
            ]
          );

          io.to(`user_${mentionedUser.id}`).emit("mention_notification", {
            user_id: mentionedUser.id,
            sender_name: senderName,
            group_id,
            message,
          });

          console.log(`${mentionedUser.name} mentioned`);
        }
      }
    }

    return res.status(201).json(savedMessage);

  } catch (err) {
    console.error("Send group message error:", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// Get Group Messages
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Verify group membership
    const memberCheck = await pool.query(
      `SELECT 1
       FROM group_members
       WHERE group_id = $1
       AND user_id = $2`,
      [groupId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const result = await pool.query(
      `
     SELECT
  group_messages.id,
  group_messages.message,
  group_messages.image,
  group_messages.document,
  group_messages.video,
  group_messages.audio,

  group_messages.image_delivery_type,
  group_messages.document_delivery_type,
  group_messages.video_delivery_type,
  group_messages.audio_delivery_type,

  group_messages.image_public_id,
  group_messages.image_resource_type,
  group_messages.document_public_id,
  group_messages.document_resource_type,
  group_messages.video_public_id,
  group_messages.video_resource_type,
  group_messages.audio_public_id,
  group_messages.audio_resource_type,

  group_messages.status,
  group_messages.created_at,
  users.id AS sender_id,
  users.name
FROM group_messages
JOIN users
  ON group_messages.sender_id = users.id
WHERE group_messages.group_id = $1
ORDER BY group_messages.created_at ASC
      `,
      [groupId]
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};


// Get authenticated group file URL
const getGroupPrivateFileUrl = async (req, res) => {
  try {
    const { messageId, field } = req.params;
    const userId = req.user.id;

    const allowedFields = {
      image: [
        "image_public_id",
        "image_resource_type",
        "image_delivery_type",
      ],
      document: [
        "document_public_id",
        "document_resource_type",
        "document_delivery_type",
      ],
      video: [
        "video_public_id",
        "video_resource_type",
        "video_delivery_type",
      ],
      audio: [
        "audio_public_id",
        "audio_resource_type",
        "audio_delivery_type",
      ],
    };

    if (!allowedFields[field]) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const result = await pool.query(
      `SELECT gm.*
       FROM group_messages gm
       JOIN group_members g
         ON g.group_id = gm.group_id
       WHERE gm.id = $1
         AND g.user_id = $2`,
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
      return res.status(404).json({
        message: "Private file not found",
      });
    }

    const signedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      type: "authenticated",
      sign_url: true,
      secure: true,
    });

    return res.json({ url: signedUrl });
  } catch (err) {
    console.error("Get group private file URL error:", err);
    return res.status(500).json({
      message: "Unable to access file",
    });
  }
};
// const deleteGroupMessage = async (req, res) => {
//   try {
//     const { id } = req.params;

//     await pool.query(
//       "DELETE FROM group_messages WHERE id = $1",
//       [id]
//     );

//     res.json({
//       message: "Group Message Deleted Successfully",
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };

const deleteGroupMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `DELETE FROM group_messages
       WHERE id = $1
       AND sender_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "You can delete only your own messages",
      });
    }

    res.json({
      message: "Group Message Deleted Successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// const updateGroupMessageStatus = async (req, res) => {
//   try {

//     const { id } = req.params;

//     await pool.query(
//       "UPDATE group_messages SET status='delivered' WHERE id=$1",
//       [id]
//     );

//     res.json({ message: "Delivered Updated" });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


// const updateGroupSeenStatus = async (req, res) => {
//   try {
//     const { id } = req.params;

//     await pool.query(
//       "UPDATE group_messages SET status='seen' WHERE id=$1",
//       [id]
//     );

//     res.json({
//       message: "Seen Updated",
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };

const updateGroupSeenStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE group_messages
       SET status = 'seen'
       WHERE id = $1
       AND sender_id != $2
       AND EXISTS (
         SELECT 1
         FROM group_members
         WHERE group_members.group_id = group_messages.group_id
         AND group_members.user_id = $2
       )
       RETURNING id, group_id, status`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "You cannot update this message status",
      });
    }

    const updatedMessage = result.rows[0];
    const io = getIO();

    io.to(`group_${updatedMessage.group_id}`).emit(
      "group_message_seen",
      {
        id: updatedMessage.id,
        status: updatedMessage.status,
      }
    );

    return res.json({
      message: "Seen Updated",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateGroupMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE group_messages
       SET status = 'delivered'
       WHERE id = $1
       AND sender_id != $2
       AND EXISTS (
         SELECT 1
         FROM group_members
         WHERE group_members.group_id = group_messages.group_id
         AND group_members.user_id = $2
       )
       RETURNING id, group_id, status`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "You cannot update this message status",
      });
    }

    const updatedMessage = result.rows[0];
    const io = getIO();

    io.to(`group_${updatedMessage.group_id}`).emit(
      "group_message_delivered",
      {
        id: updatedMessage.id,
        status: updatedMessage.status,
      }
    );

    res.json({
      message: "Delivered Updated",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const markGroupMessageSeen = async (req, res) => {
  try {
    const { message_id } = req.body;
    const userId = req.user.id;

    // Check message and group membership
    const messageCheck = await pool.query(
      `SELECT gm.group_id, gm.sender_id
       FROM group_messages gm
       JOIN group_members g
         ON g.group_id = gm.group_id
       WHERE gm.id = $1
       AND g.user_id = $2`,
      [message_id, userId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(403).json({
        message: "You cannot access this group message",
      });
    }

    const groupId = messageCheck.rows[0].group_id;

    if (Number(messageCheck.rows[0].sender_id) === Number(userId)) {
      return res.status(400).json({
        message: "You cannot mark your own message as seen",
      });
    }

    // Check duplicate
    const exists = await pool.query(
      `SELECT 1
       FROM group_message_seen
       WHERE message_id = $1
       AND user_id = $2`,
      [message_id, userId]
    );

    if (exists.rows.length > 0) {
      return res.json({
        message: "Already seen",
      });
    }

    await pool.query(
      `INSERT INTO group_message_seen
       (message_id, user_id)
       VALUES ($1, $2)`,
      [message_id, userId]
    );

    // Calculate unread count
    const unread = await pool.query(
      `SELECT COUNT(*) AS unread_count
       FROM group_messages gm
       WHERE gm.group_id = $1
       AND gm.sender_id != $2
       AND NOT EXISTS (
         SELECT 1
         FROM group_message_seen gms
         WHERE gms.message_id = gm.id
         AND gms.user_id = $2
       )`,
      [groupId, userId]
    );

    const io = getIO();

    io.to(`user_${userId}`).emit("group_unread_count", {
      group_id: groupId,
      unread_count: Number(unread.rows[0].unread_count),
    });

    io.to(`group_${groupId}`).emit("group_message_seen_update", {
      message_id,
      user_id: userId,
    });

    res.json({
      message: "Seen saved",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getSeenUsers = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const accessCheck = await pool.query(
      `SELECT 1
       FROM group_messages gm
       JOIN group_members g
         ON g.group_id = gm.group_id
       WHERE gm.id = $1
       AND g.user_id = $2`,
      [messageId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        message: "You cannot access this group message",
      });
    }

    const result = await pool.query(
      `
      SELECT
        users.id,
        users.name,
        group_message_seen.seen_at
      FROM group_message_seen
      JOIN users
        ON group_message_seen.user_id = users.id
      WHERE group_message_seen.message_id = $1
      ORDER BY group_message_seen.seen_at ASC
      `,
      [messageId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getSeenCount = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const accessCheck = await pool.query(
      `SELECT 1
       FROM group_messages gm
       JOIN group_members g
         ON g.group_id = gm.group_id
       WHERE gm.id = $1
       AND g.user_id = $2`,
      [messageId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        message: "You cannot access this group message",
      });
    }

    const result = await pool.query(
      `
      SELECT COUNT(*)::int AS seen_count
      FROM group_message_seen
      WHERE message_id = $1
      `,
      [messageId]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getGroupUnreadCounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
          gm.group_id,
          COUNT(*)::int AS unread_count
      FROM group_messages gm
      JOIN group_members member
        ON member.group_id = gm.group_id
       AND member.user_id = $1
      WHERE
          gm.sender_id != $1
          AND NOT EXISTS (
              SELECT 1
              FROM group_message_seen gms
              WHERE gms.message_id = gm.id
                AND gms.user_id = $1
          )
      GROUP BY gm.group_id
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

 // Edit Group Message - 15 Minutes Restriction
const editGroupMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    const result = await pool.query(
      `UPDATE group_messages
       SET message = $1
       WHERE id = $2
       AND sender_id = $3
       AND created_at >= NOW() - INTERVAL '15 minutes'
       RETURNING *`,
      [message.trim(), id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "Message cannot be edited. Only your own messages sent within 15 minutes can be edited.",
      });
    }

    const updatedMessage = result.rows[0];
    const io = getIO();

    io.to(`group_${updatedMessage.group_id}`).emit(
      "group_message_edited",
      updatedMessage
    );

    return res.json(updatedMessage);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  sendGroupMessage,
  getGroupMessages,
  getGroupPrivateFileUrl,
  updateGroupMessageStatus,
  deleteGroupMessage,
  editGroupMessage,
   updateGroupSeenStatus,
   markGroupMessageSeen,
    getSeenUsers,
    getSeenCount,
     getGroupUnreadCounts,
  
};