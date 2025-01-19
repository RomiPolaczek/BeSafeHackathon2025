import React from 'react';
import { Smile } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import styles from './EmojiPicker.module.css';

function EmojiPicker({ onEmojiSelect, showPicker, setShowPicker }) {
  return (
    <div className={styles.emojiPickerContainer}>
      <button 
        className={styles.emojiButton} 
        onClick={() => setShowPicker(!showPicker)}
        aria-label="Open emoji picker"
      >
        <Smile size={20} />
      </button>
      {showPicker && (
        <div className={styles.pickerContainer}>
          <Picker
            data={data}
            onEmojiSelect={onEmojiSelect}
            theme="light"
            set="native"
            previewPosition="none"
            skinTonePosition="none"
            emojiSize={20}
            emojiButtonSize={28}
            maxFrequentRows={0}
            perLine={8}
            icons="outline"
            noCountryFlags={false}
            searchPosition="static"
          />
        </div>
      )}
    </div>
  );
}

export default EmojiPicker;

