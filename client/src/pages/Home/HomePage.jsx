import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import photo from "../../assets/homePage-photo.png";

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className={styles.homeContainer}>
      {/* כותרת ראשית */}
      <h1 className={styles.mainTitle}>Welcome to</h1>
      
      {/* כותרת משנית */}
      <h2 className={styles.subTitle}>SafeChat!</h2>
      <h2 className={styles.subtitle}>
      Together, we're creating a safer space online!<br />
      Join us on our journey to make the digital world a better place by empowering you with the tools and knowledge to feel confident, secure, and happy while connecting in the virtual space.
      </h2>

      <div className={styles.buttonsContainer}>
        <button onClick={handleLogin} className={styles.button}>Login</button>
        <button onClick={handleSignUp} className={styles.button}>Sign Up</button>
      </div>

      {/* הצגת התמונה */}
      <div className={styles.imageContainer}>
        <img src={photo} alt="SafeChat illustration" className={styles.image} />
      </div>
    </div>
  );
};

export default HomePage;
