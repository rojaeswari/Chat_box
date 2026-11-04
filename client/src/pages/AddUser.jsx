
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddUser.css";

function AddUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "https://chat-box-2-hyl4.onrender.com/api/auth/register",
        form
      );

      alert("User Created Successfully");
      navigate("/manage-users");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-page">
      <div className="add-user-card">

        <div className="add-user-header">
          <button
  type="button"
  className="back-btn"
  onClick={() => navigate("/manage-users")}
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
            <h2>Add New User</h2>
            <p>Create a new chat account</p>
          </div>
        </div>

        <form onSubmit={saveUser}>
          <div className="add-user-field">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-user-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-user-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-user-field">
            <label>User Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="save-user-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default AddUser;
