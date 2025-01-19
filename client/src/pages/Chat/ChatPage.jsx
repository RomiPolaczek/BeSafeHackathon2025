import { useParams } from 'react-router-dom';
import styles from './ChatPage.module.css';
import SearchBar from '../../components/SearchBar/SearchBar';

const ChatPage = () => {
  const { chatId } = useParams();

  return (
    <div className={styles.chatPageContainer}>
      <h1 className={styles.title}>Chat {chatId}</h1>
      <p className={styles.text}>This is the chat room for Chat {chatId}.</p>
      <div className={styles.chatWindow}>
        <p>Start chatting here!</p>
      </div>
    </div>
  );
};

export default ChatPage;

