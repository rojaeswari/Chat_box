
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./SelectMembers.css";

function SelectMembers() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const navigate = useNavigate();
  const { groupId } = useParams();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/users?email=${currentUser.email}`
      );
      setUsers(res.data);
    } catch (err) {
      console.log("FETCH USERS ERROR:", err);
    }
  };

  const handleSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id]
    );
  };

  const saveMembers = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one member");
      return;
    }

    if (!groupId) {
      alert("Group ID not found");
      return;
    }

    try {
      for (const userId of selectedUsers) {
        await axios.post(
          `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/add-member`,
          { user_id: userId }
        );
      }

      alert("Members Added Successfully");
      navigate("/chat");
    } catch (err) {
      console.log("ADD MEMBER ERROR:", err);
      console.log("STATUS:", err.response?.status);
      console.log("URL:", err.config?.url);
      console.log("RESPONSE:", err.response?.data);

      alert(err.response?.data?.message || "Failed to add members");
    }
  };

  return (
    <div className="member-page">
      <div className="member-container">

        <div className="member-header">
          <button
            className="member-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
          >
            <svg viewBox="0 0 24 24" width="22" height="22"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>

          <h2>Select Members</h2>
        </div>

        <p className="selected-count">
          {selectedUsers.length} member(s) selected
        </p>

        <div className="member-list">
          {users.length === 0 ? (
            <p className="no-users">No users found</p>
          ) : (
            users.map((user) => (
              <div className="member-card" key={user.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelect(user.id)}
                  />
                  <span>{user.name}</span>
                </label>
              </div>
            ))
          )}
        </div>

        <button
          className="save-btn"
          onClick={saveMembers}
          disabled={selectedUsers.length === 0}
        >
          Save Members
        </button>

      </div>
    </div>
  );
}

export default SelectMembers;
