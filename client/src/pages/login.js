// client/src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { currentUser, error, login, loading } = useAuth();
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const { email, password } = formData;

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setLoginError(err.message || "Failed to log in");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Welcome Back
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
          Sign in to continue to your account
        </Typography>

        {(error || loginError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || loginError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/register" variant="body2">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
