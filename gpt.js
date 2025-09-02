Legendary — let’s do this end-to-end, Uzair. 🚀
I’ll rebuild the whole front-end flow as one clean, drop-in package (all files), wire the login → new-user → pending → admin → approved flows exactly how you described, and give a step-by-step guide so you can paste, replace the single place where APIs live, run it on the intranet, and demo it. No questions asked — full working code scaffold + instructions.

---

## ✅ What you’ll get (single sweep)

* All source files (React) for the full flow: login, session, protected routes, new-user request, pending page, admin dashboard, main page, services.
* One single file to edit for **all API URLs**: `src/services/api.js` (I’ve prefilled the login URL you gave).
* Comments `// TODO:` where you must change endpoints/field names if backend response fields differ.
* Step-by-step instructions to install (online or offline), run, test, and debug.

---

# Project tree (place under `src/`)

```
src/
 ├── App.jsx
 ├── ncc25/
 │    └── index.js
 ├── context/
 │    └── AuthContext.jsx
 ├── pages/
 │    ├── AdminDashboard.jsx
 │    ├── LoginPage.jsx
 │    ├── MainPage.jsx
 │    ├── NewUserRequest.jsx
 │    └── PendingApproval.jsx
 ├── routes/
 │    └── ProtectedRoute.jsx
 └── services/
      ├── api.js
      ├── authService.js
      └── requestService.js
```

---

# 1) `src/services/api.js` — **single place for all API URLs**

Put the intranet URLs here. Replace the `TODO` endpoints with the exact ones backend gives later (only this file needs edits).

```javascript
// src/services/api.js
import axios from "axios";

/**
 * Central axios instance used by all services.
 * If backend gives token, we'll set api.defaults.headers.Authorization on login.
 */
export const api = axios.create({
  withCredentials: false, // change if backend uses cookies
  headers: { "Content-Type": "application/json" },
});

// ----------------- CHANGE ONLY HERE -----------------
// Put all intranet endpoints here. You already gave the login URL:
const BASE = "https://172.32.3.12:2220"; // base used to build other endpoints (optional)

// NOTE: Replace endpoints below if backend gives different paths. Only update values in this file.
export const ENDPOINTS = {
  LOGIN: `${BASE}/api/account/AuthPPortaloffDptCiv`,       // ✅ your login URL (given)
  MODELS_AND_LIMITS: `${BASE}/api/account/AuthPPortalOffAirCiv`, // TODO: confirm exact path (backend mentioned this)
  SUBMIT_USER_REQUEST: `${BASE}/api/requests/submit`,     // TODO: backend should provide
  USER_REQUEST_STATUS: `${BASE}/api/requests/user-status`,// TODO: backend should provide
  ADMIN_LIST_REQUESTS: `${BASE}/api/requests/pending`,    // TODO
  ADMIN_APPROVE_ONE: (id) => `${BASE}/api/requests/${id}/approve`,   // TODO
  ADMIN_EDIT_QUOTAS: (id) => `${BASE}/api/requests/${id}/edit`,      // TODO
  ADMIN_APPROVE_ALL: `${BASE}/api/requests/approve-all`,             // TODO
  ADMIN_APPROVE_BY_PTYPE: (pType) => `${BASE}/api/requests/approve-all/${pType}`, // TODO
};
// ----------------- END CHANGE ZONE -----------------

// Export default for convenience
export default { api, ENDPOINTS };
```

> Where to edit: **only** edit `ENDPOINTS.*` values in this file. Keep `BASE` if backend uses same host; if backend gives full URLs, paste them.

---

# 2) `src/services/authService.js` — auth & admin actions

