import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import WelcomeMessage from '../../components/WelcomeMessage/WelcomeMessage';
import styles from './MainPage.module.css';

const MainPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.mainPageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>SafeChat Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </header>
      <WelcomeMessage />
      <Link to="/chat" className={styles.goToChatButton}>Go to Chat</Link>
    </div>
  );
};

export default MainPage;

