const pool = require("../db");

// Create Group
const createGroup = async (req, res) => {
  try {
    const { group_name, created_by } = req.body;

    const result = await pool.query(
      `INSERT INTO groups(group_name, created_by)
       VALUES($1,$2)
       RETURNING *`,
      [group_name, created_by]
    );

    // Creator becomes first member
    await pool.query(
      `INSERT INTO group_members(group_id, user_id)
       VALUES($1,$2)`,
      [result.rows[0].id, created_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all groups
const getGroups = async (req, res) => {
  try {
    const { userId } = req.query;

    const result = await pool.query(
      `
      SELECT g.*
      FROM groups g
      JOIN group_members gm
      ON g.id = gm.group_id
      WHERE gm.user_id = $1
      ORDER BY g.id DESC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};


// Add Member to Group
// const addMember = async (req, res) => {
//   try {
//     const { group_id, user_id } = req.body;

//     // Check if already a member
//     const member = await pool.query(
//       "SELECT * FROM group_members WHERE group_id=$1 AND user_id=$2",
//       [group_id, user_id]
//     );

//     if (member.rows.length > 0) {
//       return res.status(400).json({
//         message: "User already exists in this group",
//       });
//     }

//     await pool.query(
//       "INSERT INTO group_members(group_id,user_id) VALUES($1,$2)",
//       [group_id, user_id]
//     );

//     res.json({
//       message: "Member Added Successfully",
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };




// Get Group Members
const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const result = await pool.query(
      `
      SELECT users.id, users.name, users.email
      FROM group_members
      JOIN users
      ON group_members.user_id = users.id
      WHERE group_members.group_id = $1
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


// Update Group Name
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_name } = req.body;

    await pool.query(
      "UPDATE groups SET group_name=$1 WHERE id=$2",
      [group_name, id]
    );

    res.json({
      message: "Group Updated Successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Delete Group
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM group_members WHERE group_id=$1",
      [id]
    );

    await pool.query(
      "DELETE FROM groups WHERE id=$1",
      [id]
    );

    res.json({
      message: "Group Deleted Successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};


const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    await pool.query(
      `DELETE FROM group_members
       WHERE group_id = $1
       AND user_id = $2`,
      [groupId, userId]
    );

    res.json({
      message: "Member Removed Successfully",
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { user_id } = req.body;

    // Check already exists
    const exists = await pool.query(
      "SELECT * FROM group_members WHERE group_id=$1 AND user_id=$2",
      [groupId, user_id]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists in group",
      });
    }

    await pool.query(
      "INSERT INTO group_members(group_id,user_id) VALUES($1,$2)",
      [groupId, user_id]
    );

    res.json({
      message: "Member Added Successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};



module.exports = {
  createGroup,
  getGroups,
   getGroupMembers,
     updateGroup,
     deleteGroup,
      removeMember,
      addMember,

};