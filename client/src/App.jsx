import { Routes, Route } from "react-router-dom";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import CreateGroup from "./pages/CreateGroup";
import SelectMembers from "./pages/SelectMembers";
// import Register from "./pages/Register";
import PrivateRoute from "./PrivateRoute";



function App() {
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