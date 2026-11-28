import { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import CreateGroup from "./pages/CreateGroup";
import SelectMembers from "./pages/SelectMembers";
import { App as CapacitorApp } from "@capacitor/app";
import socket from "./socket";
// import Register from "./pages/Register";
import PrivateRoute from "./PrivateRoute";



function App() {

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  const handleSessionRevoked = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    socket.disconnect();

    navigate("/login", { replace: true });

    alert("Your account was logged in on another device. Please login again.");
  };

  window.addEventListener(
    "session-revoked",
    handleSessionRevoked
  );

  return () => {
    window.removeEventListener(
      "session-revoked",
      handleSessionRevoked
    );
  };
}, [navigate]);

useEffect(() => {
  let backButtonListener;

  const setupBackButton = async () => {
    backButtonListener = await CapacitorApp.addListener(
     "backButton",
() => {
  if (location.pathname === "/chat") {
    return;
  }

  if (location.pathname === "/admin") {
    CapacitorApp.exitApp();
  } else if (
    location.pathname === "/" ||
    location.pathname === "/login"
  ) {
    CapacitorApp.exitApp();
  } else {
    navigate("/admin", { replace: true });
  }
}
    );
  };

  setupBackButton();

  return () => {
    backButtonListener?.remove();
  };
}, [location.pathname, navigate]);
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      <Route path="/manage-users" element={<PrivateRoute><ManageUsers /></PrivateRoute>}/>
      <Route path="/add-user" element={<PrivateRoute><AddUser /></PrivateRoute>} />
      <Route path="/edit-user/:id" element={<PrivateRoute><EditUser /></PrivateRoute>}/>
      <Route
  path="/change-password/:id"
  element={<PrivateRoute><ChangePassword /></PrivateRoute>}
/>
       <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path="/create-group" element={<PrivateRoute><CreateGroup /></PrivateRoute>} />
      <Route path="/select-members/:groupId" element={<PrivateRoute><SelectMembers /></PrivateRoute>}/>
     {/* <Route path="/register" element={<Register />} /> */}
    </Routes>
  );
}

export default App;