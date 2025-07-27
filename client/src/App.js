import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import { AuthProvider } from './context/AuthContext';

// Create lovey-dovey theme
const createLoveTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#ff69b4' : '#e91e63', // Pink
    },
    secondary: {
      main: mode === 'dark' ? '#ff1493' : '#f06292', // Deep pink
    },
    background: {
      default: mode === 'dark' ? '#1a1a2e' : '#fff5f5',
      paper: mode === 'dark' ? '#16213e' : '#ffeef8',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#2c1810',
    },
  },
  typography: {
    fontFamily: '"Comic Sans MS", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      color: mode === 'dark' ? '#ff69b4' : '#e91e63',
    },
    h2: {
      color: mode === 'dark' ? '#ff69b4' : '#e91e63',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: mode === 'dark' 
            ? '0 8px 32px rgba(255, 105, 180, 0.3)'
            : '0 8px 32px rgba(233, 30, 99, 0.2)',
        },
      },
    },
  },
});

function App() {
  const [mode, setMode] = useState('light');
  const theme = createLoveTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: '100vh', background: theme.palette.background.default }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard mode={mode} setMode={setMode} />} />
              <Route path="/chat/:friendId" element={<Chat mode={mode} setMode={setMode} />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
