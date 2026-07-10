import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManageUsers.css";

function ManageUsers() {
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://chat-box-1-4g7s.onrender.com/api/users/all");

      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(
        `https://chat-box-1-4g7s.onrender.com/api/users/${id}`
      );

      alert("User Deleted");

      fetchUsers();

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="manage-users">

      <h1>Manage Users</h1>

      <button
        className="add-user-btn"
        onClick={() => navigate("/add-user")}
      >
        ➕ Add User
      </button>

      <div className="user-list">

        {users.map((user) => (

          <div className="user-card" key={user.id}>

            <div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <small>{user.role}</small>
            </div>

            <div>

              <button
                className="edit-btn"
                onClick={() =>
                  navigate(`/edit-user/${user.id}`)
                }
              >
                ✏️
              </button>

              <button
                className="delete-btn"
                onClick={() => deleteUser(user.id)}
              >
                🗑️
              </button>

              <button
  className="reset-btn"
  onClick={() => navigate(`/change-password/${user.id}`)}
>
  🔑 Reset Password
</button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default ManageUsers;