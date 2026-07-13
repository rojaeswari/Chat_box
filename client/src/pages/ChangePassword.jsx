import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./ChangePassword.css";
// import { useParams } from "react-router-dom";

function ChangePassword() {
  const navigate = useNavigate();
  const { id } = useParams();

  // const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const changePassword = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    //  console.log("User object:", user);


    try {
    const res = await axios.put(
  `https://chat-box-1-4g7s.onrender.com/api/users/reset-password/${id}`,
  {
    newPassword: form.newPassword,
  }
);

      alert(res.data.message);

      navigate("/chat");

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

return (
  <div className="change-password">
    <form onSubmit={changePassword}>

      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New Password"
        value={form.newPassword}
        onChange={(e) =>
          setForm({ ...form, newPassword: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChange={(e) =>
          setForm({ ...form, confirmPassword: e.target.value })
        }
      />

      <button type="submit">
        Reset Password
      </button>

    </form>
  </div>
);
}

export default ChangePassword;