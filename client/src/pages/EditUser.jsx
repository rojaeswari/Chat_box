import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./AddUser.css";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
  });

  useEffect(() => {
    fetchUser();
  }, []);

const fetchUser = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/users/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setForm(res.data);
  } catch (err) {
    console.log(err);
  }
};

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const updateUser = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

await axios.put(
  `https://chat-box-2-hyl4.onrender.com/api/users/${id}`,
  form,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      alert("User Updated");

      navigate("/manage-users");

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="add-user">

      <h2>Edit User</h2>

      <button
  type="button"
  className="back-btn"
  onClick={() => navigate("/manage-users")}
  aria-label="Go Back"
>
  <svg viewBox="0 0 24 24" width="22" height="22"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
</button>

      <form onSubmit={updateUser}>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">
          Update User
        </button>

      </form>

    </div>
  );
}

export default EditUser;