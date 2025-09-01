import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CodeCraftLogo, TopRightLogo, TitleDots } from "../assets/Logos";
import { AnimatedNetwork, FloatingTriangle } from "../assets/Decorations";
import { UserIcon, LockIcon } from "../assets/Icons";

function LoginPage({ onLoginSuccess }) {
  const [Pakno, setPakno] = useState("");
  const [PasswordHash, setPasswordHash] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Pakno || !PasswordHash) {
      setError("Please enter both username and password");
      return;
    }

    try {
      // 🔑 API call
      const response = await axios.post(
        "https://172.32.3.12:2220/api/account/AuthPPortaloffDptCiv",
        {
          Pakno,
          PType: "3", // fixed as given
          PasswordHash,
        }
      );

      console.log("API response:", response.data);

      // ✅ Adjust condition based on backend response format
      if (response.data === true || response.data.msg === "true") {
        localStorage.setItem("user", Pakno);

        if (onLoginSuccess) {
          onLoginSuccess();
        }

        navigate("/MainPage");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Server error, please try again");
    }
  };

  return (
    <div className="">
      <div className="top-left-logo">
        <CodeCraftLogo />
      </div>
      <div className="top-right-logo">
        <TopRightLogo />
      </div>
      <header className="main-title">
        <div className="title-logo">
          <CodeCraftLogo />
        </div>
        <h1 className="title-text">
          Code Craft
          <div className="title-dots">
            <TitleDots />
          </div>
        </h1>
      </header>
      <main className="login-form-container">
        <h2 className="form-title">User Credentials</h2>
        <form className="form-body" onSubmit={handleSubmit}>
          <div className="input-group">
            <UserIcon />
            <input
              type="text"
              className="form-input"
              placeholder="Pakno"
              aria-label="Pakno"
              value={Pakno}
              onChange={(e) => setPakno(e.target.value)}
            />
          </div>
          <div className="input-group">
            <LockIcon />
            <input
              type="password"
              className="form-input"
              placeholder="Password"
              aria-label="Password"
              value={PasswordHash}
              onChange={(e) => setPasswordHash(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center mb-2">{error}</p>
          )}
          <button type="submit" className="login-button">
            LOGIN
          </button>
        </form>
      </main>
      <div className="animated-network">
        <AnimatedNetwork />
        <span className="network-text">Code Craft</span>
      </div>
      <div className="floating-triangle">
        <FloatingTriangle />
      </div>
    </div>
  );
}

export default LoginPage;
