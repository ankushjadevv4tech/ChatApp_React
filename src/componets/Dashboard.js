// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useEffect } from 'react';

// // Sample user data
// // const users = [
// //   { id: 1, name: 'John Doe' },
// //   { id: 2, name: 'Jane Smith' },
// //   { id: 3, name: 'Alice Johnson' },
// //   // Add more users here
// // ];

// const Dashboard = () => {
//   const navigate = useNavigate(); 
//   const authToken = localStorage.getItem("authToken");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [message, setMessage] = useState('');
//   const [chatHistory, setChatHistory] = useState([]);
//   const [users, setUsers] = useState([]);

//   const handleUserClick = (user) => {
//     setSelectedUser(user);
//     setChatHistory([]);  
//   };
//   console.log('authToken', authToken)

//   const handleSendMessage = () => {
//     if (message.trim()) {
//       setChatHistory([...chatHistory, { user: 'Me', text: message }]);
//       setMessage('');
//     }
//   };
//   const handleLogout = () => {
//     localStorage.removeItem('authToken'); 
//     navigate('/');
//   };

//   useEffect(() => {
//     const authToken = localStorage.getItem("authToken");

//     if (authToken) {
//       fetch("http://localhost:3000/users", {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${authToken}`,  // Send the token in the header
//         },
//       })
//         .then((response) => response.json())
//         .then((data) => {
//           console.log("Fetched User Data:", data);  // Print the fetched data in the console
//           setUsers(data);  // Set the fetched data to the users state
//         })
//         .catch((error) => {
//           console.error("Error fetching users:", error);  // Log error if any
//         });
//     } else {
//       console.log("No token found.");
//     }
//   }, []);


//   return (
//     <div className="chat-app">
//       <div className="sidebar">
//         <h2>Chat Application</h2>
//         <input
//           type="text"
//           placeholder="Search..."
//           className="search-bar"
//         />
//         <div className="user-list">
//           {users.map(user => (
//             <div
//               key={user.id}
//               className="user-item"
//               onClick={() => handleUserClick(user)}
//             >
//               {user.name}
//             </div>
//           ))}
//           <button onClick={handleLogout} className="logout-button">
//             Logout
//           </button>
//         </div>
//       </div>

//       {selectedUser && (
//         <div className="chat-screen">
//           <div className="chat-header">{selectedUser.name}</div>
//           <div className="chat-body">
//             {chatHistory.map((msg, index) => (
//               <div key={index} className="message">
//                 <strong>{msg.user}:</strong> {msg.text}
//               </div>
//             ))}
//           </div>
//           <div className="chat-footer">
//             <input
//               type="text"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type a message..."
//             />
//             <button onClick={handleSendMessage}>Send</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;
































import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cable from './cable'; // Import the cable.js file we created

const Dashboard = () => {
  const navigate = useNavigate(); 
  const authToken = localStorage.getItem("authToken");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [roomChannel, setRoomChannel] = useState(null);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setChatHistory([]);  // Reset chat history for the new conversation

    // Fetch chat history with the selected user
    fetch(`http://localhost:3000/messages?recipient_id=${user.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setChatHistory(data); // Set the fetched chat history
      })
      .catch((error) => {
        console.error("Error fetching chat history:", error);
      });

    // Unsubscribe from the previous channel, if any
    if (roomChannel) {
      roomChannel.unsubscribe();
    }

    // Create a new subscription for real-time messaging with the selected user
    const channel = cable.subscriptions.create(
      { channel: "RoomChannel", room: user.id }, // Each user gets a unique room ID
      {
        received(data) {
          setChatHistory((prevMessages) => [
            ...prevMessages,
            { user_name: data.user_name, message: data.message },
          ]);
        },
        sendMessage: function (msg, userName) {
          this.perform("send_message", { message: msg, user_name: userName });
        },
      }
    );
    setRoomChannel(channel);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Temporarily update chat history before the server response
      setChatHistory((prevMessages) => [
        ...prevMessages,
        { user_name: 'Me', message },
      ]);
      roomChannel.sendMessage(message, 'Me');
      setMessage('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); 
    navigate('/');
  };

  useEffect(() => {
    if (authToken) {
      fetch("http://localhost:3000/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUsers(data);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
        });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (roomChannel) {
        roomChannel.unsubscribe();
      }
    };
  }, [roomChannel]);

  return (
    <div className="chat-app">
      <div className="sidebar">
        <h2>Chat Application</h2>
        <input
          type="text"
          placeholder="Search..."
          className="search-bar"
        />
        <div className="user-list">
          {users.map(user => (
            <div
              key={user.id}
              className="user-item"
              onClick={() => handleUserClick(user)}
            >
              {user.name}
            </div>
          ))}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      {selectedUser && (
        <div className="chat-screen">
          <div className="chat-header">{selectedUser.name}</div>
          <div className="chat-body">
            {chatHistory.map((msg, index) => (
              <div key={index} className="message">
                <strong>{msg.user_name}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <div className="chat-footer">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;



