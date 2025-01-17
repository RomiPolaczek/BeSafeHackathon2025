import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../assets/styles/theme';
import UserIcon from '../assets/icons/UserIcon';

const ProfileContainer = styled.div`
  padding: 20px;
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.medium};
`;

const AvatarContainer = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

const Username = styled.h2`
  margin-bottom: 10px;
`;

const StatusMessage = styled.p`
  font-style: italic;
  color: ${theme.colors.lightText};
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 5px 10px;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.primary}dd;
  }
`;

const UserProfile = ({ user, onUpdateProfile }) => {
  const [editing, setEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(user.statusMessage);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({ statusMessage });
    setEditing(false);
  };

  return (
    <ProfileContainer>
      {editing ? (
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            placeholder="Status message"
          />
          <Button type="submit">Save</Button>
        </form>
      ) : (
        <>
          <AvatarContainer>
            <UserIcon width="60" height="60" color={theme.colors.white} />
          </AvatarContainer>
          <Username>{user.username}</Username>
          <StatusMessage>{user.statusMessage}</StatusMessage>
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        </>
      )}
    </ProfileContainer>
  );
};

export default UserProfile;

