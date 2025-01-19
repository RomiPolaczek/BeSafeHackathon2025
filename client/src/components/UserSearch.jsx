import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import styles from './UserSearch.module.css';
import { Search } from 'lucide-react';

const UserSearch = ({ onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async (query) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/users/search?query=${query}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <ul className={styles.userList}>
        {searchResults.map(user => (
          <li key={user.id} onClick={() => onSelectUser(user)} className={styles.userItem}>
            <div className={styles.userAvatar}>{user.username[0].toUpperCase()}</div>
            <span className={styles.userName}>{user.username}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;

