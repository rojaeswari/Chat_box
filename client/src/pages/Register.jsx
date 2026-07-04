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

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/register",
      form
    );

    alert(res.data.message);

    setForm({
      name: "",
      email: "",
      password: "",
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

          <button type="submit">Register</button>

          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;