import React from 'react';
import styled from 'styled-components';
import { theme } from '../../assets/styles/theme';

const LastSeenContainer = styled.div`
  margin-top: ${theme.spacing.medium};
  font-size: ${theme.fontSizes.small};
  color: ${theme.colors.lightText};
`;

const LastSeenItem = styled.p`
  margin: ${theme.spacing.small} 0;
`;

function LastSeen({ lastSeen }) {
  return (
    <LastSeenContainer>
      {Object.entries(lastSeen).map(([userId, { username, lastSeen }]) => (
        <LastSeenItem key={userId}>
          {username} last seen: {formatLastSeen(lastSeen)}
        </LastSeenItem>
      ))}
    </LastSeenContainer>
  );
}

function formatLastSeen(lastSeenTime) {
  const now = new Date();
  const lastSeen = new Date(lastSeenTime);
  const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return lastSeen.toLocaleString();
  }
}

export default LastSeen;

