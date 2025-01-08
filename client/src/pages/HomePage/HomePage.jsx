import styles from './Home.module.css';
import RandomDuck from '../../components/RandomDuck/RandomDuck.jsx';


const Home = () => {
  return (
    <div className={styles.home}>
      <h1 className={styles.headline}>Duck It</h1>
      <RandomDuck />
    </div>
  );
};

export default Home;
