import { useEffect, useState, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Contacts } from "@capacitor-community/contacts";
import axios from "axios";
import "./chat.css";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { App as CapacitorApp } from "@capacitor/app";

function Chat() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const bottomRef = useRef(null);
  const [image, setImage] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [document, setDocument] = useState(null);
  const [video, setVideo] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [mentionUsers, setMentionUsers] = useState([]);
  const [showMentionBox, setShowMentionBox] = useState(false);
  const [seenUsers, setSeenUsers] = useState([]);
  const [showSeenPopup, setShowSeenPopup] = useState(false);
  const [seenCounts, setSeenCounts] = useState({});
  const [memberCount, setMemberCount] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [groupUnreadCounts, setGroupUnreadCounts] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [audio, setAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState("users");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactPhone, setContactPhone] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);


  const navigate = useNavigate();

  const getAuthenticatedFileUrl = async (messageId, field, isGroup = false) => {
  try {
    const token = localStorage.getItem("token");

    const endpoint = isGroup
      ? "group-messages"
      : "messages";

    const response = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/${endpoint}/private-file/${messageId}/${field}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.url;
  } catch (error) {
    console.error("Private file URL error:", error);
    return null;
  }
};


const loadDeviceContacts = async () => {

 if (!Capacitor.isNativePlatform()) {
  // Browser Contact Picker API
  if (navigator.contacts && navigator.contacts.select) {
    try {
      const contacts = await navigator.contacts.select(
        ["name", "tel"],
        { multiple: false }
      );

      if (!contacts.length) return;

      setSelectedContact(contacts[0].name?.[0] || "Contact");
      setContactPhone(contacts[0].tel?.[0] || "");
    } catch (error) {
      console.error("Web contact picker error:", error);
      alert("Unable to select contact");
    }
  } else {
    // Manual fallback
    const name = prompt("Enter contact name:");
    if (!name) return;

    const phone = prompt("Enter phone number:");
    if (!phone) return;

    setSelectedContact(name);
    setContactPhone(phone);
  }

  return;
}
  try {
    const permission = await Contacts.checkPermissions();

    if (
      permission.contacts !== "granted" &&
      permission.contacts !== "limited"
    ) {
      const requested = await Contacts.requestPermissions();

      if (
        requested.contacts !== "granted" &&
        requested.contacts !== "limited"
      ) {
        alert("Contacts permission denied");
        return;
      }
    }

    const result = await Contacts.getContacts({
      projection: {
        name: true,
        phones: true,
      },
    });

    setDeviceContacts(result.contacts || []);
    setShowContactPicker(true);
  } catch (error) {
  console.error("Load contacts error:", error);
  alert("Contacts Error: " + (error?.message || String(error)));
}
};


const shareCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("Location is not supported on this device");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setSelectedLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      console.error("Location error:", error);
      alert("Unable to get location. Please allow location permission.");
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );
};


const getGroupFileUrl = (msg, field) => {
  if (msg[`${field}_delivery_type`] === "authenticated") {
    return privateFileUrls[`group-${msg.id}-${field}`] || "";
  }

  const fileUrl = msg[field];

  if (!fileUrl) return "";

  return fileUrl.startsWith("http")
    ? fileUrl
    : `https://chat-box-2-hyl4.onrender.com/uploads/${fileUrl}`;
};


const getPrivateFileUrl = (msg, field) => {
  if (msg[`${field}_delivery_type`] === "authenticated") {
    return privateFileUrls[`private-${msg.id}-${field}`] || "";
  }

  const fileUrl = msg[field];

  if (!fileUrl) return "";

  return fileUrl.startsWith("http")
    ? fileUrl
    : `https://chat-box-2-hyl4.onrender.com/uploads/${fileUrl}`;
};

const [privateFileUrls, setPrivateFileUrls] = useState({});


useEffect(() => {
  let cancelled = false;

  const loadPrivateFileUrls = async () => {
    const urlMap = {};

    const loadForMessages = async (messageList, isGroup) => {
      for (const msg of messageList) {
        const fields = ["image", "document", "video", "audio"];

        for (const field of fields) {
          if (msg[`${field}_delivery_type`] === "authenticated") {
            const url = await getAuthenticatedFileUrl(
              msg.id,
              field,
              isGroup
            );

            if (url) {
              urlMap[`${isGroup ? "group" : "private"}-${msg.id}-${field}`] =
                url;
            }
          }
        }
      }
    };

    await Promise.all([
      loadForMessages(messages, false),
      loadForMessages(groupMessages, true),
    ]);

    if (!cancelled) {
      setPrivateFileUrls((prev) => ({ ...prev, ...urlMap }));
    }
  };

  loadPrivateFileUrls();

  return () => {
    cancelled = true;
  };
}, [messages, groupMessages]);

  
const logout = () => {
  if (window.confirm("Are you sure you want to logout?")) {
    socket.disconnect();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
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

useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(Date.now());
  }, 1000);

  return () => clearInterval(timer);
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


//   useEffect(() => {
//   const handleConnect = () => {
//     console.log("Socket connected:", socket.id);
//   };

