import { useEffect, useState } from "react";
import axios from "axios";
import "./Chat.css";
import socket from "../socket";
import { useNavigate } from "react-router-dom";

function Chat() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    setUser(data);

    fetchUsers();
    fetchGroups();
  }, []);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);


  useEffect(() => {
  socket.on("receive_group_message", (data) => {
    if (
      selectedGroup &&
      selectedGroup.id === data.group_id
    ) {
      setMessages((prev) => [...prev, data]);
    }
  });

  return () => {
    socket.off("receive_group_message");
  };
}, [selectedGroup]);


  const fetchUsers = async () => {
    try {
      const data = JSON.parse(localStorage.getItem("user"));

      const res = await axios.get(
        `http://localhost:5000/api/users?email=${data.email}`
      );

      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/groups");
      setGroups(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMessages = async (receiverId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      const res = await axios.get(
        `http://localhost:5000/api/messages/${currentUser.id}/${receiverId}`
      );

      setMessages(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const renameGroup = async (id) => {
  const newName = prompt("Enter New Group Name");

  if (!newName) return;

  try {
    await axios.put(
      `http://localhost:5000/api/groups/${id}`,
      {
        group_name: newName,
      }
    );

    alert("Group Updated");

    fetchGroups();

  } catch (err) {
    console.log(err);
  }
};


const deleteGroup = async (id) => {

  if (!window.confirm("Delete this group?"))
    return;

  try {

    await axios.delete(
      `http://localhost:5000/api/groups/${id}`
    );

    alert("Group Deleted");

    fetchGroups();

  } catch (err) {
    console.log(err);
  }

};

 const sendMessage = async () => {
  if (!message.trim()) return;

  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    // Group Chat
 if (selectedGroup) {
  await axios.post("http://localhost:5000/api/group-messages", {
    group_id: selectedGroup.id,
    sender_id: currentUser.id,
    message,
  });

  socket.emit("send_group_message", {
    group_id: selectedGroup.id,
    sender_id: currentUser.id,
    name: currentUser.name,
    message,
  });

  setMessage("");
  fetchGroupMessages(selectedGroup.id);

  return;
}


    // Private Chat
    await axios.post("http://localhost:5000/api/messages", {
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      message,
    });

    socket.emit("send_message", {
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      message,
    });

    setMessage("");
    fetchMessages(selectedUser.id);

  } catch (err) {
    console.log(err);
  }
};


const fetchGroupMembers = async (groupId) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/groups/${groupId}/members`
    );

    setGroupMembers(res.data);

  } catch (err) {
    console.log(err);
  }
};


const fetchGroupMessages = async (groupId) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/group-messages/${groupId}`
    );

    setMessages(res.data);
  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className="container">

      {/* Sidebar */}
      <div className="sidebar">

        <h2>Users</h2>

        {users.length > 0 ? (
          users.map((u) => (
            <div
              key={u.id}
              className="user"
              onClick={() => {
                setSelectedUser(u);
                  setSelectedGroup(null);  
                fetchMessages(u.id);
              }}
            >
              {u.name}
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}

        <hr />

        <h2>Groups</h2>

     {groups.length > 0 ? (
  groups.map((group) => (
    <div key={group.id} className="group-item">

      <span
        className="group-name"
        onClick={() => {setSelectedGroup(group);setSelectedUser(null); fetchGroupMembers(group.id);  fetchGroupMessages(group.id);}}
      >
        {group.group_name}
      </span>

      <div className="group-actions">
        <button
          className="edit-btn"
          onClick={() => renameGroup(group.id)}
        >
          ✏️
        </button>

        <button
          className="delete-btn"
          onClick={() => deleteGroup(group.id)}
        >
          🗑️
        </button>
      </div>

    </div>     
    
))
        ) : (
          <p>No Groups Found</p>
        )}

        <button
          className="button"
          onClick={() => navigate("/create-group")}
        >
          + Create Group
        </button>

      </div>

      {/* Chat Area */}
    <div className="chatArea">

 {selectedGroup ? (
  <>
    <h2>{selectedGroup.group_name}</h2>

    <h4>Members</h4>

    {groupMembers.map((member) => (
      <p key={member.id}>{member.name}</p>
    ))}

    <div className="messages">
      {messages.map((msg) => (
        <div key={msg.id}>
          <p>
            <strong>{msg.name}</strong> : {msg.message}
          </p>
        </div>
      ))}
    </div>

  </>
) : selectedUser ? (
        <>
      <h2>Chat with {selectedUser.name}</h2>

      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id}>
            <p>
              <strong>
                {msg.sender_id === user?.id
                  ? "You"
                  : selectedUser.name}
              </strong>
              : {msg.message}
            </p>
          </div>
        ))}
      </div>
    </>
    
) : (
          <div className="messages">
            <h2>Welcome {user?.name}</h2>
            <p>Select a user to start chatting.</p>
          </div>
        )}

        <div className="inputBox">
          <input
            type="text"
            className="input"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
           disabled={!selectedUser && !selectedGroup}
          />

          <button
            className="button"
            onClick={sendMessage}
           disabled={!selectedUser && !selectedGroup}
          >
            Send
          </button>
        </div>

      </div>

    </div>
  );
}

export default Chat;