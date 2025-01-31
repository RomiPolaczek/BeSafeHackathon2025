import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import ConversationList from '../../components/ConversationList/ConversationList';
import UserSearch from '../../components/UserSearch';
import TypingIndicator from '../../components/TypingIndicator/TypingIndicator';
import MessageInput from '../../components/MessageInput/MessageInput';
import MessageList from '../../components/MessageList/MessageList';
import LastSeen from '../../components/LastSeen/LastSeen';
import styles from './ChatPage.module.css';
import FeedbackModal from "@/components/FeedbackModal/FeedbackModal";

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSeen, setLastSeen] = useState({});
  const [feedback, setFeedback] = useState('');  // For holding message feedback for the content check
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false); // for the UI content check modal
  const messageListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [ClearMessage,setClearMessage] = useState(false);
  const [messageContent, setMessageContent] = useState({}); // State to store message content

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setClearMessage(true);
    setFeedback('');
    setIsButtonClicked(true);
    // if (feedback) {
    //   setClearMessage(true); // Only set ClearMessage to true if feedback exists
    // }
    // setFeedback('');

  };

  const handleEmailTrustedAdult = async () => {
    const emailBody = `
    Hello,
    Your child sent a concerning message in SafeChat, and we wanted to let you know.
    This is the message:
    ${messageContent.content}
  `;

    try {
      await axios.post('http://localhost:3001/send-email', {
        recipientEmail: 'safechat71@gmail.com', // TODO: Replace with the actual recipient email
        subject: 'SafeChat Alert',
        body: emailBody,
      });



      alert('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
    setMessages(prevMessages => [...prevMessages, messageContent]);
    updateConversations(messageContent);
    setIsButtonClicked(true);
    setClearMessage(false); // DON'T Clear the message
    setIsFeedbackModalOpen(false); // Close modal
    setFeedback(''); // Clear feedback
  };

// Create a function to simulate waiting for feedback modal to close
  const waitForFeedbackModalClose = () => {
    return new Promise((resolve) => {
      const checkModal = () => {
        if (isButtonClicked) {
          resolve(true);
        } else {
          requestAnimationFrame(checkModal);
        }// Check if modal is closed
      };
      checkModal();
    });
  };


  //     const interval = setInterval(() => {
  //         if (isButtonClicked) { // Check if modal is closed
  //           console.log('checking feedbackmodal',isButtonClicked);
  //           // if (!isFeedbackModalOpen) { // Check if modal is closed
  //         // console.log('checking feedbackmodal',isFeedbackModalOpen);
  //         clearInterval(interval); // Stop checking
  //         resolve(isButtonClicked); // Resolve the promise
  //       }
  //     }, 100); // Check every 100ms
  //   });
  // };


  // const handleEmailTrustedAdult = () => {
  //   const emailBody = `
  //   Hello,
  //   Your child sent a concerning message in SafeChat, and we wanted to let you know.
  //   This is the message: ${message}
  //   Feedback: ${feedback}
  // `;
  //   //  adjust the recipient email address as needed.
  //   const mailtoLink = `mailto:trustedadult@example.com?subject=Chat Message Feedback&body=${encodeURIComponent(emailBody)}`;
  //   window.location.href = mailtoLink;  // Opens the email client
  //   setIsFeedbackModalOpen(false);  // close modal
  //   setFeedback('');
  //   setClearMessage(false);
  //
  //
  //
  // };



  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      auth: { token: currentUser.token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('chat message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      updateConversations(message);
    });

    // // Listen for feedback from the server - i don't need this anymore because of the ONCE check!
    // newSocket.on('message feedback', (data) => {
    //   if (!data.success) {
    //     setFeedback(data.message); // Set feedback message
    //     setIsFeedbackModalOpen(true); // Open the modal
    //
    //   }
    // });

    newSocket.on('user typing', ({ userId, username }) => {
      if (selectedConversation && userId === selectedConversation.id) {
        setIsTyping(true);
      }
    });

    newSocket.on('user stop typing', ({ userId }) => {
      if (selectedConversation && userId === selectedConversation.id) {
        setIsTyping(false);
      }
    });

    newSocket.on('last seen update', ({ userId, username, lastSeen }) => {
      setLastSeen(prev => ({
        ...prev,
        [userId]: { username, lastSeen }
      }));
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [currentUser.token, selectedConversation]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/conversations', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [currentUser.token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchMessages = useCallback(async () => {
    if (selectedConversation) {
      try {
        const response = await axios.get(`http://localhost:3001/api/messages?userId=${selectedConversation.id}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
  }, [selectedConversation, currentUser.token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);


  const handleSendMessage = async (content, type) => {
    if (content && selectedConversation) {
      try {
        const messageData = {
          id: Date.now(),
          content,
          recipientId: selectedConversation.id,
          senderId: currentUser.id,
          type,
          timestamp: new Date()
        };

        setMessageContent(messageData); // Store the message content here


        socket.emit('chat message', messageData);
        socket.emit('stop typing', selectedConversation.id);

        // splitted:
        // // // Wait for the feedback from the server (message safety check)
        // socket.once('message feedback', (data) => {
        //   if (!data.success) {
        //     setFeedback(data.message); // Set feedback message
        //   }
        // });
        //
        // if (feedback) {
        //   setIsFeedbackModalOpen(true); // Open feedback modal
        //   // Wait for the modal to be closed or some action to be taken
        //   await waitForFeedbackModalClose();  // Wait for the feedback modal to be closed
        //   // After modal close, check ClearMessage
        //   if (!ClearMessage) {
        //     console.log("in the clear if");
        //     setMessages(prevMessages => [...prevMessages, messageData]);
        //     updateConversations(messageData);
        //   } else {
        //     setClearMessage(false);
        //   }
        // } else {
        //   setMessages(prevMessages => [...prevMessages, messageData]);
        //   updateConversations(messageData);
        // }

        const feedbackPromise = new Promise((resolve) => {
            socket.once('message feedback', async (data) => {
              if (!data.success) {
                setFeedback(data.message); // Set feedback message
                setIsFeedbackModalOpen(true); // Open feedback modal

                const userConfirmed = await waitForFeedbackModalClose();
                if (!ClearMessage && userConfirmed) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              } else {
                resolve(true);
              }
              });
      });
        const shouldSend = await feedbackPromise;

        if (shouldSend) {
          setMessages(prevMessages => [...prevMessages, messageData]);
          updateConversations(messageData);
        }
        setFeedback('');
        setIsButtonClicked(false);
        setClearMessage(false);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };


  // socket.once('message feedback', async (data) => {
  //             if (!data.success) {
  //               setFeedback(data.message); // Set feedback message
  //               setIsFeedbackModalOpen(true); // Open feedback modal
  //               // Wait for the modal to be closed or some action to be taken
  //               const userchoice = await waitForFeedbackModalClose();
  //                 // Wait for the feedback modal to be closed
  //                 // After modal close, check ClearMessage = email was clicked?
  //                 console.log("modal closed, clearmessage is:", ClearMessage);
  //                 if (!ClearMessage && userchoice) {
  //                   setMessages(prevMessages => [...prevMessages, messageData]);
  //                   updateConversations(messageData);
  //                 } else {
  //                   // if clear message is true
  //                   setClearMessage(false);
  //                 }
  //             } else {
  //               setMessages(prevMessages => [...prevMessages, messageData]);
  //               updateConversations(messageData);
  //             }
  //           });
        //
        // // Wait for the feedback from the server (message safety check)
        // socket.once('message feedback', (data) => {
        //   if (!data.success) {
        //       setFeedback(data.message); // Set feedback message
        //       setIsFeedbackModalOpen(true); // Open feedback modal
        //   }
        //   console.log(ClearMessage,"clearmessage");
        //
        //   if (!ClearMessage) {
        //       console.log("in the clear if");
        //       setMessages(prevMessages => [...prevMessages, messageData]);
        //       updateConversations(messageData);
        //   } else {
        //     setClearMessage(false);
        //   }

          // if (data.success) {
          //   // If the message is safe or the user clicked "Send Email," add it locally
          //   // setMessages(prevMessages => [...prevMessages, messageData]);
          //   // updateConversations(messageData);
          //   // // Reset the email action state
          //   // setIsEmailClicked(false);
          // } else {
          //   // If the message is unsafe, display feedback and do not add it
          //   // TODO: if we want the person to be able to change their response, this should change.
          //   setFeedback(data.message); // Set feedback message
          //   setIsFeedbackModalOpen(true); // Open feedback modal
          // }
          // if (isEmailClicked) {
          //   setMessages(prevMessages => [...prevMessages, messageData]);
          //   updateConversations(messageData);
          //   setIsEmailClicked(false);
          //
          // }
        // });
  //
  //         // Clear the feedback after sending the message
  //       setFeedback('');
  //       // restart the modal clicked flag
  //       setIsButtonClicked(false);
  //     } catch (error) {
  //       console.error('Error sending message:', error);
  //     }
  //   }
  // };

  // Effect to handle when feedback modal is open
  // useEffect(() => {
  //   if (isFeedbackModalOpen) {
  //     // After modal is open, check ClearMessage
  //     if (!ClearMessage) {
  //       console.log("in the clear if");
  //       setMessages(prevMessages => [...prevMessages, messageData]);
  //       updateConversations(messageData);
  //     } else {
  //       setClearMessage(false);
  //     }
  //   }
  // }, [isFeedbackModalOpen]);


  const handleTyping = () => {
    if (selectedConversation && socket) {
      socket.emit('typing', selectedConversation.id);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop typing', selectedConversation.id);
      }, 1000);
    }
  };

  const updateConversations = (message) => {
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.map(conv => {
        if (conv.id === message.senderId || conv.id === message.recipientId) {
          return { ...conv, lastMessage: message.content };
        }
        return conv;
      });
      return updatedConversations.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
    });
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    setIsTyping(false);
  };

  const handleUserSelect = (user) => {
    const existingConversation = conversations.find(conv => conv.id === user.id);
    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      const newConversation = {
        id: user.id,
        username: user.username,
        lastMessage: '',
        lastMessageTimestamp: Date.now()
      };
      setConversations(prevConversations => [newConversation, ...prevConversations]);
      setSelectedConversation(newConversation);
    }
    setMessages([]);
    setIsTyping(false);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidebar}>
        <UserSearch onSelectUser={handleUserSelect} />
        <ConversationList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedConversation={selectedConversation}
        />
        <LastSeen lastSeen={lastSeen} />
      </div>
      <div className={styles.chatArea}>
        {selectedConversation ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.avatar}>{selectedConversation.username[0].toUpperCase()}</div>
              <div className={styles.userInfo}>
                <h2 className={styles.username}>{selectedConversation.username}</h2>
                <span className={styles.userStatus}>Online</span>
              </div>
            </div>
            <MessageList 
              messages={messages} 
              currentUser={currentUser} 
              ref={messageListRef}
            />
            {isTyping && <TypingIndicator username={selectedConversation.username} />}
            <MessageInput 
              onSendMessage={handleSendMessage} 
              onTyping={handleTyping}
              currentUser={currentUser}
            />
            {/*{feedback && <div className={styles.feedback}>{feedback}</div>} /!* Display feedback *!/*/}
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                feedback={feedback}
                onClose={closeFeedbackModal}
                // onEmailTrustedAdult={handleEmailTrustedAdult}
                onEmailTrustedAdult={() => handleEmailTrustedAdult()}  // Pass messageContent to the email handler

            />

          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>💬</div>
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

