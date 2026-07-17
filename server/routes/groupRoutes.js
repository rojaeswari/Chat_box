const express = require("express");
const router = express.Router();
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




router.post("/", createGroup);
router.get("/", getGroups);
router.get("/:groupId/members", getGroupMembers);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);
router.post("/:groupId/add-member", addMember);
// router.post("/:groupId/add-member", addMember);
router.delete("/:groupId/remove-member/:userId", removeMember);
router.get("/:groupId/member-count", getGroupMemberCount);
module.exports = router;



