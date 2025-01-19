import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const MainContainer = styled.div`
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #2613a4;
`;

const LogoutButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
`;

const NavLink = styled(Link)`
  display: block;
  margin-bottom: 10px;
  color: #2613a4;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const MainPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <MainContainer>
      <Header>
        <Title>Welcome to SafeChat!</Title>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Header>
      <NavLink to="/chat">Go to Chat</NavLink>
    </MainContainer>
  );
};

export default MainPage;

