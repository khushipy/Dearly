import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Favorite } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative hearts */}
          <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
            <Favorite sx={{ color: 'primary.main', fontSize: 20 }} />
          </Box>
          <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
            <Favorite sx={{ color: 'secondary.main', fontSize: 20 }} />
          </Box>
          <Box sx={{ position: 'absolute', bottom: 10, left: 10 }}>
            <Favorite sx={{ color: 'secondary.main', fontSize: 20 }} />
          </Box>
          <Box sx={{ position: 'absolute', bottom: 10, right: 10 }}>
            <Favorite sx={{ color: 'primary.main', fontSize: 20 }} />
          </Box>

          <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 3 }}>
            💕 LoveBomb 💕
          </Typography>
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4, color: 'text.secondary' }}>
            Welcome Back, Sweetie! 💖
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #e91e63 30%, #ff69b4 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #c2185b 30%, #e91e63 90%)',
                }
              }}
            >
              {loading ? 'Logging in... 💕' : 'Login 💕'}
            </Button>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>
                  <Typography
                    component="span"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'bold',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Sign up here! 💝
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 