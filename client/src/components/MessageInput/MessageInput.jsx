import React, { useState, useRef, useCallback } from 'react';
import { Send, Image } from 'lucide-react';
import axios from 'axios';
import styles from './MessageInput.module.css';
import EmojiPicker from '../EmojiPicker/EmojiPicker';

const MessageInput = ({ onSendMessage, onTyping, currentUser }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      setShowEmojiPicker(false);
    }
  }, [message, onSendMessage]);

  const handleChange = useCallback((e) => {
    setMessage(e.target.value);
    onTyping();
  }, [onTyping]);

  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post('http://localhost:3001/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${currentUser.token}`
          }
        });

        const imageUrl = `http://localhost:3001${response.data.imageUrl}`;
        onSendMessage(imageUrl, 'image');
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  }, [currentUser.token, onSendMessage]);

  const handleEmojiSelect = useCallback((emoji) => {
    setMessage(prevMessage => prevMessage + emoji.native);
    setShowEmojiPicker(false);
  }, []);

  return (
    <div className={styles.inputContainer}>
      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <div className={styles.inputWrapper}>
          <label htmlFor="imageUpload" className={styles.iconButton}>
            <Image size={20} />
            <input
              type="file"
              id="imageUpload"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className={styles.imageUploadInput}
              disabled={isUploading}
            />
          </label>
          
          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Type a message..."
            className={styles.messageInput}
            disabled={isUploading}
          />

          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            showPicker={showEmojiPicker}
            setShowPicker={setShowEmojiPicker}
          />
        </div>

        <button 
          type="submit" 
          className={`${styles.sendButton} ${(!message.trim() || isUploading) ? styles.disabled : ''}`}
          disabled={!message.trim() || isUploading}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

