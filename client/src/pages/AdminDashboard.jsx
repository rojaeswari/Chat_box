import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <div className="admin-box">

        <h1>Admin Dashboard</h1>

        <button
          className="admin-btn"
          onClick={() => navigate("/manage-users")}
        >
          👥 Manage Users
        </button>

        <button
          className="admin-btn"
          onClick={() => navigate("/chat")}
        >
          👥 Manage Groups
        </button>
        {/* <button
          className="admin-btn"
          onClick={() => navigate("/register")}
        >
          👥 Register
        </button> */}

      </div>
    </div>
  );
}

export default AdminDashboard;