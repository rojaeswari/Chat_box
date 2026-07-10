import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role:"",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (!form.name.trim()) {
    alert("Please enter your name");
    return;
  }

  if (!form.email.trim()) {
    alert("Please enter your email");
    return;
  }

    const emailRegex =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|in|org|net)$/i;

if (!emailRegex.test(form.email)) {
  alert("Please enter a valid email (example: user@gmail.com)");
  return;
}
  if (!form.password.trim()) {
    alert("Please enter your password");
    return;
  }
  if (!form.role) {
  alert("Please select a role");
  return;
}

  try {
    const res = await axios.post(
      "https://chat-box-1-4g7s.onrender.com/api/auth/register",
      form
    );

    alert(res.data.message);

    setForm({
      name: "",
      email: "",
      password: "",
      role:"",
    });

  } catch (err) {
    alert(err.response?.data?.message || "Registration Failed");
  }
};



  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <label>Enter Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={form.name}
            onChange={handleChange}
          />

          <label>Enter Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={form.email}
            onChange={handleChange}
          />

          <label>Enter Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={handleChange}
          />
           <label>Select Role</label>

<select
  name="role"
  value={form.role}
  onChange={handleChange}
>
  <option value="">-- Select Role --</option>
  <option value="admin">admin</option>
  <option value="user">user</option>
</select>

          <button type="submit">Register</button>

          {/* <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p> */}
        </form>
      </div>
    </div>
  );
}

export default Register;