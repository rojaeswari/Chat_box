import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateGroup.css";

function CreateGroup() {
  const [groupName, setGroupName] = useState("");

  const navigate = useNavigate();

  const createGroup = async () => {
  if (!groupName.trim()) {
    alert("Please enter group name");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));

  try {
    const res = await axios.post(
      "https://chat-box-2-hyl4.onrender.com/api/groups",
      {
        group_name: groupName,
        created_by: user.id,
      }
    );

    alert("Group Created Successfully");

    navigate(`/select-members/${res.data.id}`);

  } catch (err) {
    console.log(err);
    alert("Failed to create group");
  }
};

  return (
    <div className="create-group-container">
      <h2>Create Group</h2>

      <input
        type="text"
        className="group-input"
        placeholder="Enter Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      <button
        className="create-btn"
        onClick={createGroup}
      >
        Create Group
      </button>
    </div>
  );
}

export default CreateGroup;