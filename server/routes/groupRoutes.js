const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createGroup,
  getGroups,
  addMember,
  getGroupMembers,
   updateGroup,
   deleteGroup,
    removeMember,
    getGroupMemberCount,
} = require("../controllers/groupController");




router.post("/", authMiddleware, createGroup);
router.get("/", authMiddleware, getGroups);
router.get("/:groupId/members", authMiddleware, getGroupMembers);
router.put("/:id", authMiddleware, updateGroup);
router.delete("/:id", authMiddleware, deleteGroup);
router.post("/:groupId/add-member", authMiddleware, addMember);
// router.post("/:groupId/add-member", addMember);
router.delete("/:groupId/remove-member/:userId", authMiddleware, removeMember);
router.get("/:groupId/member-count", authMiddleware, getGroupMemberCount);
module.exports = router;



