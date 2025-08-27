# Code Craft AI - Authentication Setup Guide

This project is a React + Vite frontend for an offline government security AI assistant. This guide explains how to implement and use real authentication (login) in the app.

---
api.js
App.jsx
LoginPage.jsx

## 1. How Authentication Works
- **No signup:** User credentials are created by admins directly in the database.
- **Login only:** Users log in with their username and password.
- **Frontend** sends login info to a backend API (`/api/login`).
- **Backend** checks credentials and returns a token if valid.

# Code Craft AI - Authentication Setup Guide

This project is a React + Vite frontend for an offline government security AI assistant. This guide explains how to add and use real login (authentication) in simple steps.

---

## How Authentication Works (Simple Explanation)

- There is **no signup**. Only admins can add users to the database.
- Users log in with their username and password.
- The frontend sends your login info to a backend API (`/api/login`).
- The backend checks if your info is correct and sends back a token if you are allowed in.
- The frontend saves this token and lets you use the app.

---

## What Should the API Look Like?

- **Endpoint:** `/api/login` (POST)
- **Request Body:**
   ```json
   {
      "username": "user1",
      "password": "yourpassword"
   }
   ```
- **Response if login is correct:**
   ```json
   {
      "token": "your-session-token-here"
   }
   ```
- **Response if login is wrong:**
   - Status: 401 Unauthorized
   - Body: `{ "error": "Invalid credentials" }`

---

## Dummy API for Testing (Small Example)

If you want to test login without a real backend, use this code:

```js
// Save as server.js and run with: node server.js
const express = require('express');
const app = express();
app.use(express.json());
const USERS = [{ username: 'admin', password: 'secret' }];
app.post('/api/login', (req, res) => {
   const { username, password } = req.body;
   const user = USERS.find(u => u.username === username && u.password === password);
   if (user) res.json({ token: 'dummy-token-123' });
   else res.status(401).json({ error: 'Invalid credentials' });
});
app.listen(3001, () => console.log('Dummy API running on http://localhost:3001'));
```

**How to use:**
1. Install Node.js if you don't have it.
2. Save the code above as `server.js`.
3. Run `npm install express` in that folder.
4. Run `node server.js`.
5. In your frontend, set the API URL to `http://localhost:3001/api` (see below).

---

## Dummy API for 150,000+ Users (Database Example)

If you want to test with many users, use this code:

```js
// Save as server_db.js and run with: node server_db.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const app = express();
app.use(express.json());
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
   db.run('CREATE TABLE users (username TEXT, password TEXT)');
   const stmt = db.prepare('INSERT INTO users VALUES (?, ?)');
   for (let i = 1; i <= 150000; i++) {
      stmt.run(`user${i}`, bcrypt.hashSync('secret', 8));
   }
   stmt.finalize();
});
app.post('/api/login', (req, res) => {
   const { username, password } = req.body;
   db.get('SELECT password FROM users WHERE username = ?', [username], (err, row) => {
      if (err || !row) return res.status(401).json({ error: 'Invalid credentials' });
      if (bcrypt.compareSync(password, row.password)) res.json({ token: 'dummy-token-123' });
      else res.status(401).json({ error: 'Invalid credentials' });
   });
});
app.listen(3002, () => console.log('Dummy DB API running on http://localhost:3002'));
```

**How to use:**
1. Install Node.js if you don't have it.
2. Save the code above as `server_db.js`.
3. Run `npm install express sqlite3 bcryptjs` in that folder.
4. Run `node server_db.js`.
5. In your frontend, set the API URL to `http://localhost:3002/api` (see below).
6. Test users: `user1` to `user150000`, all with password `secret`.

---

## How Real Organizations Manage Many Users

- All users are stored in a secure database (not in code).
- Passwords are always hashed (never plain text).
- Admins add/remove users using special tools or scripts.
- Sometimes, login is connected to company systems like LDAP or SSO.

---

## Step-by-Step: What to Do in Each File

