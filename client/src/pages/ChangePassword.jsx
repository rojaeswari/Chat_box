
import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./ChangePassword.css";

function ChangePassword() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await axios.put(
        `https://chat-box-2-hyl4.onrender.com/api/users/reset-password/${id}`,
        {
          newPassword: form.newPassword,
        }
      );

      alert(res.data.message);
      navigate("/chat");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">

        <div className="change-password-header">
          <button
            type="button"
            className="password-back-btn"
            onClick={() => navigate(-1)}
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
            <h2>Reset Password</h2>
            <p>Create a new password for your account</p>
          </div>
        </div>

        <form onSubmit={changePassword}>
          <div className="password-field">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              required
              minLength={6}
            />
          </div>

          <div className="password-field">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="reset-password-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default ChangePassword;
