import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeCraftLogo, TopRightLogo, TitleDots } from '../assets/Logos';
import { AnimatedNetwork, FloatingTriangle } from '../assets/Decorations';
import { UserIcon, LockIcon } from '../assets/Icons';
import { login } from './authService';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Username and password are required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(username, password);

      if (response.success) {
        // On successful login, navigate to the main page.
        // You can change '/main' to your desired route.
        navigate('/main');
      } else {
        setError(response.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      // The service should catch and format the error, but this is a fallback.
      setError('An unexpected error occurred. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          {error && <p style={{color: 'red', textAlign: 'center', marginTop: '1rem'}}>{error}</p>}
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
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