```javascript
// src/services/authService.js
import { api, ENDPOINTS } from "./api";

/**
 * Login
 * Request: { Pakno, PType, PasswordHash }
 * Response (expected): { status: true/false, isNewUser?: boolean, isAdmin?: boolean, approved?: boolean, token?: string, limits?: {...} }
 * NOTE: if your backend uses other field names, adjust accordingly here.
 */
export async function login({ Pakno, PType, PasswordHash }) {
  const res = await api.post(ENDPOINTS.LOGIN, { Pakno, PType, PasswordHash });
  return res.data;
}

/** Fetch models & default limits (for NewUserRequest form) */
export async function fetchModelsAndLimits() {
  const res = await api.get(ENDPOINTS.MODELS_AND_LIMITS);
  return res.data;
}

/** Submit a new user request */
export async function submitUserRequest(payload) {
  // payload: { Pakno, PType, selectedModels, promptsPerDay, tokensPerResponse, justification }
  const res = await api.post(ENDPOINTS.SUBMIT_USER_REQUEST, payload);
  return res.data;
}

/** Admin functions */
export async function adminListPending() {
  const res = await api.get(ENDPOINTS.ADMIN_LIST_REQUESTS);
  return res.data;
}

export async function adminApproveOne(requestId, allocation = {}) {
  // allocation: { models:[], promptsPerDay, tokensPerResponse, approvedBy }
  const res = await api.post(ENDPOINTS.ADMIN_APPROVE_ONE(requestId), allocation);
  return res.data;
}

export async function adminEditQuotas(requestId, allocation = {}) {
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

# 3) `src/services/requestService.js` — helper to fetch user request status

```javascript
// src/services/requestService.js
import { api, ENDPOINTS } from "./api";

/**
 * Fetch latest request status for a user by Pakno
 * Expected response:
 *  - { status: "none" } // no request
 *  - { status: "pending", createdAt, ... }
 *  - { status: "approved", allocation: {...}, approvedAt, approvedBy }
 *
 * If your backend requires POST or differs, change this function accordingly.
 */
