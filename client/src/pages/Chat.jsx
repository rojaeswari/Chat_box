import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./chat.css";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

function Chat() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const bottomRef = useRef(null);
  const [image, setImage] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [document, setDocument] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [mentionUsers, setMentionUsers] = useState([]);
  const [showMentionBox, setShowMentionBox] = useState(false);
  const [seenUsers, setSeenUsers] = useState([]);
  const [showSeenPopup, setShowSeenPopup] = useState(false);
  const [seenCounts, setSeenCounts] = useState({});
  const [memberCount, setMemberCount] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [groupUnreadCounts, setGroupUnreadCounts] = useState({});


  const navigate = useNavigate();

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));

    if (!data) {
      navigate("/login");
      return;
    }

    setUser(data);
    fetchUsers();
    fetchGroups();
  }, []);


  // useEffect(() => {
  //   const handleMessage = async (data) => {

  //     setMessages((prev) => [...prev, data]);

  //     // Only if I'm the receiver and I'm currently chatting with this sender
  //     if (
  //       data.receiver_id === user?.id &&
  //       selectedUser &&
  //       data.sender_id === selectedUser.id
  //     ) {
  //       // Delivered
  //       await axios.put(
  //         `https://chat-box-2-hyl4.onrender.com/api/messages/status/${data.id}`,
  //         {
  //           status: "delivered",
  //         }
  //       );

  //       socket.emit("message_delivered", {
  //         id: data.id,
  //         status: "delivered",
  //       });

  //       // Seen
  //       await axios.put(
  //         `https://chat-box-2-hyl4.onrender.com/api/messages/seen/${data.id}`
  //       );

  //       socket.emit("message_seen", {
  //         id: data.id,
  //         status: "seen",
  //       });
  //     }
  //   };

  //   socket.off("receive_message", handleMessage);
  //   socket.on("receive_message", handleMessage);

  //   return () => {
  //     socket.off("receive_message", handleMessage);
  //   };
  // }, [user, selectedUser]);



  // useEffect(() => {
  //   const handleMessage = async (data) => {

  //     if (!selectedUser || !user) return;

  //     const isCurrentChat =
  //       (data.sender_id === selectedUser.id &&
  //        data.receiver_id === user.id) ||

  //       (data.sender_id === user.id &&
  //        data.receiver_id === selectedUser.id);


  //     if (!isCurrentChat) {
  //       return;
  //     }

  //     setMessages((prev) => {


  //       if (prev.some(msg => msg.id === data.id)) {
  //         return prev;
  //       }

  //       return [...prev, data];
  //     });



  //     // Receiverstatus update
  //     if (
  //       data.receiver_id === user.id &&
  //       data.sender_id === selectedUser.id
  //     ) {

  //       await axios.put(
  //         `https://chat-box-2-hyl4.onrender.com/api/messages/status/${data.id}`
  //       );

  //       await axios.put(
  //         `https://chat-box-2-hyl4.onrender.com/api/messages/seen/${data.id}`
  //       );
  //     }

  //   };

  //   socket.off("receive_message");
  //   socket.on("receive_message", handleMessage);

  //   return () => {
  //     socket.off("receive_message", handleMessage);
  //   };

  // }, [user, selectedUser]);



  // // useEffect(() => {
  // //   const handleMessage = (data) => {
  // //         console.log("Received socket message:", data);
  // //     if (
  // //       selectedUser &&
  // //       (
  // //         (data.sender_id === user.id &&
  // //          data.receiver_id === selectedUser.id) ||

  // //         (data.sender_id === selectedUser.id &&
  // //          data.receiver_id === user.id)
  // //       )
  // //     ) {
  // //       setMessages(prev => {
  // //         if (prev.some(msg => msg.id === data.id)) {
  // //           return prev;
  // //         }
  // //         return [...prev, data];
  // //       });
  // //     }
  // //   };

  // //   socket.off("receive_message", handleMessage);
  // //   socket.on("receive_message", handleMessage);

  // //   return () => {
  // //     socket.off("receive_message", handleMessage);
  // //   };
  // // }, [selectedUser, user]);
  // // useEffect(() => {

  // //     const handleMessage = (data) => {

  // //         if (
  // //             selectedUser &&
  // //             data.sender_id === selectedUser.id
  // //         ) {
  // //             setMessages(prev => [...prev, data]);
  // //         }
  // //     };

  // //     socket.on("receive_message", handleMessage);

  // //     return () => socket.off("receive_message", handleMessage);

  // // }, [selectedUser]);

  //   useEffect(() => {
  //   const handleGroupMessage = async (data) => {
  //     console.log("Received:", data);

  //     if (selectedGroup?.id !== data.group_id) return;

  //     setGroupMessages((prev) => [...prev, data]);

  //     // Only receiver updates status
  //     if (data.sender_id !== user.id) {

  //       // Delivered
  //       await axios.put(
  //         `https://chat-box-2-hyl4.onrender.com/api/group-messages/status/${data.id}`
  //       );

  //       socket.emit("group_message_delivered", {
  //         id: data.id,
  //       });

  //       // Seen
  //       await axios.put(
  //         `https://chat-box-2-hyl4.onrender.com/api/group-messages/seen/${data.id}`
  //       );
  //       console.log("Received:", data);

  //       socket.emit("group_message_seen", {
  //         id: data.id,
  //       });
  //     }
  //   };

  //   socket.off("receive_group_message", handleGroupMessage);
  //   socket.on("receive_group_message", handleGroupMessage);

  //   return () => {
  //     socket.off("receive_group_message", handleGroupMessage);
  //   };
  // }, [selectedGroup, user]);



  // useEffect(() => {
  //   socket.on("message_delivered", (data) => {
  //     setMessages((prev) =>
  //       prev.map((msg) =>
  //         msg.id === data.id
  //           ? { ...msg, status: "delivered" }
  //           : msg
  //       )
  //     );
  //   });

  //   return () => {
  //     socket.off("message_delivered");
  //   };
  // }, []);

  //old handle msg

  useEffect(() => {
    const handleMessage = async (data) => {

      // if (!selectedUser || !user) return;
      if (!user) return;

      // const isCurrentChat =
      //   (data.sender_id === selectedUser.id &&
      //     data.receiver_id === user.id) ||

      //   (data.sender_id === user.id &&
      //     data.receiver_id === selectedUser.id);
      let isCurrentChat = false;

      if (selectedUser) {
        isCurrentChat =
          (data.sender_id === selectedUser.id &&
            data.receiver_id === user.id) ||

          (data.sender_id === user.id &&
            data.receiver_id === selectedUser.id);
      }

      // if (!isCurrentChat) return;
      if (!isCurrentChat) {

        if (
          data.receiver_id === user.id &&
          data.sender_id !== user.id
        ) {
          setUnreadCounts((prev) => ({
            ...prev,
            [data.sender_id]:
              (prev[data.sender_id] || 0) + 1,
          }));
        }

        return;
      }

      setMessages((prev) => {
        if (prev.some(msg => msg.id === data.id)) {
          return prev;
        }
        return [...prev, data];
      });


      // if (
      //   data.receiver_id === user.id &&
      //   data.sender_id === selectedUser.id
      // ) 
      if (
        selectedUser &&
        data.receiver_id === user.id &&
        data.sender_id === selectedUser.id
      ) {

        try {

          await axios.put(
            `https://chat-box-2-hyl4.onrender.com/api/messages/status/${data.id}`,
            {
              status: "delivered",
            }
          );

          // socket.emit("message_delivered", {
          //   id: data.id,
          //   status: "delivered",
          // });

          await axios.put(
            `https://chat-box-2-hyl4.onrender.com/api/messages/seen/${data.id}`
          );

          // socket.emit("message_seen", {
          //   id: data.id,
          //   status: "seen",
          // });

        } catch (err) {
          console.log(err);
        }

      }

    };

    socket.off("receive_message");
    socket.on("receive_message", handleMessage);

    // socket.off("unread_count");
    // socket.on("unread_count", (data) => {
    //   setUnreadCounts((prev) => ({
    //     ...prev,
    //     [data.sender_id]: data.unread_count,
    //   }));
    // })

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("unread_count");
    };

  }, [user, selectedUser]);


  // useEffect(() => {
  //   socket.on("message_seen", (data) => {
  //     setMessages((prev) =>
  //       prev.map((msg) =>
  //         msg.id === data.id
  //           ? { ...msg, status: "seen" }
  //           : msg
  //       )
  //     );
  //   });

  //   return () => {
  //     socket.off("message_seen");
  //   };
  // }, []);


  //   useEffect(() => {
  //   const handleMessage = async (data) => {

  //     if (!user) return;

  //     const isCurrentChat =
  //       selectedUser &&
  //       (
  //         (data.sender_id === selectedUser.id &&
  //           data.receiver_id === user.id) ||

  //         (data.sender_id === user.id &&
  //           data.receiver_id === selectedUser.id)
  //       );

  //     // Message belongs to another chat
  //     if (!isCurrentChat) {

  //       if (
  //         data.receiver_id === user.id &&
  //         data.sender_id !== user.id
  //       ) {
  //         setUnreadCounts((prev) => ({
  //           ...prev,
  //           [data.sender_id]:
  //             (prev[data.sender_id] || 0) + 1,
  //         }));
  //       }

  //       return;
  //     }

  //     // Prevent duplicate messages
  //     setMessages((prev) => {
  //       if (prev.some((msg) => msg.id === data.id)) {
  //         return prev;
  //       }
  //       return [...prev, data];
  //     });

  //     // Receiver opened this chat
  //     if (
  //       data.receiver_id === user.id &&
  //       data.sender_id === selectedUser.id
  //     ) {
  //       try {

  //         // Delivered
  //         await axios.put(
  //           `https://chat-box-2-hyl4.onrender.com/api/messages/status/${data.id}`,
  //           {
  //             status: "delivered",
  //           }
  //         );
  //         // socket.emit("message_delivered", {
  //         //     id: data.id,
  //         //     status: "delivered",
  //         //   });


  //         // Seen
  //         await axios.put(
  //           `https://chat-box-2-hyl4.onrender.com/api/messages/seen/${data.id}`
  //         );
  //         // socket.emit("message_seen", {
  //         //     id: data.id,
  //         //     status: "seen",
  //         //   });


  //       } catch (err) {
  //         console.log(err);
  //       }
  //     }
  //   };

  //   socket.off("receive_message");
  //   socket.on("receive_message", handleMessage);

  //   return () => {
  //     socket.off("receive_message", handleMessage);
  //   };

  // }, [user, selectedUser]);


  // useEffect(() => {
  //   const handleSeen = (data) => {
  //     console.log("Received message_seen:", data);

  //     setMessages((prev) =>
  //       prev.map((msg) =>
  //         msg.id === data.id
  //           ? { ...msg, status: "seen" }
  //           : msg
  //       )
  //     );
  //   };

  //   socket.on("message_seen", handleSeen);

  //   return () => {
  //     socket.off("message_seen", handleSeen);
  //   };
  // }, []);
  useEffect(() => {
    const handleSeen = (data) => {
      console.log("Received message_seen:", data);

      setMessages((prev) => {
        console.log("Before:", prev);

        const updated = prev.map((msg) =>
          Number(msg.id) === Number(data.id)
            ? { ...msg, status: "seen" }
            : msg
        );

        console.log("After:", updated);

        return updated;
      });
    };

    socket.on("message_seen", handleSeen);

    return () => {
      socket.off("message_seen", handleSeen);
    };
  }, []);


  useEffect(() => {

    socket.on("group_message_delivered", (data) => {

      setGroupMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.id
            ? { ...msg, status: "delivered" }
            : msg
        )
      );

    });

    return () =>
      socket.off("group_message_delivered");

  }, []);



  // useEffect(() => {
  //     socket.on("group_message_seen", (data) => {
  //         console.log("Received group_message_seen:", data);

  //         setGroupMessages((prev) =>
  //             prev.map((msg) =>
  //                 msg.id === data.id
  //                     ? { ...msg, status: "seen" }
  //                     : msg
  //             )
  //         );
  //     });

  //     return () => socket.off("group_message_seen");
  // }, []);



  useEffect(() => {
    const handleGroupSeen = (data) => {
      console.log("Received group_message_seen:", data);

      setGroupMessages((prev) =>
        prev.map((msg) =>
          Number(msg.id) === Number(data.id)
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    };

    socket.on("group_message_seen", handleGroupSeen);

    return () => {
      socket.off("group_message_seen", handleGroupSeen);
    };
  }, []);

  // useEffect(() => {
  //   if (user) {
  //     socket.emit("join", user.id);
  //   }
  // }, []);


  useEffect(() => {
    if (!user) return;

    console.log("Joining room:", user.id);

    socket.emit("join", user.id);

  }, [user]);

  useEffect(() => {
    const handleSeenUpdate = (data) => {
      console.log("group_message_seen_update:", data);

      fetchSeenCount(data.message_id);

      setGroupMessages((prev) =>
        prev.map((msg) =>
          Number(msg.id) === Number(data.message_id)
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    };

    socket.on("group_message_seen_update", handleSeenUpdate);

    return () => {
      socket.off("group_message_seen_update", handleSeenUpdate);
    };
  }, []);


  // useEffect(() => {

  //   socket.on("mention_notification", (data) => {

  //     alert(`${data.sender_name} mentioned you`);

  //   });

  //   return () => {
  //     socket.off("mention_notification");
  //   };

  // }, []);


  useEffect(() => {
    const handleMention = (data) => {
      console.log("Mention received:", data);

      if (Notification.permission === "granted") {
        new Notification("Chat Box", {
          body: `${data.sender_name} mentioned you`,
          icon: "/chat.png",
        });
      }

      alert(`${data.sender_name} mentioned you`);
    };

    socket.on("mention_notification", handleMention);

    return () => {
      socket.off("mention_notification", handleMention);
    };
  }, []);

  // useEffect(() => {

  //   if (Notification.permission !== "granted") {
  //     Notification.requestPermission();
  //   }

  //   socket.on("mention_notification", (data) => {

  //     if (Notification.permission === "granted") {

  //       new Notification(`${data.sender_name} mentioned you`, {
  //         body: data.message,
  //       });

  //     }

  //   });

  //   return () => socket.off("mention_notification");

  // }, []);

  // useEffect(() => {
  //   if ("Notification" in window) {
  //     Notification.requestPermission();
  //   }
  // }, []);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log(permission);
      });
    }
  }, []);





  useEffect(() => {
    if (!selectedGroup || !user) return;

    groupMessages.forEach(async (msg) => {


      if (msg.sender_id === user.id) return;

      try {
        await axios.post(
          "https://chat-box-2-hyl4.onrender.com/api/group-messages/seen",
          {
            message_id: msg.id,
            user_id: user.id,
            group_id: selectedGroup.id,
          }
        );
      } catch (err) {
        console.log(err);
      }

    });

  }, [groupMessages, selectedGroup, user]);

  useEffect(() => {
    if (selectedGroup) {
      socket.emit("join_group", selectedGroup.id);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedGroup) {
      fetchMemberCount(selectedGroup.id);
    }
  }, [selectedGroup]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, groupMessages]);

  useEffect(() => {
    fetchUnreadCounts();
  }, []);

  useEffect(() => {
    fetchGroupUnreadCounts();
  }, []);

  useEffect(() => {

    const handleGroupUnread = (data) => {

      setGroupUnreadCounts((prev) => ({
        ...prev,
        [data.group_id]: data.unread_count,
      }));

    };

    socket.on("group_unread_count", handleGroupUnread);

    return () => {
      socket.off("group_unread_count", handleGroupUnread);
    };

  }, []);

  useEffect(() => {
  const handleGroupMessage = (data) => {

    if (!selectedGroup) return;

    // Current opened group மட்டும் update ஆகணும்
    if (Number(data.group_id) !== Number(selectedGroup.id)) {
      return;
    }

    setGroupMessages((prev) => {
      // Duplicate avoid
      if (prev.some((msg) => Number(msg.id) === Number(data.id))) {
        return prev;
      }

      return [...prev, data];
    });
  };

  socket.on("receive_group_message", handleGroupMessage);

  return () => {
    socket.off("receive_group_message", handleGroupMessage);
  };
}, [selectedGroup]);


  const fetchUsers = async () => {
    try {
      const data = JSON.parse(localStorage.getItem("user"));

      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/users?email=${data.email}`
      );

      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

   const getDownloadUrl = (url) => {
    return url.replace("/upload/", "/upload/fl_attachment/");
  };

  // const fetchGroups = async () => {
  //   try {
  //     const res = await axios.get("https://chat-box-2-hyl4.onrender.com/api/groups");
  //     setGroups(res.data);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const fetchGroups = async () => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("user")
      );

      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/groups?userId=${currentUser.id}`
      );

      setGroups(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  const fetchGroupUnreadCounts = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/group-messages/unread/${currentUser.id}`
      );

      const counts = {};

      res.data.forEach((row) => {
        counts[row.group_id] = Number(row.unread_count);
      });

      setGroupUnreadCounts(counts);

    } catch (err) {
      console.log(err);
    }
  };

  // const fetchMessages = async (receiverId) => {
  //   try {
  //     const currentUser = JSON.parse(localStorage.getItem("user"));

  //     const res = await axios.get(
  //       `https://chat-box-2-hyl4.onrender.com/api/messages/${currentUser.id}/${receiverId}`
  //     );

  //     //     // Update delivered status
  //     //    for (const msg of res.data) {
  //     //   if (
  //     //     msg.receiver_id === currentUser.id &&
  //     //     msg.status === "sent"
  //     //   ) {
  //     //     await axios.put(
  //     //       `https://chat-box-2-hyl4.onrender.com/api/messages/status/${msg.id}`,
  //     //       {
  //     //         status: "delivered",
  //     //       }
  //     //     );

  //     //     socket.emit("message_delivered", {
  //     //       id: msg.id,
  //     //       status: "delivered",
  //     //     });

  //     //     msg.status = "delivered";
  //     //   }
  //     // }

  //     // for (const msg of res.data) {
  //     //    console.log("Checking Seen:", msg);

  //     //   if (
  //     //     msg.receiver_id === currentUser.id &&
  //     //     msg.status === "delivered"
  //     //   ) {

  //     //     await axios.put(
  //     //       `https://chat-box-2-hyl4.onrender.com/api/messages/seen/${msg.id}`
  //     //     );

  //     //     // socket.emit("message_seen", {
  //     //     //   id: msg.id,
  //     //     //   status: "seen",
  //     //     // });

  //     //     msg.status = "seen";
  //     //   }
  //     // }
  //     setMessages(res.data);

  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
  const fetchMessages = async (receiverId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/messages/${currentUser.id}/${receiverId}`
      );

      for (const msg of res.data) {

        if (
          msg.receiver_id === currentUser.id &&
          msg.status === "sent"
        ) {

          await axios.put(
            `https://chat-box-2-hyl4.onrender.com/api/messages/status/${msg.id}`,
            {
              status: "delivered",
            }
          );

          msg.status = "delivered";
        }

        if (
          msg.receiver_id === currentUser.id &&
          msg.status === "delivered"
        ) {

          await axios.put(
            `https://chat-box-2-hyl4.onrender.com/api/messages/seen/${msg.id}`
          );

          msg.status = "seen";
        }
      }

      setMessages(res.data);

    } catch (err) {
      console.log(err);
    }
  };



  const fetchUnreadCounts = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/messages/unread/${currentUser.id}`
    );

    const counts = {};

    res.data.forEach((row) => {
      counts[row.sender_id] = Number(row.unread_count);
    });

    setUnreadCounts(counts);
  };

  const renameGroup = async (id) => {
    const newName = prompt("Enter New Group Name");

    if (!newName) return;

    try {
      await axios.put(
        `https://chat-box-2-hyl4.onrender.com/api/groups/${id}`,
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
        `https://chat-box-2-hyl4.onrender.com/api/groups/${id}`
      );

      alert("Group Deleted");

      fetchGroups();

    } catch (err) {
      console.log(err);
    }

  };

  const handleGroupMessageChange = (e) => {

    const value = e.target.value;

    setMessage(value);

    if (!selectedGroup) return;

    const lastWord = value.split(" ").pop();

    if (lastWord.startsWith("@")) {

      const search = lastWord.substring(1).toLowerCase();

      const filtered = groupMembers.filter((member) =>
        member.name.toLowerCase().includes(search)
      );

      setMentionUsers(filtered);
      setShowMentionBox(true);

    } else {

      setMentionUsers([]);
      setShowMentionBox(false);

    }
  };


  const sendMessage = async () => {
    if (!message.trim() && !image && !document) return;
    console.log(image);

    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      let imageName = "";

      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const uploadRes = await axios.post(
          "https://chat-box-2-hyl4.onrender.com/api/messages/upload",
          formData
        );

        imageName = uploadRes.data.image;

        console.log(uploadRes.data);
      }

      let documentName = "";

      if (document) {
        const formData = new FormData();
        formData.append("image", document);

        const res = await axios.post(
          "https://chat-box-2-hyl4.onrender.com/api/messages/upload",
          formData
        );

        console.log("Document upload response:", res.data);

        documentName = res.data.image;
      }

      // Group Chat
      if (selectedGroup) {
        await axios.post("https://chat-box-2-hyl4.onrender.com/api/group-messages", {
          group_id: selectedGroup.id,
          sender_id: currentUser.id,
          message,
          image: imageName,
          document: documentName
        });

        // socket.emit("send_group_message", {
        //   group_id: selectedGroup.id,
        //   sender_id: currentUser.id,
        //   name: currentUser.name,
        //   message,
        //   image: imageName,
        //    document:documentName
        // });

        setMessage("");
        setImage(null);
        setDocument(null);
        // fetchGroupMessages(selectedGroup.id);

        return;
      }


      // Private Chat
      if (!selectedUser?.id) return;
      await axios.post("https://chat-box-2-hyl4.onrender.com/api/messages", {
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        message,
        image: imageName,
        document: documentName
      });


      // socket.emit("send_message", {
      //   sender_id: currentUser.id,
      //   receiver_id: selectedUser.id,
      //   message,
      //     image: imageName,
      //      document:documentName
      // });



      setMessage("");
      setImage(null);
      setDocument(null);
      // fetchMessages(selectedUser.id);

    } catch (err) {
      console.log(err);
    }
  };


  const fetchGroupMembers = async (groupId) => {
    try {
      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/members`
      );

      setGroupMembers(res.data);

    } catch (err) {
      console.log(err);
    }
  };


  const fetchGroupMessages = async (groupId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/group-messages/${groupId}`
      );

      // Delivered
      for (const msg of res.data) {
        if (
          msg.sender_id !== currentUser.id &&
          msg.status === "sent"
        ) {

          await axios.put(
            `https://chat-box-2-hyl4.onrender.com/api/group-messages/status/${msg.id}`,
            {
              status: "delivered",
            }
          );

          // socket.emit("group_message_delivered", {
          //   id: msg.id,
          //   status: "delivered",
          // });

          msg.status = "delivered";
        }
      }

      // Seen
      for (const msg of res.data) {

        if (
          msg.sender_id !== currentUser.id &&
          msg.status === "delivered"
        ) {

          await axios.put(
            `https://chat-box-2-hyl4.onrender.com/api/group-messages/seen/${msg.id}`
          );

          // socket.emit("group_message_seen", {
          //   id: msg.id,
          //   status: "seen",
          // });

          msg.status = "seen";
        }
      }

      setGroupMessages(res.data);
      res.data.forEach((msg) => {
        fetchSeenCount(msg.id);
      });

    } catch (err) {
      console.log(err);
    }
  };

  const fetchSeenCount = async (messageId) => {
    try {

      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/group-messages/seen-count/${messageId}`
      );

      setSeenCounts((prev) => ({
        ...prev,
        [messageId]: res.data.seen_count,
      }));

    } catch (err) {
      console.log(err);
    }
  };

  const fetchMemberCount = async (groupId) => {
    try {
      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/member-count`
      );

      setMemberCount(res.data.member_count);

    } catch (err) {
      console.log(err);
    }
  };

  const openSeenPopup = async (messageId) => {
    try {
      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/group-messages/seen/${messageId}`
      );

      setSeenUsers(res.data);
      setShowSeenPopup(true);

    } catch (err) {
      console.log(err);
    }
  };

  const removeMember = async (groupId, userId) => {
    try {
      await axios.delete(
        `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/remove-member/${userId}`
      );

      alert("Member Removed");

      fetchGroupMembers(groupId);

    } catch (err) {
      console.log(err);
    }
  };


  const addMember = async (groupId, userId) => {
    try {
      await axios.post(
        `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/add-member`,
        {
          user_id: userId,
        }
      );

      alert("Member Added Successfully");

      // Refresh Members
      fetchGroupMembers(groupId);

      // Refresh Available Users
      fetchAvailableUsers(groupId);

    } catch (err) {
      console.log(err);
    }
  };

  const fetchAvailableUsers = async (groupId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      const res = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/users?email=${currentUser.email}`
      );
      const members = await axios.get(
        `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/members`
      );

      const memberIds = members.data.map((m) => m.id);

      const filteredUsers = res.data.filter(
        (u) => !memberIds.includes(u.id)
      );

      setAvailableUsers(filteredUsers);

    } catch (err) {
      console.log(err);
    }
  };


  const deleteMessage = async (id) => {
    try {
      if (!window.confirm("Delete this message?")) return;

      if (selectedGroup) {
        await axios.delete(
          `https://chat-box-2-hyl4.onrender.com/api/group-messages/${id}`,
          {
            data: {
              user_id: user.id,
            },
          }
        );

        fetchGroupMessages(selectedGroup.id);
      } else {
        await axios.delete(
          `https://chat-box-2-hyl4.onrender.com/api/messages/${id}`,
          {
            data: {
              user_id: user.id,
            },
          }
        );

        fetchMessages(selectedUser.id);
      }

    } catch (err) {
      console.log(err);
    }
  };

  const handleGroupSeen = (data) => {
    console.log("Seen Event:", data);

    setGroupMessages((prev) => {
      const updated = prev.map((msg) => {
        if (Number(msg.id) === Number(data.id)) {
          console.log("Updating message:", msg.id);
          return {
            ...msg,
            status: "seen",
          };
        }

        return msg;
      });

      console.log(updated);

      return updated;
    });
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
                setMessages([]);
                setSelectedUser(u);
                setSelectedGroup(null);
                setUnreadCounts((prev) => ({
                  ...prev,
                  [u.id]: 0,
                }));

                fetchMessages(u.id);
              }}
            >
              {/* {u.name} */}
              <span>{u.name}</span>

              {unreadCounts[u.id] > 0 && (
                <span className="unread-badge">
                  {unreadCounts[u.id]}
                </span>
              )}
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

              {/* <span
                className="group-name"
                onClick={() => {
                  setGroupMessages([]);
                  setSelectedGroup(group);
                  setSelectedUser(null);
                  socket.emit("join_group", group.id);
                  fetchGroupMembers(group.id);
                  fetchGroupMessages(group.id);
                  fetchAvailableUsers(group.id);
                  setGroupUnreadCounts((prev) => ({
                    ...prev,
                    [group.id]: 0,
                  }));
                }}
              >
                {group.group_name}
              </span> */}

              <div
                className="group-name"
                onClick={() => {
                  setGroupMessages([]);
                  setSelectedGroup(group);
                  setSelectedUser(null);

                  socket.emit("join_group", group.id);

                  fetchGroupMembers(group.id);
                  fetchGroupMessages(group.id);
                  fetchAvailableUsers(group.id);

                  setGroupUnreadCounts((prev) => ({
                    ...prev,
                    [group.id]: 0,
                  }));
                }}
              >
                <span>{group.group_name}</span>

                {groupUnreadCounts[group.id] > 0 && (
                  <span className="unread-badge">
                    {groupUnreadCounts[group.id]}
                  </span>
                )}
              </div>


              {user?.role === "admin" && (
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
              )}
            </div>

          ))
        ) : (
          <p>No Groups Found</p>
        )}

        {user?.role === "admin" && (
          <button
            className="button"
            onClick={() => navigate("/create-group")}
          >
            + Create Group
          </button>
        )}

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>

      </div>

      {/* Chat Area */}
      <div className="chatArea">
        {/* <h3>Role : {user?.role}</h3> */}

        {selectedGroup ? (
          <>
            <h2>{selectedGroup.group_name}</h2>

            <div className="group-chat-container">

              {/* Left Panel */}
              <div className="group-left">

                <h4>Members</h4>

                <div className="members-list">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="member-row">

                      <span>{member.name}</span>

                      {user?.role === "admin" && (
                        <button
                          className="remove-btn"
                          onClick={() =>
                            removeMember(selectedGroup.id, member.id)
                          }
                        >
                          Remove
                        </button>
                      )}

                    </div>
                  ))}
                </div>

                {user?.role === "admin" && (
                  <>
                    <h4>Available Users</h4>

                    <div className="members-list">
                      {availableUsers.map((u) => (
                        <div key={u.id} className="member-row">

                          <span>{u.name}</span>

                          <button
                            className="add-btn"
                            onClick={() =>
                              addMember(selectedGroup.id, u.id)
                            }
                          >
                            Add
                          </button>

                        </div>
                      ))}
                    </div>
                  </>
                )}

              </div>

              {/* Right Panel */}
              <div className="messages">

                {groupMessages.map((msg, index) => (
                  <div
                    key={`${msg.id}-${index}`}
                    className={`message ${msg.sender_id === user?.id
                      ? "sent"
                      : "received"
                      }`}

                    onClick={() => {
                      if (msg.sender_id === user?.id) {
                        openSeenPopup(msg.id);
                      }
                    }}
                  >

                    <strong>
                      {msg.sender_id === user?.id
                        ? "You"
                        : msg.name}
                    </strong>

                    {msg.message && (
                      /^https?:\/\//.test(msg.message) ? (
                        <a
                          href={msg.message}
                          target="_blank"
                          rel="noreferrer"
                          className="document-link"
                        >
                          🔗 Open Document
                        </a>
                      ) : (
                        <p>{msg.message}</p>
                      )
                    )}

                 
                    {/* {msg.image && (
                      <img
                        src={
                          msg.image.startsWith("http")
                            ? msg.image
                            : `https://chat-box-2-hyl4.onrender.com/uploads/${msg.image}`
                        }
                        alt=""
                        className="chat-image"
                      />
                    )} */}

                    {msg.image && (
  <>
    <PhotoProvider>
      <PhotoView
        src={
          msg.image.startsWith("http")
            ? msg.image
            : `https://chat-box-2-hyl4.onrender.com/uploads/${msg.image}`
        }
      >
        <img
          src={
            msg.image.startsWith("http")
              ? msg.image
              : `https://chat-box-2-hyl4.onrender.com/uploads/${msg.image}`
          }
          alt=""
          className="chat-image"
          style={{ cursor: "zoom-in" }}
        />
      </PhotoView>
    </PhotoProvider>

    {/* <a
      href={
        msg.image.startsWith("http")
          ? msg.image
          : `https://chat-box-2-hyl4.onrender.com/uploads/${msg.image}`
      }
      download
      className="download-image-btn"
    >
      ⬇ Download
    </a> */}
    <button
  className="download-image-btn"
  onClick={() => {
    const imageUrl = msg.image.startsWith("http")
      ? getDownloadUrl(msg.image)
      : `https://chat-box-2-hyl4.onrender.com/download/${msg.image}`;

    window.open(imageUrl, "_blank");
  }}
>
  ⬇ Download
</button>
  </>
)}

                    {msg.document && (
                      <a
                        href={
                          msg.document.startsWith("http")
                            ? msg.document
                            : `https://chat-box-2-hyl4.onrender.com/uploads/${msg.document}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="document-link"
                      >
                        📄 Open Document
                      </a>
                    )}


                    {msg.sender_id === user?.id && (
                      <button
                        className="delete-btn"
                        onClick={() => deleteMessage(msg.id)}
                      >
                        Delete
                      </button>
                    )}

                    {/* <div className="status">
  {msg.status === "sent" && (
    <span>✓ Sent</span>
  )}

  {msg.status === "delivered" && (
    <span>✓✓ Delivered</span>
  )}

  {msg.status === "seen" && (
    <span className="seen-status">
      ✓✓ Seen
    </span>
  )}
</div> */}


                    {msg.sender_id === user?.id && (
                      <div className="status">
                        {msg.status === "sent" && (
                          <span>✓ Sent</span>
                        )}

                        {/* {msg.status === "delivered" && (
      <span>✓✓ Delivered</span>
    )}

    {msg.status === "seen" && (
      // <span className="seen-status">
      //   ✓✓ Seen
      // </span>
      <span
  className="seen-status"
  onClick={() => openSeenPopup(msg.id)}
>
  👁 Seen ({seenCounts[msg.id] || 0})
</span>
    )}
  </div>
)} 
 */}

                        {msg.status === "seen" && (
                          seenCounts[msg.id] >= memberCount - 1 ? (
                            <span className="seen-status">
                              🔵 ✓✓ Seen
                            </span>
                          ) : (
                            <span>
                              ✓✓ Delivered
                            </span>
                          )
                        )}

                      </div>
                    )}


                  </div>
                ))}
                <div ref={bottomRef}></div>

              </div>

            </div>
          </>

          // private chat
        ) : selectedUser ? (
          <>
            <h2>Chat with {selectedUser.name}</h2>

            <div className="messages">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.id}-${index}`}
                  className={`message ${msg.sender_id === user?.id ? "sent" : "received"
                    }`}
                >
                  <strong>
                    {msg.sender_id === user?.id ? "You" : msg.name}
                  </strong>

                  {msg.message && (
                    /^https?:\/\//.test(msg.message) ? (
                      <a
                        href={msg.message}
                        target="_blank"
                        rel="noreferrer"
                        className="document-link"
                      >
                        🔗 Open Document
                      </a>
                    ) : (
                      <p>{msg.message}</p>
                    )
                  )}

                  {/* {msg.image && (
                    <img
                      src={
                        msg.image.startsWith("http")
                          ? msg.image
                          : `https://chat-box-2-hyl4.onrender.com/uploads/${msg.image}`
                      }
                      alt="Group"
                      className="chat-image"
                    />
                  )} */}

                 {msg.image && (
  <>
    <PhotoProvider>
      <PhotoView
        src={
          msg.image.startsWith("http")
            ? msg.image
            : `https://chat-box-2-hyl4.onrender.com/uploads/${msg.image}`
        }
      >
        <img
          src={
            msg.image.startsWith("http")
              ? msg.image
              : `https://chat-box-2-hyl4.onrender.com/uploads/${msg.image}`
          }
          alt=""
          className="chat-image"
          style={{ cursor: "zoom-in" }}
        />
      </PhotoView>
    </PhotoProvider>

    <a
      href={
        msg.image.startsWith("http")
          ? msg.image
          : `https://chat-box-2-hyl4.onrender.com/uploads/${msg.image}`
      }
      download
      className="download-image-btn"
    >
      ⬇ Download
    </a>
  </>
)}

                  {/* {msg.document && (
  <a
    href={`https://chat-box-2-hyl4.onrender.com/uploads/${msg.document}`}
    target="_blank"
    rel="noreferrer"
    className="document-link"
  >
    📄 {msg.document}
  </a>
)} */}

                  {msg.document && (
                    <a
                      href={
                        msg.document.startsWith("http")
                          ? msg.document
                          : `https://chat-box-1-4g7s.onrender.com/uploads/${msg.document}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="document-link"
                    >
                      📄 Open Document
                    </a>
                  )}

                  {msg.sender_id === user?.id && (
                    <button
                      className="delete-btn"
                      onClick={() => deleteMessage(msg.id)}
                    >
                      Delete
                    </button>
                  )}

                  {/* <div className="status">
  {msg.status === "sent" && (
    <span>✓ Sent</span>
  )}

  {msg.status === "delivered" && (
    <span>✓✓ Delivered</span>
  )}

  {msg.status === "seen" && (
    <span className="seen-status">
      ✓✓ Seen
    </span>
  )}
</div> */}

                  {msg.sender_id === user?.id && (
                    <div className="status">
                      {msg.status === "sent" && (
                        <span>✓ Sent</span>
                      )}

                      {msg.status === "delivered" && (
                        <span>✓✓ Delivered</span>
                      )}

                      {msg.status === "seen" && (
                        <span className="seen-status">
                          ✓✓ Seen
                        </span>
                      )}
                    </div>
                  )}

                </div>
              ))}

              <div ref={bottomRef}></div>
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
            onChange={
              selectedGroup
                ? handleGroupMessageChange
                : (e) => setMessage(e.target.value)
            }

            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={!selectedUser && !selectedGroup}
          />
          {selectedGroup && showMentionBox && (
            <div className="mention-box">
              {mentionUsers.map((member) => (
                <div
                  key={member.id}
                  className="mention-item"
                  onClick={() => {
                    const words = message.split(" ");
                    words[words.length - 1] = `@${member.name}`;
                    setMessage(words.join(" ") + " ");
                    setShowMentionBox(false);
                  }}
                >
                  {member.name}
                </div>
              ))}
            </div>
          )}

          <label htmlFor="imageUpload" className="file-btn">
            📷 Choose Image
          </label>

          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="file-input"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <label htmlFor="docUpload" className="file-btn">
            📄 Document
          </label>

          <input
            id="docUpload"
            type="file"
            className="file-input"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={(e) => setDocument(e.target.files[0])}
          />

          {image && (
            <div className="selected-file">
              📷 {image.name}
              <button onClick={() => setImage(null)}>
                ✖
              </button>
            </div>
          )}

          {document && (
            <div className="selected-file">
              📄 {document.name}
              <button onClick={() => setDocument(null)}>
                ✖
              </button>
            </div>
          )}

          <button
            className="link-btn"
            onClick={() => {
              const link = prompt("Paste Document Link");
              if (link) setMessage(link);
            }}
          >
            🔗 Link
          </button>

          <button
            className="button"
            onClick={sendMessage}
            disabled={!selectedUser && !selectedGroup}
          >
            Send
          </button>

          {/* <button
            onClick={() =>  navigate(`/change-password/${user.id}`)}
          >
            Change Password
          </button> */}
        </div>

        {showSeenPopup && (
          <div className="seen-popup">
            <div className="seen-popup-content">

              <h3>Seen By ({seenUsers.length})</h3>

              {seenUsers.length === 0 ? (
                <p>No one has seen this message yet.</p>
              ) : (
                seenUsers.map((u) => (
                  <div key={u.id} className="seen-user">
                    <strong>✓ {u.name}</strong>
                    <br />
                    <small>
                      {new Date(u.seen_at).toLocaleTimeString()}
                    </small>
                  </div>
                ))
              )}

              <button onClick={() => setShowSeenPopup(false)}>
                Close
              </button>

            </div>
          </div>
        )}


      </div>

    </div>
  );
}

export default Chat;