### 1. `.env` file (API URL)
- Copy `.env.example` to `.env` in your project folder.
- Set `VITE_API_URL` to your backend API URL:
   - For the small dummy API: `VITE_API_URL=http://localhost:3001/api`
   - For the big dummy API: `VITE_API_URL=http://localhost:3002/api`
   - For real backend: use your real API URL or leave blank for `/api`

### 2. `src/pages/MainPage/components/api.js`
- This file has the `loginUser` function.
- It sends your username and password to the backend API.
- It uses the API URL from the `.env` file.
- You do not need to change this file unless your backend uses a different endpoint or response format.

### 3. `src/components/LoginPage.jsx`
- This file shows the login form.
- When you submit, it calls `loginUser`.
- If login is correct, it saves the token and lets you in.
- If login is wrong, it shows an error.

### 4. `src/App.jsx`
- This file keeps track of whether you are logged in.
- If you log out, it clears the token and sends you back to the login page.

### 5. `AUTH_README.md`
- This file (the one you are reading) explains everything step by step.

### 6. (Optional) `server.js` or `server_db.js`
- These are dummy backend files for testing only.
- You do not need them if you have a real backend.

---

## How to Use the App (Step by Step)

1. Make sure your backend API is running (or use the dummy API above).
2. Set the API URL in your `.env` file.
3. In your project folder, run:
    ```sh
    npm install
    npm run dev
    ```
4. Open the app in your browser (usually http://localhost:5173).
5. Log in with your username and password.
6. If login works, you will see the main page. If not, you will see an error.
7. To log out, click the logout button in the sidebar.

---

## Security Notes
- No signup for users. Only admins can add users.
- Passwords must be hashed in the backend database.
- Use HTTPS and httpOnly cookies for best security in production.

---

## Troubleshooting
- If login does not work, check your backend API is running and accessible from the frontend.
- Open browser dev tools (F12) and check the Network tab for errors on `/api/login`.
- Make sure CORS is set up correctly on your backend if frontend and backend are on different ports.

---

## Example Backend Response
```json
{
   "token": "your-session-token-here"
}
```

---

## Questions?
If you have never done this before, follow the steps above. If you get stuck, ask your backend/API team for the correct login endpoint and response format.
   ```sh
   npm install
   npm run dev
   ```
   Open the app in your browser (usually http://localhost:5173).

2. **Login:**
   - Enter your username and password on the login screen.
   - The app will send your credentials to `/api/login`.
   - If valid, you will be logged in and redirected to the main page.
   - If invalid, you will see an error message.

3. **Logout:**
   - Click the logout button in the sidebar to log out and clear your session.

---


## 3. Files Involved in Authentication

| File                                         | Purpose                                                      |
|-----------------------------------------------|--------------------------------------------------------------|
| `src/components/LoginPage.jsx`                | Login form UI and logic, calls the login API                 |
| `src/pages/MainPage/components/api.js`        | Contains `loginUser` function for API call                   |
| `src/App.jsx`                                | Manages authentication state and route protection            |
| `AUTH_README.md`                             | This guide                                                   |

If you use the dummy backend:
| File         | Purpose                                 |
|--------------|-----------------------------------------|
| `server.js`  | Dummy backend API for local testing     |

---

---

## 4. How to Implement in Your Own Project

1. **Backend:**
   - Make sure your backend exposes a `/api/login` endpoint that checks username/password and returns a token.

2. **Frontend:**
   - The code is already set up to call `/api/login`.
   - If your backend uses a different endpoint or response format, update `loginUser` in `api.js`.
   - The token is stored in `localStorage` for session management.

---

## 5. Security Notes
- This app does not allow user signup for security reasons.
- All credentials are managed by admins in the database.
- For best security, use HTTPS and httpOnly cookies for tokens if possible.

---

## 6. Troubleshooting
- If login does not work, check your backend API is running and accessible from the frontend.
- Open browser dev tools (F12) and check the Network tab for errors on `/api/login`.
- Make sure CORS is configured correctly on your backend if frontend and backend are on different ports.

---

## 7. Example Backend Response
```json
{
  "token": "your-session-token-here"
}
```

---

## 8. Questions?
If you have never done this before, follow the steps above. If you get stuck, ask your backend/API team for the correct login endpoint and response format.
