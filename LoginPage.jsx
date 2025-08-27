import React from 'react';
import { CodeCraftLogo, TopRightLogo, TitleDots } from '../assets/Logos';
import { AnimatedNetwork, FloatingTriangle } from '../assets/Decorations';
import { UserIcon, LockIcon } from '../assets/Icons';
import { loginUser } from './api';

function LoginPage({ onLoginSuccess }) {
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const username = e.target[0].value;
    const password = e.target[1].value;
    try {
      const data = await loginUser(username, password);
      // Save token/session as needed
      localStorage.setItem('authToken', data.token); // or use cookies if backend sets them
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
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
              required
            />
          </div>
          <div className="input-group">
            <LockIcon />
            <input 
              type="password" 
              className="form-input" 
              placeholder="Password" 
              aria-label="Password"
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
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
