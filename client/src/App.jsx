import { Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import CreateGroup from "./pages/CreateGroup";
import SelectMembers from "./pages/SelectMembers";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
       <Route path="/chat" element={<Chat />} />
      <Route path="/create-group" element={<CreateGroup />} />
      <Route path="/select-members/:groupId" element={<SelectMembers />}/>
    
    </Routes>
  );
}

export default App;