//   const handleConnectError = (error) => {
//     console.error("Socket connection error:", error.message);
//   };

//   socket.on("connect", handleConnect);
//   socket.on("connect_error", handleConnectError);

//   if (socket.connected) {
//     handleConnect();
//   }

//   return () => {
//     socket.off("connect", handleConnect);
//     socket.off("connect_error", handleConnectError);
//   };
// }, []);

useEffect(() => {
  const token = localStorage.getItem("token");

  if (token && !socket.connected) {
    socket.connect();
  }

  const handleConnect = () => {
    console.log("Socket connected:", socket.id);
  };

  const handleConnectError = (error) => {
    console.error("Socket connection error:", error.message);
  };

  socket.on("connect", handleConnect);
  socket.on("connect_error", handleConnectError);

  if (socket.connected) {
    handleConnect();
  }

  return () => {
    socket.off("connect", handleConnect);
    socket.off("connect_error", handleConnectError);
  };
}, []);

  useEffect(() => {
    const handleMessage = async (data) => {

      // if (!selectedUser || !user) return;
      if (!user) return;
      console.log("SOCKET MESSAGE RECEIVED:", data);

      // const isCurrentChat =
      //   (data.sender_id === selectedUser.id &&
      //     data.receiver_id === user.id) ||

      //   (data.sender_id === user.id &&
      //     data.receiver_id === selectedUser.id);
      let isCurrentChat = false;

      if (selectedUser) {
  isCurrentChat =
    (Number(data.sender_id) === Number(selectedUser.id) &&
      Number(data.receiver_id) === Number(user.id)) ||
    (Number(data.sender_id) === Number(user.id) &&
      Number(data.receiver_id) === Number(selectedUser.id));
}

      // if (!isCurrentChat) return;
      if (!isCurrentChat) {

        if (
  Number(data.receiver_id) === Number(user.id) &&
  Number(data.sender_id) !== Number(user.id)
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
  Number(data.receiver_id) === Number(user.id) &&
  Number(data.sender_id) === Number(selectedUser.id)
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

  const joinRoom = () => {
    console.log("Joining room:", user.id);
    socket.emit("join", user.id);
  };

  socket.on("connect", joinRoom);

  if (socket.connected) {
    joinRoom();
  }

  return () => {
    socket.off("connect", joinRoom);
  };
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





//   useEffect(() => {
//   if (!selectedGroup || !user) return;

//   const markGroupMessagesSeen = async () => {
//     const token = localStorage.getItem("token");

//     try {
//       for (const msg of groupMessages) {
//         if (Number(msg.sender_id) === Number(user.id)) continue;

//         await axios.post(
//           "https://chat-box-2-hyl4.onrender.com/api/group-messages/seen",
//           {
//             message_id: msg.id,
//             user_id: user.id,
//             group_id: selectedGroup.id,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   markGroupMessagesSeen();
// }, [groupMessages, selectedGroup, user]);

useEffect(() => {
  if (!selectedGroup || !user) return;

  const joinGroupRoom = () => {
    console.log("Joining group room:", selectedGroup.id);
    socket.emit("join_group", selectedGroup.id);
  };

  socket.on("connect", joinGroupRoom);

  if (socket.connected) {
    joinGroupRoom();
  }

  return () => {
    socket.off("connect", joinGroupRoom);
  };
}, [selectedGroup, user]);

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
    const currentUser = JSON.parse(localStorage.getItem("user"));

if (Number(data.sender_id) !== Number(currentUser.id)) {
  fetchGroupUnreadCounts();
}
    console.log("GROUP MESSAGE RECEIVED:", data);

    console.log("SELECTED GROUP ID:", selectedGroup?.id);
console.log("RECEIVED GROUP ID:", data.group_id);

if (!selectedGroup) return;

if (Number(data.group_id) !== Number(selectedGroup.id)) {
  console.log("GROUP ID MISMATCH");
  return;
}

    setGroupMessages((prev) => {
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



useEffect(() => {
  const setupAppStateListener = async () => {
    const listener = await CapacitorApp.addListener(
      "appStateChange",
      ({ isActive }) => {
        if (isActive) {
          const token = localStorage.getItem("token");

          if (token && !socket.connected) {
            socket.connect();
          }
        }
      }
    );

    return listener;
  };

  let appListener;

  setupAppStateListener().then((listener) => {
    appListener = listener;
  });

  return () => {
    appListener?.remove();
  };
}, []);



useEffect(() => {
  const backButtonListener = CapacitorApp.addListener(
    "backButton",
    () => {
      if (mobileChatOpen || selectedUser || selectedGroup) {
        setSelectedUser(null);
        setSelectedGroup(null);
        setMobileChatOpen(false);
        setShowGroupMembers(false);
      } else {
        CapacitorApp.exitApp();
      }
    }
  );

  return () => {
    backButtonListener.then((listener) => listener.remove());
  };
}, [mobileChatOpen, selectedUser, selectedGroup]);





const toggleMessageSelection = (id) => {
  setSelectedMessages((prev) =>
    prev.includes(id)
      ? prev.filter((messageId) => messageId !== id)
      : [...prev, id]
  );
};

  const fetchUsers = async () => {
    try {
      const data = JSON.parse(localStorage.getItem("user"));

      const token = localStorage.getItem("token");
console.time("USERS LOAD");
const res = await axios.get(
  `https://chat-box-2-hyl4.onrender.com/api/users?email=${data.email}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
console.timeEnd("USERS LOAD");
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
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    console.time("GROUPS LOAD");
    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/groups?userId=${currentUser.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
   console.timeEnd("GROUPS LOAD");
    setGroups(res.data);
  } catch (err) {
    console.log(err);
  }
};

 const fetchGroupUnreadCounts = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/group-messages/unread/${currentUser.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const counts = {};

    res.data.forEach((row) => {
      counts[row.group_id] = Number(row.unread_count);
    });

    setGroupUnreadCounts((prev) => ({
  ...prev,
  ...counts,
}));
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
  console.count("fetchMessages CALLED");
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

   console.time("CHAT API TOTAL");

    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/messages/${currentUser.id}/${receiverId}`,
      config
    );

    setMessages(res.data);

    console.timeEnd("CHAT API TOTAL");

    // Update Delivered and Seen in background
    const updateMessages = res.data
      .filter(
        (msg) =>
          Number(msg.receiver_id) === Number(currentUser.id) &&
          (msg.status === "sent" || msg.status === "delivered")
      )
      .map(async (msg) => {
        try {
          if (msg.status === "sent") {
            await axios.put(
              `https://chat-box-2-hyl4.onrender.com/api/messages/status/${msg.id}`,
              { status: "delivered" },
              config
            );
          }

          await axios.put(
            `https://chat-box-2-hyl4.onrender.com/api/messages/seen/${msg.id}`,
            {},
            config
          );
        } catch (err) {
          console.log("Message status update error:", err);
        }
      });

    await Promise.all(updateMessages);

  } catch (err) {
    console.log(err);
  }
};



  const fetchUnreadCounts = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/messages/unread/${currentUser.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const counts = {};

    res.data.forEach((row) => {
      counts[row.sender_id] = Number(row.unread_count);
    });

    setUnreadCounts(counts);
  } catch (err) {
    console.log(err);
  }
};

const renameGroup = async (id) => {
  const newName = prompt("Enter New Group Name");

  if (!newName) return;

  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `https://chat-box-2-hyl4.onrender.com/api/groups/${id}`,
      {
        group_name: newName,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Group Updated");
    fetchGroups();
  } catch (err) {
    console.log(err);
  }
};

  const deleteGroup = async (id) => {
  if (!window.confirm("Delete this group?")) return;

  try {
    const token = localStorage.getItem("token");

    await axios.delete(
      `https://chat-box-2-hyl4.onrender.com/api/groups/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
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
  


  const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(chunks, {
        type: recorder.mimeType || "audio/webm",
      });

      const audioFile = new File(
        [audioBlob],
        `voice-${Date.now()}.webm`,
        { type: audioBlob.type }
      );

      setAudio(audioFile);

      stream.getTracks().forEach((track) => track.stop());
    };

    recorder.start();
    setIsRecording(true);
  } catch (error) {
    console.error("Microphone error:", error);
    alert("Microphone access permission is required.");
  }
};

const stopRecording = () => {
  if (mediaRecorderRef.current && isRecording) {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }
};

  const sendMessage = async () => {
     if (isSending) return;
   if (
  !message.trim() &&
  !image &&
  !video &&
  !document &&
  !audio &&
  !selectedContact &&
  !selectedLocation
) return;
    console.log(image);

    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      const token = localStorage.getItem("token");

const authConfig = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};
      setIsSending(true);

     let imageName = "";
let imagePublicId = "";
let imageResourceType = "";

if (image) {
  const formData = new FormData();
  formData.append("image", image);

  const uploadRes = await axios.post(
    "https://chat-box-2-hyl4.onrender.com/api/messages/upload",
    formData,
    authConfig
  );

  imageName = uploadRes.data.image;
  imagePublicId = uploadRes.data.public_id;
  imageResourceType = uploadRes.data.resource_type;
}


let videoName = "";
let videoPublicId = "";
let videoResourceType = "";

if (video) {
  const formData = new FormData();
  formData.append("image", video);

  const res = await axios.post(
    "https://chat-box-2-hyl4.onrender.com/api/messages/upload",
    formData,
    authConfig
  );

  videoName = res.data.image;
  videoPublicId = res.data.public_id;
  videoResourceType = res.data.resource_type;
}


let audioName = "";
let audioPublicId = "";
let audioResourceType = "";

if (audio) {
  const formData = new FormData();
  formData.append("audio", audio);

  const res = await axios.post(
    "https://chat-box-2-hyl4.onrender.com/api/messages/upload-audio",
    formData,
    authConfig
  );

  audioName = res.data.audio;
  audioPublicId = res.data.public_id;
  audioResourceType = res.data.resource_type;
}


let documentName = "";
let documentPublicId = "";
let documentResourceType = "";

if (document) {
  const formData = new FormData();
  formData.append("image", document);

  const res = await axios.post(
    "https://chat-box-2-hyl4.onrender.com/api/messages/upload",
    formData,
    authConfig
  );

  documentName = res.data.image;
  documentPublicId = res.data.public_id;
  documentResourceType = res.data.resource_type;
}

      // Group Chat
      if (selectedGroup) {
       await axios.post("https://chat-box-2-hyl4.onrender.com/api/group-messages", {
  group_id: selectedGroup.id,
sender_id: currentUser.id,
message,
message_type: selectedLocation
  ? "location"
  : selectedContact
  ? "contact"
  : "text",
contact_name: selectedContact || null,
contact_phone: contactPhone || null,
location_lat: selectedLocation?.lat ?? null,
location_lng: selectedLocation?.lng ?? null,
  image: imageName,
  image_public_id: imagePublicId,
  image_resource_type: imageResourceType,

  video: videoName,
  video_public_id: videoPublicId,
  video_resource_type: videoResourceType,

  document: documentName,
  document_public_id: documentPublicId,
  document_resource_type: documentResourceType,

  audio: audioName,
  audio_public_id: audioPublicId,
  audio_resource_type: audioResourceType
}, authConfig);

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
        setVideo(null);
        setDocument(null);
        setAudio(null);
        setSelectedContact(null);
       setContactPhone("");
       setSelectedLocation(null);
        
        
        // fetchGroupMessages(selectedGroup.id);

        return;
      }


      // Private Chat
      if (!selectedUser?.id) return;
      await axios.post("https://chat-box-2-hyl4.onrender.com/api/messages", {
  sender_id: currentUser.id,
  receiver_id: selectedUser.id,
  message,
  message_type: selectedLocation
  ? "location"
  : selectedContact
  ? "contact"
  : "text",

contact_name: selectedContact || null,
contact_phone: contactPhone || null,

location_lat: selectedLocation?.lat ?? null,
location_lng: selectedLocation?.lng ?? null,

  image: imageName,
  image_public_id: imagePublicId,
  image_resource_type: imageResourceType,

  video: videoName,
  video_public_id: videoPublicId,
  video_resource_type: videoResourceType,

  document: documentName,
  document_public_id: documentPublicId,
  document_resource_type: documentResourceType,

  audio: audioName,
  audio_public_id: audioPublicId,
  audio_resource_type: audioResourceType
}, authConfig);


      // socket.emit("send_message", {
      //   sender_id: currentUser.id,
      //   receiver_id: selectedUser.id,
      //   message,
      //     image: imageName,
      //      document:documentName
      // });



      setMessage("");
      setImage(null);
      setVideo(null);
      setDocument(null);
      setAudio(null);
      setSelectedContact(null);
      setContactPhone("");
      setSelectedLocation(null);
      
      } catch (err) {

    console.log("Send message error:", err);

  } finally {

    // API complete ஆனதும் button மீண்டும் enable
    setIsSending(false);
  }
};


  const fetchGroupMembers = async (groupId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/members`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setGroupMembers(res.data);
  } catch (err) {
    console.log(err);
  }
};

  const fetchGroupMessages = async (groupId) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/group-messages/${groupId}`,
      config
    );

    // Delivered
    for (const msg of res.data) {
      if (
        Number(msg.sender_id) !== Number(currentUser.id) &&
        msg.status === "sent"
      ) {
        await axios.put(
          `https://chat-box-2-hyl4.onrender.com/api/group-messages/status/${msg.id}`,
          { status: "delivered" },
          config
        );

        msg.status = "delivered";
      }
    }

    // Seen
for (const msg of res.data) {
  if (
    Number(msg.sender_id) !== Number(currentUser.id) &&
    msg.status !== "seen"
  ) {
    await axios.post(
      "https://chat-box-2-hyl4.onrender.com/api/group-messages/seen",
      {
        message_id: msg.id,
      },
      config
    );

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
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/group-messages/seen-count/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
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
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/member-count`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMemberCount(res.data.member_count);
  } catch (err) {
    console.log(err);
  }
};

  const openSeenPopup = async (messageId) => {
     console.log("SEEN POPUP MESSAGE ID:", messageId);

  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/group-messages/seen/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSeenUsers(res.data);
    setShowSeenPopup(true);
  } catch (err) {
    console.log(err);
  }
};

  const removeMember = async (groupId, userId) => {
  try {
    const token = localStorage.getItem("token");

    await axios.delete(
      `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/remove-member/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Member Removed");
    fetchGroupMembers(groupId);
  } catch (err) {
    console.log(err);
  }
};

  const addMember = async (groupId, userId) => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/add-member`,
      {
        user_id: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Member Added Successfully");

    fetchGroupMembers(groupId);
    fetchAvailableUsers(groupId);

  } catch (err) {
    console.log(err);
  }
};

  const fetchAvailableUsers = async (groupId) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const res = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/users?email=${currentUser.email}`,
      config
    );

    const members = await axios.get(
      `https://chat-box-2-hyl4.onrender.com/api/groups/${groupId}/members`,
      config
    );

    const memberIds = members.data.map((m) => Number(m.id));

    const filteredUsers = res.data.filter(
      (u) => !memberIds.includes(Number(u.id))
    );

    setAvailableUsers(filteredUsers);

  } catch (err) {
    console.log(err);
  }
};


  const deleteMessage = async (id) => {
  try {
    if (!window.confirm("Delete this message?")) return;

    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        user_id: user.id,
      },
    };

    if (selectedGroup) {
      await axios.delete(
        `https://chat-box-2-hyl4.onrender.com/api/group-messages/${id}`,
        config
      );

      fetchGroupMessages(selectedGroup.id);
    } else {
      await axios.delete(
        `https://chat-box-2-hyl4.onrender.com/api/messages/${id}`,
        config
      );

      fetchMessages(selectedUser.id);
    }
  } catch (err) {
    console.log(err);
  }
};



  const deleteSelectedMessages = async () => {
  if (selectedMessages.length === 0) return;

  if (
    !window.confirm(
      `Delete ${selectedMessages.length} selected message(s)?`
    )
  ) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        user_id: user.id,
      },
    };

    for (const id of selectedMessages) {
      if (selectedGroup) {
        await axios.delete(
          `https://chat-box-2-hyl4.onrender.com/api/group-messages/${id}`,
          config
        );
      } else {
        await axios.delete(
          `https://chat-box-2-hyl4.onrender.com/api/messages/${id}`,
          config
        );
      }
    }

    setSelectedMessages([]);

    if (selectedGroup) {
      fetchGroupMessages(selectedGroup.id);
    } else if (selectedUser?.id) {
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

 const filteredUsers = users.filter((u) =>
  u.name?.toLowerCase().includes(sidebarSearch.toLowerCase())
);

const filteredGroups = groups.filter((g) =>
  g.group_name?.toLowerCase().includes(sidebarSearch.toLowerCase())
);

  return (
    <div className={`container ${mobileChatOpen ? "mobile-chat-open" : ""}`}>
      
{/* Sidebar */}
<div className="sidebar">

  {/* Sidebar Header */}
  <div className="sidebar-header">
    {/* <h2>ChatBox</h2> */}

    <button
      className="logout-btn"
      onClick={logout}
      title="Logout"
      aria-label="Logout"
    >
      ↪
    </button>
  </div>

  {/* Users / Groups Tabs */}
  {/* <div className="sidebar-tabs">

    <button
      className={activeSidebarTab === "users" ? "sidebar-tab active" : "sidebar-tab"}
      onClick={() => setActiveSidebarTab("users")}
    >
      👤 Users
    </button>

    <button
      className={activeSidebarTab === "groups" ? "sidebar-tab active" : "sidebar-tab"}
      onClick={() => setActiveSidebarTab("groups")}
    >
      👥 Groups
    </button>

  </div> */}

 <div className="sidebar-search">
  <input
    type="text"
    placeholder="Search users or groups..."
    value={sidebarSearch}
    onChange={(e) => setSidebarSearch(e.target.value)}
  />

  {sidebarSearch && (
    <button onClick={() => setSidebarSearch("")}>
      {/* ✕ */}
    </button>
  )}
</div>
 
{/* Common Users and Groups List */}
<div className="sidebar-list">

  {/* Users */}
  {filteredUsers.map((u) => (
    <div
      key={u.id}
      className="user"
      onClick={() => {
        setMobileChatOpen(true);
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
      <span>👤 {u.name}</span>

      {unreadCounts[u.id] > 0 && (
        <span className="unread-badge">
          {unreadCounts[u.id]}
        </span>
      )}
    </div>
  ))}

  {/* Create Group */}
  {user?.role === "admin" && (
    <button
      className="create-group-btn"
      onClick={() => navigate("/create-group")}
    >
      + Create Group
    </button>
  )}

  {/* Groups */}
  {filteredGroups.map((group) => (
    <div key={group.id} className="group-item">

      <div
        className="group-name"
        onClick={() => {
          setMobileChatOpen(true);
          setGroupMessages([]);
          setSelectedGroup(group);
          setSelectedUser(null);

          fetchGroupMembers(group.id);
          fetchGroupMessages(group.id);
          fetchAvailableUsers(group.id);

          setGroupUnreadCounts((prev) => ({
            ...prev,
            [group.id]: 0,
          }));
        }}
      >
        <span>👥 {group.group_name}</span>

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
            title="Rename group"
          >
            ✏️
          </button>

          <button
            className="delete-btn"
            onClick={() => deleteGroup(group.id)}
            title="Delete group"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  ))}

  {filteredUsers.length === 0 && filteredGroups.length === 0 && (
    <p className="sidebar-empty">No users or groups found</p>
  )}

</div>

</div>

      {/* Chat Area */}
      <div className="chatArea">

       <button
  className="mobile-back-btn"
  onClick={() => {
    setMobileChatOpen(false);
    setSelectedGroup(null);
    setSelectedUser(null);
  }}
  aria-label="Back"
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
        {/* <h3>Role : {user?.role}</h3> */}

       {selectedGroup ? (
  <>
    <div className="group-chat-header">
      <h2>{selectedGroup.group_name}</h2>

      <button
        className="group-members-icon"
        onClick={() => setShowGroupMembers(true)}
        title="View group members"
        aria-label="View group members"
      >
        👥
      </button>
    </div>

            <div className="group-chat-container">

              {/* Left Panel */}
              {/* Group Members Popup */}
{showGroupMembers && (
  <div
    className="group-members-overlay"
    onClick={() => setShowGroupMembers(false)}
  >
    <div
      className="group-members-popup"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="group-members-popup-header">
        <h3>👥 Group Members</h3>

        <button
          onClick={() => setShowGroupMembers(false)}
          title="Close"
        >
          ✕
        </button>
      </div>

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
  </div>
)}

              {/* Right Panel */}
              <div className="messages">

                {selectedMessages.length > 0 && (
  <button
    className="delete-selected-btn"
    onClick={deleteSelectedMessages}
  >
    🗑 Delete Selected ({selectedMessages.length})
  </button>
)}

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

                    {msg.message_type === "contact" && (
  <div className="shared-contact-card">
    <div className="shared-contact-icon">👤</div>

    <div className="shared-contact-details">
      <strong>{msg.contact_name}</strong>
      <p>{msg.contact_phone}</p>
    </div>

    <a
      href={`tel:${msg.contact_phone}`}
      onClick={(e) => e.stopPropagation()}
    >
      Call
    </a>
  </div>
)}

{msg.message_type === "location" && (
  <div className="shared-location-card">
    <div>📍 Location shared</div>

    <a
      href={`https://www.google.com/maps?q=${msg.location_lat},${msg.location_lng}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      Open Map
    </a>
  </div>
)}

                    {msg.message && (
  editingMessageId === msg.id ? (
    <div className="edit-message-box">
      <input
        type="text"
        value={editMessageText}
        onChange={(e) => setEditMessageText(e.target.value)}
      />

      <button
        onClick={async () => {
          try {
           const response = await axios.put(
  `https://chat-box-2-hyl4.onrender.com/api/group-messages/edit/${msg.id}`,
  {
    user_id: user.id,
    message: editMessageText
  },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

            setGroupMessages((prev) =>
              prev.map((item) =>
                item.id === msg.id ? response.data : item
              )
            );

            setEditingMessageId(null);
            setEditMessageText("");
          } catch (err) {
            console.error(err);
            alert("Group message edit failed");
          }
        }}
      >
        Save
      </button>

      <button
        onClick={() => {
          setEditingMessageId(null);
          setEditMessageText("");
        }}
      >
        Cancel
      </button>
    </div>
  ) : (
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
  <PhotoView src={getGroupFileUrl(msg, "image")}>
    <img
      src={getGroupFileUrl(msg, "image")}
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
  onClick={async () => {
    const imageUrl = getGroupFileUrl(msg, "image");

    if (imageUrl) {
      window.open(imageUrl, "_blank");
    }
  }}
>
  ⬇ Download
</button>
  </>
)}





{msg.video && (
  <div className="chat-video-container">
    <video
      controls
      className="chat-video"
      src={getGroupFileUrl(msg, "video")}
    />

    <button
      className="download-image-btn"
      onClick={() => {
        const videoUrl = getGroupFileUrl(msg, "video");

        if (videoUrl) {
          window.open(videoUrl, "_blank");
        }
      }}
    >
      ⬇ Download
    </button>
  </div>
)}

{msg.audio && (
  <div className="chat-audio-container">
    <div className="chat-audio-icon">🎙️</div>

    <div className="chat-audio-player">
      <audio
        controls
        preload="metadata"
        src={getGroupFileUrl(msg, "audio")}
      />
      <span>Voice message</span>
    </div>
  </div>
)}

                    {msg.document && (
  <a
    href={getGroupFileUrl(msg, "document")}
    target="_blank"
    rel="noreferrer"
    className="document-link"
  >
    📄 Open Document
  </a>
)}


                    {msg.sender_id === user?.id && (
  <>
  <input
  type="checkbox"
  checked={selectedMessages.includes(msg.id)}
  onChange={() => toggleMessageSelection(msg.id)}
/>

<button
  className="delete-btn"
  onClick={(e) => {
    e.stopPropagation();
    deleteMessage(msg.id);
  }}
  title="Delete"
  aria-label="Delete message"
>
  🗑️
</button>

{msg.message?.trim() &&
  !msg.audio &&
  !msg.image &&
  !msg.video &&
  !msg.document &&
  new Date(msg.created_at).getTime() >=
    currentTime - 15 * 60 * 1000 && (
      <button
        className="edit-btn"
        onClick={(e) => {
          e.stopPropagation();
          setEditingMessageId(msg.id);
          setEditMessageText(msg.message || "");
        }}
        title="Edit"
        aria-label="Edit message"
      >
        ✏️
      </button>
)}
  </>

  
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
            <h2 className="private-chat-header">
  Chat with {selectedUser.name}
</h2>
             {selectedMessages.length > 0 && (
  <button
    className="delete-selected-btn"
    onClick={deleteSelectedMessages}
  >
    🗑 Delete Selected ({selectedMessages.length})
  </button>
)}

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

                  {msg.message_type === "contact" && (
  <div className="shared-contact-card">
    <div className="shared-contact-icon">👤</div>

    <div className="shared-contact-details">
      <strong>{msg.contact_name}</strong>
      <p>{msg.contact_phone}</p>
    </div>

    <a href={`tel:${msg.contact_phone}`}>
      Call
    </a>
  </div>
)}
{msg.message_type === "location" && (
  <div className="shared-location-card">
    <div>📍 Location shared</div>

    <a
      href={`https://www.google.com/maps?q=${msg.location_lat},${msg.location_lng}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      Open Map
    </a>
  </div>
)}

                  {msg.message && (
  editingMessageId === msg.id ? (
    <div className="edit-message-box">
      <input
        type="text"
        value={editMessageText}
        onChange={(e) => setEditMessageText(e.target.value)}
      />

      <button
        onClick={async () => {
          try {
           const response = await axios.put(
  `https://chat-box-2-hyl4.onrender.com/api/messages/edit/${msg.id}`,
  {
    user_id: user.id,
    message: editMessageText
  },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

            setMessages((prev) =>
              prev.map((item) =>
                item.id === msg.id ? response.data : item
              )
            );

            setEditingMessageId(null);
            setEditMessageText("");
          } catch (err) {
            console.error(err);
            alert("Message edit failed");
          }
        }}
      >
        Save
      </button>

      <button
        onClick={() => {
          setEditingMessageId(null);
          setEditMessageText("");
        }}
      >
        Cancel
      </button>
    </div>
  ) : (
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
      <PhotoView src={getPrivateFileUrl(msg, "image")}>
        <img
          src={getPrivateFileUrl(msg, "image")}
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
    const imageUrl = getPrivateFileUrl(msg, "image");

    if (imageUrl) {
      window.open(imageUrl, "_blank");
    }
  }}
>
  ⬇ Download
</button>
  </>
)}



{msg.video && (
  <div className="chat-video-container">
    <video
      controls
      className="chat-video"
      src={getPrivateFileUrl(msg, "video")}
    />

    <button
      className="download-image-btn"
      onClick={() => {
        const videoUrl = getPrivateFileUrl(msg, "video");

        if (videoUrl) {
          window.open(videoUrl, "_blank");
        }
      }}
    >
      ⬇ Download
    </button>
  </div>
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


{msg.audio && (
  <div className="chat-audio-container">
    <div className="chat-audio-icon">🎙️</div>

    <div className="chat-audio-player">
      <audio
        controls
        preload="metadata"
        src={getPrivateFileUrl(msg, "audio")}
      />
      <span>Voice message</span>
    </div>
  </div>
)}
                 {msg.document && (
  <a
    href={getPrivateFileUrl(msg, "document")}
    target="_blank"
    rel="noreferrer"
    className="document-link"
  >
    📄 Open Document
  </a>
)}

                  {msg.sender_id === user?.id && (
                    
  <>
    <input
      type="checkbox"
      checked={selectedMessages.includes(msg.id)}
      onChange={() => toggleMessageSelection(msg.id)}
    />

    <button
  className="delete-btn"
  onClick={() => deleteMessage(msg.id)}
  title="Delete"
  aria-label="Delete message"
>
  🗑️
</button>

{msg.message?.trim() &&
  !msg.audio &&
  !msg.image &&
  !msg.video &&
  !msg.document &&
  new Date(msg.created_at).getTime() >=
    currentTime - 15 * 60 * 1000 && (
      <button
        className="edit-btn"
        onClick={() => {
          setEditingMessageId(msg.id);
          setEditMessageText(msg.message || "");
        }}
        title="Edit"
        aria-label="Edit message"
      >
        ✏️
      </button>
)}
  </>
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

          {/* <label htmlFor="imageUpload" className="file-btn">
            📷
          </label>

          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="file-input"
            onChange={(e) => setImage(e.target.files[0])}
          />


          <label htmlFor="videoUpload" className="file-btn">
  🎥
</label>

<input
  id="videoUpload"
  type="file"
  accept="video/*"
  className="file-input"
  onChange={(e) => setVideo(e.target.files[0])}
/>

          <label htmlFor="docUpload" className="file-btn">
            📄
          </label>

          <button
  type="button"
  className="link-btn"
 onClick={loadDeviceContacts}
  disabled={!selectedUser && !selectedGroup}
  title="Share Contact"
>
  👤
</button>

<button
  type="button"
  className="link-btn"
  onClick={shareCurrentLocation}
  disabled={!selectedUser && !selectedGroup}
  title="Share Location"
>
  📍
</button>

          <input
            id="docUpload"
            type="file"
            className="file-input"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={(e) => setDocument(e.target.files[0])}
          /> */}



<button
  type="button"
  className="link-btn attach-plus-btn"
  onClick={() => setShowAttachMenu((prev) => !prev)}
  disabled={!selectedUser && !selectedGroup}
>
  +
</button>

{showAttachMenu && (
  <div className="attach-menu">
    <label htmlFor="imageUpload">📷 Image</label>
    <input
      id="imageUpload"
      type="file"
      accept="image/*"
      className="file-input"
      onChange={(e) => {
        setImage(e.target.files[0]);
        setShowAttachMenu(false);
      }}
    />

    <label htmlFor="videoUpload">🎥 Video</label>
    <input
      id="videoUpload"
      type="file"
      accept="video/*"
      className="file-input"
      onChange={(e) => {
        setVideo(e.target.files[0]);
        setShowAttachMenu(false);
      }}
    />

    <label htmlFor="docUpload">📄 Document</label>
    <input
      id="docUpload"
      type="file"
      className="file-input"
      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
      onChange={(e) => {
        setDocument(e.target.files[0]);
        setShowAttachMenu(false);
      }}
    />

    <button type="button" onClick={() => {
      const link = prompt("Paste Document Link");
      if (link) setMessage(link);
      setShowAttachMenu(false);
    }}>🔗 Link</button>

    <button type="button" onClick={() => {
      loadDeviceContacts();
      setShowAttachMenu(false);
    }}>👤 Contact</button>

    <button type="button" onClick={() => {
      shareCurrentLocation();
      setShowAttachMenu(false);
    }}>📍 Location</button>
  </div>
)}


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

          {video && (
  <div className="selected-file">
    🎥 {video.name}
    <button onClick={() => setVideo(null)}>
      ✖
    </button>
  </div>
)}

{audio && (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      padding: "10px",
      background: "#f0f0f0",
      borderRadius: "8px",
      margin: "10px 0",
    }}
  >
    <span>🎙️ {audio.name}</span>

    <audio
      controls
      preload="auto"
      src={URL.createObjectURL(audio)}
      style={{ width: "100%", display: "block" }}
    />

    <button type="button" onClick={() => setAudio(null)}>
      ✖ Remove
    </button>
  </div>
)}

{!isRecording ? (
  <button
    type="button"
    className="link-btn"
    onClick={startRecording}
    disabled={!selectedUser && !selectedGroup}
  >
    🎙️
  </button>
) : (
  <button
    type="button"
    className="link-btn"
    onClick={stopRecording}
  >
    ⏹
  </button>
)}
          {/* <button
            className="link-btn"
            onClick={() => {
              const link = prompt("Paste Document Link");
              if (link) setMessage(link);
            }}
          >
            🔗
          </button> */}

          {selectedContact && (
  <div className="selected-contact-preview">
    👤 {selectedContact} — {contactPhone}
    <button
      type="button"
      onClick={() => {
        setSelectedContact(null);
        setContactPhone("");
      }}
    >
      ✕
    </button>
  </div>
)}

          {/* <button
  className="button"
  onClick={sendMessage}
  disabled={isSending || (!selectedUser && !selectedGroup)}
>
  {isSending ? "Sending..." : "Send"}
</button> */}



<button
  type="button"
  className="button send-icon-btn"
  onClick={sendMessage}
  disabled={isSending || (!selectedUser && !selectedGroup)}
  title="Send"
  aria-label="Send message"
>
  {isSending ? "..." : "➤"}
</button>


          {/* <button
            onClick={() =>  navigate(`/change-password/${user.id}`)}
          >
            Change Password
          </button> */}
        </div>

        {selectedLocation && (
  <div className="selected-contact-preview">
    📍 Current Location selected
    <button
      type="button"
      onClick={() => setSelectedLocation(null)}
    >
      ✕
    </button>
  </div>
)}


       
{showContactPicker && (
  <div className="contact-picker-overlay">
    <div className="contact-picker">

      <div className="contact-picker-header">
        <div>
          <h3>Select Contact</h3>
          <small>{deviceContacts.length} contacts</small>
        </div>

        <button
          type="button"
          className="contact-close-btn"
          onClick={() => {
            setShowContactPicker(false);
            setContactSearch("");
          }}
        >
          ×
        </button>
      </div>

      <div className="contact-search-box">
        <span>⌕</span>
        <input
          type="text"
          placeholder="Search contacts..."
          value={contactSearch}
          onChange={(e) => setContactSearch(e.target.value)}
        />
      </div>

      <div className="contact-list">
        {deviceContacts
          .filter((contact) =>
            (contact.name?.display || "")
              .toLowerCase()
              .includes(contactSearch.toLowerCase())
          )
          .map((contact) => (
            <div
              key={contact.contactId}
              className="contact-item"
              onClick={() => {
                const phone = contact.phones?.[0]?.number || "";

                if (!phone) {
                  alert("This contact has no phone number");
                  return;
                }

                setSelectedContact(
                  contact.name?.display || "Unknown Contact"
                );
                setContactPhone(phone);
                setShowContactPicker(false);
                setContactSearch("");
              }}
            >
              <div className="contact-avatar">
                {(contact.name?.display || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="contact-info">
                <strong>
                  {contact.name?.display || "Unknown Contact"}
                </strong>
                <small>
                  {contact.phones?.[0]?.number || "No phone number"}
                </small>
              </div>

              <span className="contact-arrow">›</span>
            </div>
          ))}

        {deviceContacts.filter((contact) =>
          (contact.name?.display || "")
            .toLowerCase()
            .includes(contactSearch.toLowerCase())
        ).length === 0 && (
          <div className="no-contacts">
            No contacts found
          </div>
        )}
      </div>

    </div>
  </div>
)}


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