const pool = require("../db");

// Create Group
const createGroup = async (req, res) => {
  try {
    const { group_name } = req.body;
    const created_by = req.user.id;

    if (!group_name || typeof group_name !== "string" || !group_name.trim()) {
      return res.status(400).json({
        message: "Group name is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO groups(group_name, created_by)
       VALUES($1, $2)
       RETURNING *`,
      [group_name.trim(), created_by]
    );

    await pool.query(
      `INSERT INTO group_members(group_id, user_id)
       VALUES($1, $2)`,
      [result.rows[0].id, created_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Group Error:", err.message);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
// Get all groups
// Get logged-in user's groups
const getGroups = async (req, res) => {
  try {
    const userId = req.user.id;

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
    console.error("Get Groups Error:", err.message);
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
// Get Group Members
const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const memberCheck = await pool.query(
      `SELECT 1
       FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const result = await pool.query(
      `
      SELECT users.id, users.name, users.email
      FROM group_members
      JOIN users ON group_members.user_id = users.id
      WHERE group_members.group_id = $1
      `,
      [groupId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get Group Members Error:", err.message);
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
    const userId = req.user.id;

    if (
      !group_name ||
      typeof group_name !== "string" ||
      !group_name.trim()
    ) {
      return res.status(400).json({
        message: "Group name is required",
      });
    }

    const result = await pool.query(
      `UPDATE groups
       SET group_name = $1
       WHERE id = $2 AND created_by = $3
       RETURNING *`,
      [group_name.trim(), id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        message: "Only the group creator can update this group",
      });
    }

    res.json({
      message: "Group Updated Successfully",
      group: result.rows[0],
    });
  } catch (err) {
    console.error("Update Group Error:", err.message);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Delete Group
const deleteGroup = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    await client.query("BEGIN");

    const group = await client.query(
      `SELECT id FROM groups
       WHERE id = $1 AND created_by = $2
       FOR UPDATE`,
      [id, userId]
    );

    if (group.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "Only the group creator can delete this group",
      });
    }

    await client.query(
      "DELETE FROM group_members WHERE group_id = $1",
      [id]
    );

    await client.query(
      "DELETE FROM groups WHERE id = $1",
      [id]
    );

    await client.query("COMMIT");

    res.json({
      message: "Group Deleted Successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete Group Error:", err.message);

    res.status(500).json({
      message: "Server Error",
    });
  } finally {
    client.release();
  }
};

// Remove Member from Group
const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const loggedInUserId = req.user.id;

    const group = await pool.query(
      `SELECT id FROM groups
       WHERE id = $1 AND created_by = $2`,
      [groupId, loggedInUserId]
    );

    if (group.rows.length === 0) {
      return res.status(403).json({
        message: "Only the group creator can remove members",
      });
    }

    if (Number(userId) === Number(loggedInUserId)) {
      return res.status(400).json({
        message: "Group creator cannot remove themselves",
      });
    }

    const result = await pool.query(
      `DELETE FROM group_members
       WHERE group_id = $1 AND user_id = $2
       RETURNING user_id`,
      [groupId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found in this group",
      });
    }

    res.json({
      message: "Member Removed Successfully",
    });
  } catch (err) {
    console.error("Remove Member Error:", err.message);
    res.status(500).json({
      message: "Server Error",
    });
  }
};


// Add Member to Group
const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { user_id } = req.body;
    const loggedInUserId = req.user.id;

    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const group = await pool.query(
      `SELECT id FROM groups
       WHERE id = $1 AND created_by = $2`,
      [groupId, loggedInUserId]
    );

    if (group.rows.length === 0) {
      return res.status(403).json({
        message: "Only the group creator can add members",
      });
    }

    const userExists = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [user_id]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const exists = await pool.query(
      `SELECT 1 FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, user_id]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists in group",
      });
    }

    await pool.query(
      `INSERT INTO group_members(group_id, user_id)
       VALUES($1, $2)`,
      [groupId, user_id]
    );

    res.json({
      message: "Member Added Successfully",
    });
  } catch (err) {
    console.error("Add Member Error:", err.message);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Get Group Member Count
const getGroupMemberCount = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT COUNT(*)::int AS member_count
      FROM group_members gm
      WHERE gm.group_id = $1
      AND EXISTS (
        SELECT 1
        FROM group_members member_check
        WHERE member_check.group_id = $1
        AND member_check.user_id = $2
      )
      `,
      [groupId, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get Group Member Count Error:", err.message);
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
      getGroupMemberCount,

};