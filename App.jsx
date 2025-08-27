
import './App.css';
import LoginPage from './components/LoginPage';
import MainPage from './pages/MainPage/index';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';


function App() {
  // Check for token in localStorage
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('authToken'));

  return (
    <Router>
      <AppContent loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
    </Router>
  );
}


function AppContent({ loggedIn, setLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedIn && window.location.pathname !== '/main') {
      navigate('/main');
    } else if (!loggedIn && window.location.pathname !== '/') {
      navigate('/');
    }
  }, [loggedIn, navigate]);

  // On logout, clear token
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setLoggedIn(false);
  };

  return (
    <Routes>
      <Route path="/" element={<LoginPage onLoginSuccess={() => setLoggedIn(true)} />} />
      <Route path="/main" element={<MainPage onLogout={handleLogout} />} />
    </Routes>
  );
}

export default App;
