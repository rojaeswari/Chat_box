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



function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/manage-users" element={<ManageUsers />}/>
      <Route path="/add-user" element={<AddUser />} />
      <Route path="/edit-user/:id" element={<EditUser />}/>
      <Route
  path="/change-password/:id"
  element={<ChangePassword />}
/>
       <Route path="/chat" element={<Chat />} />
      <Route path="/create-group" element={<CreateGroup />} />
      <Route path="/select-members/:groupId" element={<SelectMembers />}/>
     {/* <Route path="/register" element={<Register />} /> */}
    </Routes>
  );
}

export default App;