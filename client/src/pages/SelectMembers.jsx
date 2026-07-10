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
        ` https://chat-box-1-4g7s.onrender.com/api/users?email=${currentUser.email}`
      );

      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelect = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const saveMembers = async () => {
    try {
      for (const userId of selectedUsers) {
        await axios.post(
          " https://chat-box-1-4g7s.onrender.com/api/groups/add-member",
          {
            group_id: groupId,
            user_id: userId,
          }
        );
      }

      alert("Members Added Successfully");

      navigate("/chat");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="member-container">

      <h2>Select Members</h2>

      {users.map((user) => (
        <div key={user.id} className="member-card">

          <label>

            <input
              type="checkbox"
              onChange={() => handleSelect(user.id)}
            />

            {user.name}

          </label>

        </div>
      ))}

      <button
        className="save-btn"
        onClick={saveMembers}
      >
        Save Members
      </button>

    </div>
  );
}

export default SelectMembers;