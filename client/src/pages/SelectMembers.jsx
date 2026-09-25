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

  // =====================================================
  // FETCH USERS
  // =====================================================
  const fetchUsers = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/users?email=${currentUser.email}`
      );

      console.log("USERS:", res.data);

      setUsers(res.data);
    } catch (err) {
      console.log("FETCH USERS ERROR:", err);
    }
  };

  // =====================================================
  // SELECT / UNSELECT USER
  // =====================================================
  const handleSelect = (id) => {
    setSelectedUsers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((userId) => userId !== id);
      }

      return [...prev, id];
    });
  };

  // =====================================================
  // SAVE MEMBERS
  // =====================================================
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
      console.log("Group ID:", groupId);
      console.log("Selected Users:", selectedUsers);

      for (const userId of selectedUsers) {
        console.log("Adding User:", userId);

        await axios.post(
          `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/add-member`,
          {
            user_id: userId,
          }
        );
      }

      alert("Members Added Successfully");

      navigate("/chat");

    } catch (err) {
      console.log("ADD MEMBER ERROR:", err);

      console.log("STATUS:", err.response?.status);

      console.log("URL:", err.config?.url);

      console.log("RESPONSE:", err.response?.data);

      alert(
        err.response?.data?.message ||
        "Failed to add members"
      );
    }
  };

  return (
    <div className="member-container">

      <h2>Select Members</h2>

      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="member-card"
          >
            <label>

              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleSelect(user.id)}
              />

              {user.name}

            </label>
          </div>
        ))
      )}

      <button
        className="save-btn"
        onClick={saveMembers}
        disabled={selectedUsers.length === 0}
      >
        Save Members
      </button>

    </div>
  );
}

export default SelectMembers;