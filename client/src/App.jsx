import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home/HomePage';
import Login from './pages/Login/LoginPage';
import SignUp from './pages/SignUp/SignUpPage';
import MainPage from './pages/MainPage/MainPage';
import ChatPage from './pages/Chat/ChatPage';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import styled from 'styled-components';
import { createGlobalStyle } from 'styled-components';


const AppContainer = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
    "Droid Sans", "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
`;

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden; /* Prevents unwanted horizontal scrolling */
  }
`;

const Header = styled.header`
 
  background-color: #4C6085;
  padding: 10px 5px 10px 5px;

  width: 100%;

  position: fixed;
  margin: 0;
  color: white;
  align-items: center;
  justify-content: space-between;
  top: 0;
`;

const Nav = styled.nav`
  justify-content: space-between;
  display: flex;
  justify-content: flex-end;
  align-items: center;
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
 background-color: #4C6085;
  color: white;
  text-align: center;
  position: fixed;
  height: 25px;
  bottom: 0;
  width: 100%;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function App() {
  return (
    <>
    <GlobalStyle></GlobalStyle>
    <ErrorBoundary>
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
              <p>&copy; 2025 SafeChat</p>
            </Footer>
          </AppContainer>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
    </>
  );
}

export default App;

