const pool = require("../db");
const { getIO } = require("../socket");

// Send Group Message
const sendGroupMessage = async (req, res) => {
  try {
    console.log(req.body);
    const { group_id, sender_id, message, image, document, status } = req.body;

     const result = await pool.query(
      `INSERT INTO group_messages(group_id, sender_id, message,image, document, status)
       VALUES($1,$2,$3,$4, $5, $6)
       RETURNING *`,
      [group_id, sender_id, message, image, document, "sent"]
    );

    const sender = await pool.query(
  "SELECT name FROM users WHERE id = $1",
  [sender_id]
);
const senderName = sender.rows[0].name;

const savedMessage = result.rows[0];

const io = getIO();

io.to(`group_${group_id}`).emit("receive_group_message", {
  ...savedMessage,
  name: senderName,
});


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

          if (mentionedUser.id === sender_id) continue;

          const result = await pool.query(
            `INSERT INTO notifications
                (user_id,sender_id,group_id,message)
                VALUES($1,$2,$3,$4)`,
            [
              mentionedUser.id,
              sender_id,
              group_id,
              `${mentionedUser.name} mentioned in group`
            ]
          );

            console.log("Sending mention to room:", `user_${mentionedUser.id}`);

  console.log({
    user_id: mentionedUser.id,
    sender_name: senderName,
    group_id,
    message,
  });

          const io = getIO();

          io.to(`user_${mentionedUser.id}`).emit("mention_notification", {
            user_id: mentionedUser.id,
            sender_name: senderName,
            group_id,
            message
          });

          console.log(`${mentionedUser.name} mentioned`);
        }
      }
    }

   res.status(201).json(savedMessage);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Get Group Messages
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const result = await pool.query(
      `
  SELECT
  group_messages.id,
  group_messages.message,
  group_messages.image,
  group_messages.document,
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


const deleteGroupMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM group_messages WHERE id = $1",
      [id]
    );

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


const updateGroupMessageStatus = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      "UPDATE group_messages SET status='delivered' WHERE id=$1",
      [id]
    );

    res.json({ message: "Delivered Updated" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};


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

    await pool.query(
      "UPDATE group_messages SET status='seen' WHERE id=$1",
      [id]
    );

    // Realtime event
    const io = getIO();

    io.emit("group_message_seen", {
      id,
      status: "seen",
    });

    res.json({
      message: "Seen Updated",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateGroupMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE group_messages SET status='delivered' WHERE id=$1",
      [id]
    );

    const io = getIO();

    io.emit("group_message_delivered", {
      id,
      status: "delivered",
    });

    res.json({
      message: "Delivered Updated",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const markGroupMessageSeen = async (req, res) => {
  try {
    const { message_id, user_id } = req.body;

    // Duplicate insert ஆகாத மாதிரி
    const exists = await pool.query(
      `SELECT * FROM group_message_seen
       WHERE message_id = $1 AND user_id = $2`,
      [message_id, user_id]
    );

    if (exists.rows.length > 0) {
      return res.json({
        message: "Already seen"
      });
    }

    await pool.query(
      `INSERT INTO group_message_seen
      (message_id, user_id)
      VALUES($1,$2)`,
      [message_id, user_id]
    );

    const io = getIO();

    io.to(`group_${req.body.group_id}`).emit(
      "group_message_seen_update",
      {
        message_id,
        user_id,
      }
    );

    res.json({
      message: "Seen saved"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};


const getSeenUsers = async (req, res) => {
  try {
    const { messageId } = req.params;

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
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getSeenCount = async (req, res) => {
  try {
    const { messageId } = req.params;

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
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  sendGroupMessage,
  getGroupMessages,
  updateGroupMessageStatus,
  deleteGroupMessage,
   updateGroupSeenStatus,
   markGroupMessageSeen,
    getSeenUsers,
    getSeenCount,
  
};