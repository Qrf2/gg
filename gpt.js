Perfect Uzair 🔥 now we’re fully aligned.
You want the **entire project structure** (except `MainPage.jsx`, which you already have working) with all files written out, **full code** and **clear comments** telling you *exactly where to put the intranet API URLs your backend gave you*.

Let’s do it step by step — I’ll lay out the folder structure, then give you the full code for each file with `// TODO: put API URL here` markers so you know exactly what to edit when backend provides the endpoints.

---

# 📂 Project Structure (NCC25)

```
src/
 ├── App.jsx
 ├── context/
 │    └── AuthContext.jsx
 ├── routes/
 │    └── ProtectedRoute.jsx
 ├── services/
 │    ├── api.js
 │    ├── authService.js
 │    └── requestService.js
 ├── pages/
 │    ├── LoginPage.jsx
 │    ├── NewUserRequest.jsx
 │    └── AdminDashboard.jsx
 └── ncc25/
      └── index.js
```

---

## 1) `src/services/api.js`

👉 This is the **only place** you’ll put the intranet API URLs the backend gives you.

```javascript
// src/services/api.js
import axios from "axios";

// Create a shared axios instance
export const api = axios.create({
  withCredentials: false, // change to true if backend uses cookies
  headers: { "Content-Type": "application/json" },
});

// 🔑 API endpoints — replace with intranet URLs when backend gives them
export const ENDPOINTS = {
  LOGIN: "https://172.32.3.12:2220/api/account/AuthPPortaloffDptCiv", // TODO: Login URL (you already have)

  MODELS_AND_LIMITS: "https://172.32.3.12:2220/api/account/AuthPPortalOffAirCiv", // TODO: for models/limits

  SUBMIT_USER_REQUEST: "https://172.32.3.12:2220/api/requests/submit", // TODO: backend will give

  USER_REQUEST_STATUS: "https://172.32.3.12:2220/api/requests/user-status", // TODO: backend will give

  ADMIN_LIST_REQUESTS: "https://172.32.3.12:2220/api/requests/pending", // TODO: backend will give
  ADMIN_APPROVE_ONE: (id) => `https://172.32.3.12:2220/api/requests/${id}/approve`, // TODO
  ADMIN_EDIT_QUOTAS: (id) => `https://172.32.3.12:2220/api/requests/${id}/edit`,   // TODO
  ADMIN_APPROVE_ALL: "https://172.32.3.12:2220/api/requests/approve-all", // TODO
  ADMIN_APPROVE_BY_PTYPE: (pType) => `https://172.32.3.12:2220/api/requests/approve-all/${pType}`, // TODO
};
```

---

## 2) `src/services/authService.js`

👉 Handles login, fetching models, submitting requests, admin actions.

```javascript
// src/services/authService.js
import { api, ENDPOINTS } from "./api";

// Login API
export async function login({ Pakno, PType, PasswordHash }) {
  const res = await api.post(ENDPOINTS.LOGIN, { Pakno, PType, PasswordHash });
  return res.data; // Backend returns { status: true/false, isNewUser, isAdmin, ... }
}

// Load models & limits for request form
export async function fetchModelsAndLimits() {
  const res = await api.get(ENDPOINTS.MODELS_AND_LIMITS);
  return res.data; // { models: [...], defaultPromptsPerDay, maxTokensPerResponse }
}

// Submit new user request
export async function submitUserRequest(payload) {
  const res = await api.post(ENDPOINTS.SUBMIT_USER_REQUEST, payload);
  return res.data; // { ok: true, createdAt }
}

// ---------- Admin ----------
export async function adminListPending() {
  const res = await api.get(ENDPOINTS.ADMIN_LIST_REQUESTS);
  return res.data; // { requests: [...] }
}

export async function adminApproveOne(requestId, allocation = {}) {
  const res = await api.post(ENDPOINTS.ADMIN_APPROVE_ONE(requestId), allocation);
  return res.data;
}

