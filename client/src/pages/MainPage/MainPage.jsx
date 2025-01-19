import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
import styles from './MainPage.module.css';

const MainPage = () => {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const db = getFirestore();
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatsList);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={styles.mainPageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome, {auth.currentUser?.displayName || 'User'}!</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </header>
      <main>
        <h2 className={styles.chatListTitle}>Available Chats:</h2>
        <div className={styles.chatList}>
          {chats.map((chat) => (
            <div key={chat.id} className={styles.chatItem}>
              <Link to={`/chat/${chat.id}`} className={styles.navLink}>
                {chat.name}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MainPage;

