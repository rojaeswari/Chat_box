const express = require("express");
const router = express.Router();
const {
  createGroup,
  getGroups,
  addMember,
  getGroupMembers,
   updateGroup,
   deleteGroup,
} = require("../controllers/groupController");




router.post("/", createGroup);
router.get("/", getGroups);
router.post("/add-member", addMember);
router.get("/:groupId/members", getGroupMembers);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);
module.exports = router;



