import React, { useState, useEffect } from 'react';
import Register from './components/register.js';
import "./index.css";
import Login from './components/login.js';
import Upload from './components/upload.js';

export default function App() {
  const apiBaseUrl = "http://127.0.0.1:5003";
  const [showSignUpFormModal, setShowSignUpFormModal] = useState(true);
  const [showLoginFormModal, setShowLoginFormModal] = useState(false);
  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userFolderKey, setUserFolderKey] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserEmail = localStorage.getItem('email');
    const storedUserFolderKey = localStorage.getItem('folder_key');

    if (storedUserId && storedUserEmail && storedUserFolderKey) {
      setUserId(storedUserId);
      setUseremail(storedUserEmail);
      setUserFolderKey(storedUserFolderKey);
      setIsLoggedIn(true);
      setShowLoginFormModal(false);
      setShowSignUpFormModal(false);
    }
  }, []);

  const handleRegister = () => {
    if (!username || !useremail || !password || !confirmPassword) {
      alert("Please fill out all required fields.");
      return;
    }
  
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    fetch(`${apiBaseUrl}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        useremail,
        password,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Registration failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Registration response:", data);

        if (data.error && data.error.includes("User with the same email already exists")) {
          alert("User with the same email already exists");
        } else {
          console.log("Registration successful", data);
          alert("Registration successful");
          setShowSignUpFormModal(false);
          setShowLoginFormModal(true);
          setConfirmPasswordError("");
        }
      })
      .catch(error => {
        console.error("Error registering user:", error);
        alert("Error registering user");
      });
  };



  const handleLogin = () => {
    fetch(`${apiBaseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        useremail,
        password,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Login failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const loggedInUserId = data.user_id;
        const loggedInUserEmail = data.useremail;
        const loggedInUserFolderKey = data.folder_key;

        setUserId(loggedInUserId);
        setUseremail(loggedInUserEmail);
        setUserFolderKey(loggedInUserFolderKey);
        alert("Login successful");
        localStorage.setItem('userId', loggedInUserId);
        localStorage.setItem('email', loggedInUserEmail);
        localStorage.setItem('folder_key', loggedInUserFolderKey);

        setShowLoginFormModal(false);
        setIsLoggedIn(true);
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        alert("Invalid credentials");
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("folder_key");

    setUserId(null);
    setUseremail(null);
    setUserFolderKey(null);
    setIsLoggedIn(false);
    setShowLoginFormModal(true);
  };

  return (
    <div>

      <Register showSignUpFormModal={showSignUpFormModal}
        setShowSignUpFormModal={setShowSignUpFormModal}
        setShowLoginFormModal={setShowLoginFormModal}
        username={username}
        useremail={useremail}
        password={password}
        confirmPassword={confirmPassword}
        confirmPasswordError={confirmPasswordError}
        setUsername={setUsername}
        setUseremail={setUseremail}
        setPassword={setPassword}
        setConfirmPassword={setConfirmPassword}
        setConfirmPasswordError={setConfirmPasswordError}
        handleRegister={handleRegister}
      />
      <Login showLoginFormModal={showLoginFormModal}
        setShowSignUpFormModal={setShowSignUpFormModal}
        setShowLoginFormModal={setShowLoginFormModal}
        useremail={useremail}
        password={password}
        setUseremail={setUseremail}
        setPassword={setPassword}
        handleLogin={handleLogin}
      />


      {isLoggedIn &&
        <Upload userId={userId} userFolderKey={userFolderKey} isLoggedIn={isLoggedIn} useremail={useremail} handleLogout={handleLogout} />
      }

    </div>

  )
}




