
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
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "https://chat-box-2-hyl4.onrender.com/api/users/all",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUsers(res.data);
  } catch (err) {
    console.log(err);
  }
};


  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
     await axios.delete(
  `https://chat-box-2-hyl4.onrender.com/api/users/${id}`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

      alert("User Deleted");
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="manage-users-page">
      <div className="manage-users-container">

        <div className="manage-users-header">
          <button
            type="button"
            className="manage-back-btn"
            onClick={() => navigate("/admin")}
            aria-label="Go Back"
          >
            <svg viewBox="0 0 24 24" width="22" height="22"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div>
            <h1>Manage Users</h1>
            <p>Manage your chat users</p>
          </div>
        </div>

        <button
          className="add-user-btn"
          onClick={() => navigate("/add-user")}
        >
          + Add User
        </button>

        <div className="user-list">
          {users.map((user) => (
            <div className="user-card" key={user.id}>

              <div className="user-info">
                <div className="user-avatar">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>

                <div className="user-details">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>

              <div className="user-actions">
                <div className="user-icon-actions">
                  <button
                    className="edit-btn"
                    aria-label="Edit User"
                    onClick={() =>
                      navigate(`/edit-user/${user.id}`)
                    }
                  >
                    ✏️
                  </button>

                  <button
                    className="delete-btn"
                    aria-label="Delete User"
                    onClick={() => deleteUser(user.id)}
                  >
                    🗑️
                  </button>
                </div>

                <button
  className="reset-btn"
  onClick={() =>
    navigate(`/change-password/${user.id}`)
  }
>
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="8" cy="15" r="4" />
    <path d="m10.85 12.15 8.15-8.15 2 2-2 2 2 2-2 2-2-2-2 2" />
  </svg>
  Reset Password
</button>
              </div>

            </div>
          ))}

          {users.length === 0 && (
            <p className="no-users">No users found</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default ManageUsers;