export async function adminEditQuotas(requestId, allocation) {
  const res = await api.post(ENDPOINTS.ADMIN_EDIT_QUOTAS(requestId), allocation);
  return res.data;
}

export async function adminApproveAll(payload = {}) {
  const res = await api.post(ENDPOINTS.ADMIN_APPROVE_ALL, payload);
  return res.data;
}

export async function adminApproveByPType(pType, payload = {}) {
  const res = await api.post(ENDPOINTS.ADMIN_APPROVE_BY_PTYPE(pType), payload);
  return res.data;
}
```

---

## 3) `src/services/requestService.js`

👉 Helper to check a user’s request status.

```javascript
// src/services/requestService.js
import { api, ENDPOINTS } from "./api";

// Fetch user request status
export async function fetchUserRequestStatus(Pakno) {
  // Example GET: /requests/user-status?Pakno=TC001129
  const url = `${ENDPOINTS.USER_REQUEST_STATUS}?Pakno=${encodeURIComponent(Pakno)}`;
  const res = await api.get(url);
  return res.data; // { status: "pending"/"approved"/"none", ... }
}
```

---

## 4) `src/context/AuthContext.jsx`

👉 Handles saving login state.

```javascript
// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem("ncc25_session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = (data) => {
    setSession(data);
    localStorage.setItem("ncc25_session", JSON.stringify(data));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("ncc25_session");
  };

  const value = useMemo(() => ({ session, login, logout }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

---

## 5) `src/routes/ProtectedRoute.jsx`

👉 Blocks access to pages unless logged in.

```javascript
// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { session } = useAuth();
  if (!session || !session.status) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
```

---

## 6) `src/pages/LoginPage.jsx`

👉 Full login form with **Pakno, PasswordHash, and PType (1/2/3)**.

```javascript
// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { CodeCraftLogo, TopRightLogo, TitleDots } from "../assets/Logos";
import { AnimatedNetwork, FloatingTriangle } from "../assets/Decorations";
import { UserIcon, LockIcon } from "../assets/Icons";

export default function LoginPage() {
  const [Pakno, setPakno] = useState("");
  const [PasswordHash, setPasswordHash] = useState("");
  const [PType, setPType] = useState("3");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login: saveSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!Pakno || !PasswordHash) {
      setError("Please enter credentials");
      return;
    }

    try {
      setLoading(true);
      const data = await login({ Pakno, PType, PasswordHash });

      if (data?.status === true) {
        saveSession({
          status: true,
          Pakno,
          PType,
          isNewUser: !!data.isNewUser,
          isAdmin: !!data.isAdmin,
          token: data.token || null,
        });
        navigate("/main");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="top-left-logo"><CodeCraftLogo /></div>
      <div className="top-right-logo"><TopRightLogo /></div>

      <header className="main-title">
        <div className="title-logo"><CodeCraftLogo /></div>
        <h1 className="title-text">
          O GPT – NCC25
          <div className="title-dots"><TitleDots /></div>
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
              value={PasswordHash}
              onChange={(e) => setPasswordHash(e.target.value)}
            />
          </div>

          <div className="input-group">
            <select
              className="form-input"
              value={PType}
              onChange={(e) => setPType(e.target.value)}
            >
              <option value="1">Officer</option>
              <option value="2">Airman</option>
              <option value="3">Civilian</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Please wait…" : "LOGIN"}
          </button>
        </form>
      </main>

      <div className="animated-network"><AnimatedNetwork /><span className="network-text">NCC25</span></div>
      <div className="floating-triangle"><FloatingTriangle /></div>
    </div>
  );
}
```

---

## 7) `src/pages/NewUserRequest.jsx`

👉 For new users only.

```javascript
// src/pages/NewUserRequest.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchModelsAndLimits, submitUserRequest } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function NewUserRequest() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [promptsPerDay, setPromptsPerDay] = useState(10);
  const [tokensPerResponse, setTokensPerResponse] = useState(1500);
  const [justification, setJustification] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!session) navigate("/login");
    (async () => {
      const data = await fetchModelsAndLimits();
      setModels(data.models || []);
      if (data.defaultPromptsPerDay) setPromptsPerDay(data.defaultPromptsPerDay);
      if (data.maxTokensPerResponse) setTokensPerResponse(data.maxTokensPerResponse);
    })();
  }, [session, navigate]);

  const toggleModel = (m) => {
    setSelectedModels((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      Pakno: session.Pakno,
      PType: session.PType,
      selectedModels,
      promptsPerDay,
      tokensPerResponse,
      justification,
    };
    const res = await submitUserRequest(payload);
    if (res?.ok) setOk(true);
  };

  if (ok) {
    return (
      <div className="p-4">
        <h2>Request submitted</h2>
        <p>Please wait up to 24 hours for admin approval.</p>
        <button onClick={() => navigate("/main")} className="btn">Back to Main</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1>New User Request</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Models</label>
          <div>
            {models.map((m) => (
              <button key={m} type="button" onClick={() => toggleModel(m)}>
                {selectedModels.includes(m) ? `✓ ${m}` : m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label>Prompts per day</label>
          <input type="number" value={promptsPerDay} onChange={(e) => setPromptsPerDay(e.target.value)} />
        </div>

        <div>
          <label>Tokens per response</label>
          <input type="number" value={tokensPerResponse} onChange={(e) => setTokensPerResponse(e.target.value)} />
        </div>

        <div>
          <label>Justification</label>
          <textarea value={justification} onChange={(e) => setJustification(e.target.value)} />
        </div>

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}
```

---

## 8) `src/pages/AdminDashboard.jsx`

👉 For admins only.

```javascript
// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  adminListPending,
  adminApproveOne,
  adminEditQuotas,
  adminApproveAll,
  adminApproveByPType,
} from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!session?.isAdmin) navigate("/main");
    load();
  }, [session, navigate]);

  const load = async () => {
    const data = await adminListPending();
    const sorted = (data.requests || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setRequests(sorted);
  };

  const approve = async (r) => {
    const allocation = {
      models: r.selectedModels,
      promptsPerDay: r.promptsPerDay,
      tokensPerResponse: r.tokensPerResponse,
      approvedBy: session.Pakno,
    };
    await adminApproveOne(r.id, allocation);
    load();
  };

  return (
    <div className="p-4">
      <h1>Admin Dashboard</h1>
      <button onClick={() => adminApproveAll({ approvedBy: session.Pakno })}>Approve All</button>
      <div>
        {requests.map((r) => (
          <div key={r.id} className="border p-2 my-2">
            <p>{r.Pakno} — {r.PType}</p>
            <p>Models: {r.selectedModels.join(", ")}</p>
            <p>Prompts/day: {r.promptsPerDay} | Tokens: {r.tokensPerResponse}</p>
            <button onClick={() => approve(r)}>Approve</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 9) `src/App.jsx`

👉 Wiring routes together.

```javascript
// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import NewUserRequest from "./pages/NewUserRequest";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
          <Route path="/request" element={<ProtectedRoute><NewUserRequest /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## 10) `src/ncc25/index.js`

👉 Central export file.

```javascript
// src/ncc25/index.js
export { default as App } from "../App";
export { default as LoginPage } from "../pages/LoginPage";
export { default as NewUserRequest } from "../pages/NewUserRequest";
export { default as AdminDashboard } from "../pages/AdminDashboard";
export { default as ProtectedRoute } from "../routes/ProtectedRoute";
export * from "../services/api";
export * from "../services/authService";
export * from "../services/requestService";
export * from "../context/AuthContext";
```

---

✅ That’s **all files except MainPage.jsx**.

👉 Every time backend gives you an intranet URL, just open **`src/services/api.js`** and replace the `ENDPOINTS.*` value. Everything else will auto-use it.

---

Do you


want me to also wire the **logic to redirect new users to `/request`** automatically after login (based on `isNewUser === true` from backend), so you don’t have to check manually?
