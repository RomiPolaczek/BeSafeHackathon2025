import React from 'react';
import styles from './FeedbackModal.module.css';

const FeedbackModal = ({ isOpen, feedback, onClose, onEmailTrustedAdult }) => {
    if (!isOpen) return null; // Don't render the modal if it's not open

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Are you sure about that?</h2>
                <p>{feedback}</p>
                <button onClick={onClose} className={styles.closeButton}>I get it! I'll write something else</button>
                <button className={styles.emailButton} onClick={onEmailTrustedAdult}>I'd like to ask an adult</button>
            </div>
        </div>
    );
};

export default FeedbackModal;
