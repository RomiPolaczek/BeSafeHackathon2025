import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInAnonymously } from 'firebase/auth';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
      navigate('/main');
    } catch (error) {
      console.error('Error signing in anonymously:', error);
    }
  };

  return (
    <div className={styles.homeContainer}>
      <img 
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/project-logo-aOREI8Hfta2vRT5AsPqVe6FDFMS7Go.png" 
        alt="SafeChat Logo" 
        className={styles.logo}
      />
      <h1 className={styles.headline}>SafeChat</h1>
      <h2 className={styles.subtitle}>
        Welcome to SafeChat, the ultimate platform for secure and positive communication.
        Here, your conversations are safe, respectful, and focused on spreading kindness.
      </h2>
      <div className={styles.buttonsContainer}>
        <button onClick={handleLogin} className={styles.button}>Login</button>
        <button onClick={handleSignUp} className={styles.button}>Sign Up</button>
        <button onClick={handleAnonymousLogin} className={styles.button}>Join Anonymously</button>
      </div>
    </div>
  );
};

export default HomePage;

