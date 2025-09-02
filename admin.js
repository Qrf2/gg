Got it ✅ — so in your NCC25 system, **admin is not tied to PType** (they could be officer/airman/civilian), but there’s only **one special account** that backend marks as `isAdmin: true`.

That’s easy to handle:

* During login, backend will already tell you `isAdmin: true` for that one user.
* We don’t care what their `PType` is (1,2,3).
* If `isAdmin === true`, we show them a normal AI screen **plus** an extra button (like *“Admin Panel”*) → clicking it sends them to `/admin`.

---

## 🔑 Where to Adjust

### In `LoginPage.jsx`

Already saving:

```javascript
saveSession({
  status: true,
  Pakno,
  PType,
  isNewUser: !!data.isNewUser,
  isAdmin: !!data.isAdmin,   // ✅ backend flag
  token: data.token || null,
});
```

### In `App.jsx`

You’ve got:

```jsx
<Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
```

So route is already there.

### In `MainPage.jsx` (your AI screen)

Add this **only if user is admin**:

```jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome {session?.Pakno}</h1>

      {/* Normal AI UI here */}

      {session?.isAdmin && (
        <button
          onClick={() => navigate("/admin")}
          className="btn btn-admin"
        >
          Open Admin Dashboard
        </button>
      )}

      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

⚡ So workflow is now:

* **Normal user** logs in → if new, goes to `/request`. If approved, goes to `/main`.
* **Admin user** logs in → same as normal, but also sees an extra **Admin Panel button** → takes them to `/admin`.
* Only that one admin account (backend decides) will see the button.

---

👉 Do you want me to also add the **automatic redirect** after login (so:

* `isAdmin → /main` with button,
* `isNewUser → /request`,
* `else → /main`)
  so your seniors don’t have to click around manually?