export async function fetchUserRequestStatus(Pakno) {
  const url = `${ENDPOINTS.USER_REQUEST_STATUS}?Pakno=${encodeURIComponent(Pakno)}`;
  const res = await api.get(url);
  return res.data;
}
```

---

# 4) `src/context/AuthContext.jsx` — session + token wiring

```javascript
// src/context/AuthContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { api } from "../services/api";

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

  // login saves session and adds token header for api
  const login = (data) => {
    setSession(data);
    localStorage.setItem("ncc25_session", JSON.stringify(data));
    if (data?.token) {
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    }
  };

  // logout clears everything
  const logout = () => {
    setSession(null);
    localStorage.removeItem("ncc25_session");
    delete api.defaults.headers.common.Authorization;
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

# 5) `src/routes/ProtectedRoute.jsx`

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

# 6) `src/pages/LoginPage.jsx` — full login + auto-redirect logic

```javascript
// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../services/authService";
import { useAuth } from "../context/AuthContext";

// If you have existing logo/components, keep imports; otherwise remove these lines.
import { CodeCraftLogo, TopRightLogo, TitleDots } from "../assets/Logos";
import { AnimatedNetwork, FloatingTriangle } from "../assets/Decorations";
import { UserIcon, LockIcon } from "../assets/Icons";

export default function LoginPage() {
  const [Pakno, setPakno] = useState("");
  const [PasswordHash, setPasswordHash] = useState("");
  const [PType, setPType] = useState("3"); // default civilian
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

      // Call backend login
      const data = await apiLogin({ Pakno, PType, PasswordHash });
      console.log("LOGIN RESPONSE:", data);

      // Backend success rule you confirmed earlier: response.data.status === true
      if (data?.status === true) {
        // Save session (includes token, flags)
        saveSession({
          status: true,
          Pakno,
          PType,
          isNewUser: !!data.isNewUser,
          isAdmin: !!data.isAdmin,
          approved: !!data.approved,
          token: data.token || null,
          limits: data.limits || null, // { models, promptsPerDay, tokensPerResponse }
        });

        // Auto-redirect logic:
        // - Admins go to /main (they can access admin panel from there)
        // - If user is new and not approved → /request
        // - If user submitted and pending (server might send approved=false but isNewUser=false) → /pending
        // - If approved → /main
        if (data?.isAdmin) {
          navigate("/main");
        } else if (data?.isNewUser && !data?.approved) {
          navigate("/request");
        } else if (!data?.approved) {
          navigate("/pending");
        } else {
          navigate("/main");
        }
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("Login error", err);
      setError("Server error — check backend or network");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {/* Top logos (if exist) */}
      <div className="top-left-logo"><CodeCraftLogo /></div>
      <div className="top-right-logo"><TopRightLogo /></div>

      <header className="main-title">
        <div className="title-logo"><CodeCraftLogo /></div>
        <h1 className="title-text">O GPT – NCC25 <div className="title-dots"><TitleDots /></div></h1>
      </header>

      <main className="login-form-container">
        <h2 className="form-title">User Credentials</h2>

        <form className="form-body" onSubmit={handleSubmit}>
          <div className="input-group">
            <UserIcon />
            <input
              type="text"
              placeholder="Pakno"
              value={Pakno}
              onChange={(e) => setPakno(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="input-group">
            <LockIcon />
            <input
              type="password"
              placeholder="Password"
              value={PasswordHash}
              onChange={(e) => setPasswordHash(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="input-group">
            <select value={PType} onChange={(e) => setPType(e.target.value)} className="form-input">
              <option value="1">Officer (PType=1)</option>
              <option value="2">Airman (PType=2)</option>
              <option value="3">Civilian (PType=3)</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

          <button type="submit" disabled={loading} className="login-button">
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

# 7) `src/pages/PendingApproval.jsx`

```javascript
// src/pages/PendingApproval.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function PendingApproval() {
  const { session } = useAuth();

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Request Submitted — Please wait</h2>
      <p className="mt-2">Pakno: <strong>{session?.Pakno}</strong></p>
      <p className="mt-2">Your request is under review by the admin. Please allow up to 24 hours.</p>
    </div>
  );
}
```

---

# 8) `src/pages/NewUserRequest.jsx` — form + submit + confirmation

```javascript
// src/pages/NewUserRequest.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchModelsAndLimits, submitUserRequest } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function NewUserRequest() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [promptsPerDay, setPromptsPerDay] = useState(10);
  const [tokensPerResponse, setTokensPerResponse] = useState(1500);
  const [justification, setJustification] = useState("");
  const [error, setError] = useState("");
  const [submittedAt, setSubmittedAt] = useState(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!session) return navigate("/login");
    (async () => {
      try {
        const data = await fetchModelsAndLimits();
        setModels(data.models || []);
        if (data.defaultPromptsPerDay) setPromptsPerDay(data.defaultPromptsPerDay);
        if (data.maxTokensPerResponse) setTokensPerResponse(data.maxTokensPerResponse);
      } catch (e) {
        console.error(e);
        setError("Failed to load model options");
      } finally {
        setLoading(false);
      }
    })();
  }, [session, navigate]);

  const toggleModel = (m) => {
    setSelectedModels((prev) => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (selectedModels.length === 0) { setError("Select at least one model"); return; }
    if (!justification.trim()) { setError("Provide a short justification"); return; }

    try {
      const payload = {
        Pakno: session.Pakno,
        PType: session.PType,
        selectedModels,
        promptsPerDay: Number(promptsPerDay),
        tokensPerResponse: Number(tokensPerResponse),
        justification: justification.trim(),
      };
      const res = await submitUserRequest(payload);
      if (res?.ok) {
        setSubmittedAt(res.createdAt || new Date().toISOString());
        setOk(true);
      } else {
        setError("Submission failed, contact admin");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while submitting");
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (ok) {
    return (
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-bold">Request submitted</h2>
        <p>Your request was submitted successfully. Submitted at: <strong>{new Date(submittedAt).toLocaleString()}</strong></p>
        <p>Please wait up to 24 hours. When admin approves, your account will be activated and you can use O GPT.</p>
        <button className="px-3 py-2 rounded bg-gray-800 text-white" onClick={() => navigate("/pending")}>Back to status</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">New User Request</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block font-medium mb-1">Models</label>
          <div className="flex flex-wrap gap-2">
            {models.length === 0 && <p className="text-sm text-gray-600">No models available from server.</p>}
            {models.map((m) => (
              <button type="button" key={m} onClick={() => toggleModel(m)}
                className={`px-3 py-1 border rounded ${selectedModels.includes(m) ? "bg-black text-white" : ""}`}>
                {selectedModels.includes(m) ? `✓ ${m}` : m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label>Prompts per day</label>
          <input type="number" min={1} value={promptsPerDay} onChange={(e) => setPromptsPerDay(e.target.value)} className="form-input" />
        </div>

        <div>
          <label>Display tokens per response</label>
          <input type="number" min={50} value={tokensPerResponse} onChange={(e) => setTokensPerResponse(e.target.value)} className="form-input" />
        </div>

        <div>
          <label>Short justification</label>
          <textarea rows={4} value={justification} onChange={(e) => setJustification(e.target.value)} className="form-input" />
        </div>

        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Submit Request</button>
      </form>
    </div>
  );
}
```

---

# 9) `src/pages/AdminDashboard.jsx` — admin approve/edit flows

```javascript
// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminListPending, adminApproveOne, adminEditQuotas, adminApproveAll, adminApproveByPType } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.isAdmin) {
      navigate("/main");
      return;
    }
    refresh();
    // eslint-disable-next-line
  }, [session]);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await adminListPending();
      const list = data.requests || [];
      // sort newest first
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(list);
    } catch (e) {
      console.error(e);
      setError("Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (r) => {
    // quick prompt-based allocation (replace with modal UI later)
    const models = prompt("Comma-separated models to grant", (r.selectedModels || []).join(","));
    if (models === null) return;
    const promptsPerDay = Number(prompt("Prompts per day", String(r.promptsPerDay || 10)));
    const tokensPerResponse = Number(prompt("Tokens per response", String(r.tokensPerResponse || 1500)));

    const allocation = {
      models: models.split(",").map(s => s.trim()).filter(Boolean),
      promptsPerDay,
      tokensPerResponse,
      approvedBy: session.Pakno,
    };

    await adminApproveOne(r.id, allocation);
    await refresh();
  };

  const handleEdit = async (r) => {
    const models = prompt("Edit models", (r.allocation?.models || []).join(","));
    if (models === null) return;
    const promptsPerDay = Number(prompt("Prompts per day", String(r.allocation?.promptsPerDay || 10)));
    const tokensPerResponse = Number(prompt("Tokens per response", String(r.allocation?.tokensPerResponse || 1500)));

    await adminEditQuotas(r.id, {
      models: models.split(",").map(s => s.trim()).filter(Boolean),
      promptsPerDay,
      tokensPerResponse,
      editedBy: session.Pakno,
    });
    await refresh();
  };

  const handleApproveAll = async () => {
    if (!confirm("Approve all pending requests?")) return;
    await adminApproveAll({ approvedBy: session.Pakno });
    await refresh();
  };

  const handleApproveByPType = async (pType) => {
    if (!confirm(`Approve all requests for PType ${pType}?`)) return;
    await adminApproveByPType(pType, { approvedBy: session.Pakno });
    await refresh();
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin — Pending Requests</h1>
        <div className="flex gap-2">
          <button onClick={handleApproveAll} className="px-3 py-2 rounded bg-gray-800 text-white">Approve All</button>
          <select defaultValue="" onChange={(e) => e.target.value && handleApproveByPType(e.target.value)} className="border px-2 py-2 rounded">
            <option value="" disabled>Approve all by PType…</option>
            <option value="1">PType 1 (Officer)</option>
            <option value="2">PType 2 (Airman)</option>
            <option value="3">PType 3 (Civilian)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {requests.length === 0 && <p>No pending requests.</p>}
        {requests.map((r) => (
          <div key={r.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{r.Pakno} — PType {r.PType} — <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</span></div>
              <div className="text-sm">Requested: {(r.selectedModels || []).join(", ") || "—"}</div>
              <div className="text-sm">Requested Prompts/day: {r.promptsPerDay} | Tokens/resp: {r.tokensPerResponse}</div>
              <div className="text-sm text-gray-600">Justification: {r.justification || "—"}</div>
            </div>

            <div className="flex gap-2">
              <button className="px-3 py-2 border rounded" onClick={() => handleEdit(r)}>Edit</button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => handleApprove(r)}>Approve</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

# 10) `src/pages/MainPage.jsx` — shows user's allocation & admin entry

```javascript
// src/pages/MainPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchUserRequestStatus } from "../services/requestService";

export default function MainPage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requestInfo, setRequestInfo] = useState(null);

  useEffect(() => {
    if (!session || !session.status) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const data = await fetchUserRequestStatus(session.Pakno);
        setRequestInfo(data || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [session, navigate]);

  if (!session) return null;
  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Welcome, {session.Pakno} (PType {session.PType})</h1>
        <div className="flex gap-2">
          {session.isAdmin && <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={() => navigate("/admin")}>Admin Panel</button>}
          <button className="px-3 py-2 rounded bg-gray-800 text-white" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </div>
      </div>

      {/* New user / pending / approved flows */}
      {(!requestInfo || requestInfo.status === "none") && session.isNewUser && (
        <div className="p-3 rounded border border-yellow-400 bg-yellow-50">
          <p className="mb-1 font-medium">You must request access to O GPT</p>
          <button className="underline text-blue-700" onClick={() => navigate("/request")}>Open request form</button>
        </div>
      )}

      {requestInfo && requestInfo.status === "pending" && (
        <div className="p-3 rounded border border-orange-400 bg-orange-50">
          <p className="font-medium">Request submitted — please wait</p>
          <p className="text-sm">Submitted on: {new Date(requestInfo.createdAt).toLocaleString()}</p>
          <p className="text-sm mt-1">Admin will process your request. Usually within 24 hours.</p>
        </div>
      )}

      {requestInfo && requestInfo.status === "approved" && (
        <div className="p-3 rounded border border-green-400 bg-green-50">
          <h2 className="font-semibold">Your AI Allocation</h2>
          <p>Models: {(requestInfo.allocation?.models || []).join(", ") || "—"}</p>
          <p>Prompts / day: {requestInfo.allocation?.promptsPerDay ?? "—"}</p>
          <p>Tokens / response: {requestInfo.allocation?.tokensPerResponse ?? "—"}</p>
          <p className="text-sm mt-2">Approved by {requestInfo.approvedBy} on {new Date(requestInfo.approvedAt).toLocaleString()}</p>

          <div className="mt-3">
            <button onClick={() => navigate("/ai")} className="px-3 py-2 rounded bg-blue-600 text-white">Open O GPT</button>
          </div>
        </div>
      )}

      <div className="p-3 rounded border">
        <p>O GPT main workspace placeholder (chat UI will be integrated here).</p>
      </div>
    </div>
  );
}
```

---

# 11) `src/App.jsx` — app routes

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
import PendingApproval from "./pages/PendingApproval";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
          <Route path="/request" element={<ProtectedRoute><NewUserRequest /></ProtectedRoute>} />
          <Route path="/pending" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<div className="p-4">Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

# 12) `src/ncc25/index.js` — barrel

```javascript
// src/ncc25/index.js
export { default as App } from "../App";
export { default as LoginPage } from "../pages/LoginPage";
export { default as MainPage } from "../pages/MainPage";
export { default as NewUserRequest } from "../pages/NewUserRequest";
export { default as AdminDashboard } from "../pages/AdminDashboard";
export { default as PendingApproval } from "../pages/PendingApproval";
export { default as ProtectedRoute } from "../routes/ProtectedRoute";
export * from "../services/api";
export * from "../services/authService";
export * from "../services/requestService";
export * from "../context/AuthContext";
```

---

## Step-by-step guide — how to plug & run (do this now)

### 1) Paste files

* Replace or add the files under your `src/` folder exactly as above.
* Keep your `assets/*` icons and logos in place (Login uses them but it's okay if they’re missing — remove imports or stub them).

### 2) Edit API endpoints **(one place only)**

* Open `src/services/api.js`
* Confirm `BASE` and `ENDPOINTS.*` values:

  * `ENDPOINTS.LOGIN` should be exactly:
    `https://172.32.3.12:2220/api/account/AuthPPortaloffDptCiv` (you already had this)
  * Change other endpoints (`MODELS_AND_LIMITS`, `SUBMIT_USER_REQUEST`, `USER_REQUEST_STATUS`, `ADMIN_*`) to exact paths backend provides. If they don't give them, keep placeholders and ask backend for them tomorrow.

### 3) Install dependencies

If you have internet on your development machine:

```bash
npm install axios react-router-dom
# plus react/react-dom if not already installed
```

If the intranet PC is offline:

* On an internet PC: `npm pack axios` and `npm pack react-router-dom` → copy the `.tgz` files to USB.
* On intranet PC: `npm install ./axios-*.tgz ./react-router-dom-*.tgz`

### 4) Run dev server

```bash
npm start
# or if your project uses Vite: npm run dev
```

Open the app in browser on intranet PC. If the backend URL is accessible from that PC, login should connect.

### 5) Test flows (quick manual test)

* **Admin account**: login with admin credentials (backend should return `isAdmin: true`).

  * After login, click **Admin Panel** → you should see pending requests (empty initially).
* **New user**: login with a new Pakno (backend should return `isNewUser: true` and `approved: false`).

  * User will be redirected to `/request` (fill and submit).
  * After submit user sees confirmation and `/pending` shows message on next login.
* **Admin**: approve the user (AdminDashboard → Approve). Backend should mark request approved and set `allocation`.
* **User**: login again — now backend should return `approved: true` and `limits` (or `fetchUserRequestStatus` will return approved allocation). User sees allocation on `/main` and can open AI.

### 6) Debug tips

* Open browser console (F12) → you will see `LOGIN RESPONSE:` logs from `LoginPage.jsx`. Use that to match backend fields.
* If backend uses different field names (e.g., `success` instead of `status`), change the condition in `LoginPage.jsx` and/or normalize in `authService.login` before returning.
* If HTTPS cert is self-signed and browser blocks the request: ask backend to provide a trusted cert OR run browser with security exception for the intranet IP (IT will handle this). For Dev you can test using `http` if backend supports it.

---

## Quick mapping: where to put what (cheat-sheet)

* **API URLs** → `src/services/api.js` (`ENDPOINTS.*`) — *only this file*
* **Auth logic** → `src/services/authService.js` (uses api.js)
* **User request status** → `src/services/requestService.js`
* **Save session & token** → `src/context/AuthContext.jsx`
* **UI** pages → `src/pages/*` (login, main, request, pending, admin)
* **Routes** → `src/App.jsx`
* **Barrel export** → `src/ncc25/index.js`

---

## Small recommended polish (do when time allows)

* Replace `prompt()` in admin approve/edit with a modal UI (nicer demo).
* Add server-side paging for admin list when requests grow.
* Enforce prompts/day & tokens per response in the O GPT chat component client-side and server-side.
* Add toast notifications and better error handling.
* Add logs for admin actions & audit trail.

---

If you want, I’ll do any of these next:

* Convert admin `prompt()` dialog into a proper modal component and add CSS for it.
* Create a minimal `AI Chat` placeholder page that respects the allocated `promptsPerDay` and `tokensPerResponse`.
* Package `.tgz` files for offline install (axios + react-router-dom) ready for USB transfer.

Tell me which of the polish items you want next and I’ll code it now. Or say “done” and I’ll give you a short checklist to run your demo tomorrow.
