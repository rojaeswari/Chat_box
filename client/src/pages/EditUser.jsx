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
      const res = await axios.get(
        ` https://chat-box-1-4g7s.onrender.com/api/users/${id}`
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
      await axios.put(
        ` https://chat-box-1-4g7s.onrender.com/api/users/${id}`,
        form
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