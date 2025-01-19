import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home/HomePage';
import Login from './pages/Login/LoginPage';
import SignUp from './pages/SignUp/SignUpPage';
import MainPage from './pages/MainPage/MainPage';
import ChatPage from './pages/Chat/ChatPage';
import PrivateRoute from './components/PrivateRoute';
import styled from 'styled-components';

const AppContainer = styled.div`
  font-family: Arial, sans-serif;
`;

const Header = styled.header`
  background-color: #2613a4;
  padding: 10px 20px;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  margin-right: 15px;

  &:hover {
    text-decoration: underline;
  }
`;

const Main = styled.main`
  padding: 20px;
`;

const Footer = styled.footer`
  background-color: #FF69B4; // Changed to pink
  color: white;
  text-align: center;
  padding: 5px 0;
  position: fixed;
  bottom: 0;
  width: 100%;
  font-size: 12px; // Reduced font size
`;

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Header>
            <Nav>
              <div>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/signup">Sign Up</NavLink>
              </div>
            </Nav>
          </Header>
          <Main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/main" element={<PrivateRoute><MainPage /></PrivateRoute>} />
              <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            </Routes>
          </Main>
          <Footer>
            <p>&copy; 2023 SafeChat</p>
          </Footer>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App;

