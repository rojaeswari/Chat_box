
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateGroup.css";

function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const createGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter group name");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

setLoading(true);

try {
  const res = await axios.post(
    "https://chat-box-2-hyl4.onrender.com/api/groups",
    {
      group_name: groupName,
      created_by: user.id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

      alert("Group Created Successfully");

      navigate(`/select-members/${res.data.id}`);
    } catch (err) {
      console.log(err);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-page">
      <div className="create-group-card">

        <div className="create-group-header">
          <button
            type="button"
            className="create-group-back"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div>
            <h2>Create Group</h2>
            <p>Create a new group for chatting</p>
          </div>
        </div>

        <div className="create-group-field">
          <label>Group Name</label>

          <input
            type="text"
            className="group-input"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        <button
          className="create-btn"
          onClick={createGroup}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Group"}
        </button>

      </div>
    </div>
  );
}

export default CreateGroup;
