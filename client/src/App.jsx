import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home/HomePage';
import Login from './pages/Login/LoginPage';
import SignUp from './pages/SignUp/SignUpPage';
import MainPage from './pages/MainPage/MainPage';
import ChatPage from './pages/Chat/ChatPage';
import PrivateRoute from './components/PrivateRoute';
import styles from './App.module.css';
import projectLogo from './assets/project-logo.png';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className={styles.app}>
          <header className={styles.appHeader}>
            <img src={projectLogo || "/placeholder.svg"} alt="SafeChat Logo" className={styles.appLogo} />
            <nav className={styles.appNav}>
              <Link to="/" className={styles.appLink}>Home</Link>
              <Link to="/login" className={styles.appLink}>Login</Link>
              <Link to="/signup" className={styles.appLink}>Sign Up</Link>
            </nav>
          </header>

          <main className={styles.main}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/main" element={<PrivateRoute><MainPage /></PrivateRoute>} />
              <Route path="/chat/:chatId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            </Routes>
          </main>

          <footer className={styles.footer}>
            <p>&copy; 2025 SafeChat</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

