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

//     const sender = await pool.query(
//   "SELECT name FROM users WHERE id = $1",
//   [sender_id]
// );
// const senderName = sender.rows[0].name;

// const savedMessage = result.rows[0];

// const io = getIO();

// io.to(`group_${group_id}`).emit("receive_group_message", {
//   ...savedMessage,
//   name: senderName,
// });

const savedMessage = result.rows[0];

// Sender name
const senderResult = await pool.query(
  "SELECT name FROM users WHERE id = $1",
  [sender_id]
);

// Group name
const groupResult = await pool.query(
  "SELECT group_name FROM groups WHERE id = $1",
  [group_id]
);

const messageData = {
  ...savedMessage,
  sender_name: senderResult.rows[0].name,
  group_name: groupResult.rows[0].group_name,
};

const io = getIO();

io.to(`group_${group_id}`).emit(
  "receive_group_message",
  messageData
);
res.status(201).json(savedMessage);


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

// const updateGroupDelivered = async (req, res) => {

//   const { id } = req.params;

//   await pool.query(
//     "UPDATE group_messages SET status='delivered' WHERE id=$1",
//     [id]
//   );

//   res.json({ message: "Delivered" });
// };

// const updateGroupSeen = async (req, res) => {

//   const { id } = req.params;

//   await pool.query(
//     "UPDATE group_messages SET status='seen' WHERE id=$1",
//     [id]
//   );

//   res.json({ message: "Seen" });
// };


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


const updateGroupSeenStatus = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE group_messages SET status='seen' WHERE id=$1",
      [id]
    );

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
module.exports = {
  sendGroupMessage,
  getGroupMessages,
  updateGroupMessageStatus,
  deleteGroupMessage,
   updateGroupSeenStatus,
  
};