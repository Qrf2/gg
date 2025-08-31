Perfect, Uzair 🚀
I’ve checked your uploaded **LoginPage.jsx**. Right now it only has UI and a `handleSubmit` that just calls `onLoginSuccess()` without any real API/auth logic.

Let’s integrate the **full login + services flow** into your existing structure while keeping your design and icons intact.

---

## ✅ Step 1: Create `services.js`

Put this file in the same folder (or `/src/services/` if you have one).

```javascript
// services.js
import axios from "axios";

// Login API request function
export const loginRequest = async (ESno, PasswordHash) => {
  try {
    // 👇 Replace '/api/login' with the actual API path backend gives you
    const response = await axios.post("/api/login", {
      ESno,
      PasswordHash,
    });

    return response.data; // e.g. { msg: "true" } or { success: true }
  } catch (error) {
    console.error("Login API Error:", error);
    return { msg: "error" };
  }
};
```

---

## ✅ Step 2: Update `LoginPage.jsx`

I merged your design + full login flow.

```javascript
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CodeCraftLogo, TopRightLogo, TitleDots } from "../assets/Logos";
import { AnimatedNetwork, FloatingTriangle } from "../assets/Decorations";
import { UserIcon, LockIcon } from "../assets/Icons";
import { loginRequest } from "../services";

function LoginPage({ onLoginSuccess }) {
  const [ESno, setESno] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ESno || !password) {
      setError("Please enter both username and password");
      return;
    }

    const response = await loginRequest(ESno, password);

    // Adjust based on backend response
    if (response.msg === "true" || response.success === true) {
      localStorage.setItem("user", ESno);

      if (onLoginSuccess) {
        onLoginSuccess();
      }

      navigate("/MainPage");
    } else {
      setError("Invalid credentials");
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
              placeholder="Username"
              aria-label="Username"
              value={ESno}
              onChange={(e) => setESno(e.target.value)}
            />
          </div>
          <div className="input-group">
            <LockIcon />
            <input
              type="password"
              className="form-input"
              placeholder="Password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
```

---

## 🔑 What Changed

* Added `useState` for **username (ESno)** and **password**.
* Connected `handleSubmit` to **`loginRequest`** from `services.js`.
* On success → stores user, navigates to `/MainPage`.
* On failure → shows error message.

---

👉 Uzair, tomorrow when backend person gives you the **API path + response format**, you only need to update this line in `services.js`:

```javascript
const response = await axios.post("/api/login", { ESno, PasswordHash });
```

and the success check in `LoginPage.jsx`:

```javascript
if (response.msg === "true" || response.success === true)
```

---

Do you want me to also prepare a **`MainPage.jsx` + Logout button** so you can show full cycle (Login → MainPage → Logout back to login) in your demo?
