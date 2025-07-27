import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  AppBar,
  Toolbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider
} from '@mui/material';
import {
  Favorite,
  PersonAdd,
  Chat,
  Logout,
  DarkMode,
  LightMode,
  Person,
  Email
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = ({ mode, setMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openAddFriend, setOpenAddFriend] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFriends();
    fetchFriendRequests();
  }, [user, navigate]);

  const fetchFriends = async () => {
    try {
      const response = await axios.get('/friend/list');
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      // This would need to be implemented in your backend
      // For now, we'll use a placeholder
      setFriendRequests([]);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!newFriendEmail.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/friend/request', { friendEmail: newFriendEmail });
      setSuccess('Friend request sent! 💕');
      setNewFriendEmail('');
      setOpenAddFriend(false);
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    try {
      await axios.post('/friend/accept', { requesterId });
      setSuccess('Friend request accepted! 💕');
      fetchFriends();
      fetchFriendRequests();
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to accept friend request');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChat = (friendId) => {
    navigate(`/chat/${friendId}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #e91e63 30%, #ff69b4 90%)' }}>
        <Toolbar>
          <Favorite sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            💕 LoveBomb Dashboard 💕
          </Typography>
          
          <IconButton 
            color="inherit" 
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            sx={{ mr: 2 }}
          >
            {mode === 'light' ? <DarkMode /> : <LightMode />}
          </IconButton>
          
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
            Welcome back, {user?.name}! 💖
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to spread some love? 💕
          </Typography>
        </Paper>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Add Friend Button */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PersonAdd />}
            onClick={() => setOpenAddFriend(true)}
            sx={{
              background: 'linear-gradient(45deg, #e91e63 30%, #ff69b4 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #c2185b 30%, #e91e63 90%)',
              }
            }}
          >
            Add a Friend 💕
          </Button>
        </Box>

        {/* Friends List */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Your Friends 💕
          </Typography>
          
          {friends.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No friends yet. Add some friends to start chatting! 💝
            </Typography>
          ) : (
            <List>
              {friends.map((friend, index) => (
                <React.Fragment key={friend._id || index}>
                  <ListItem
                    secondaryAction={
                      <Button
                        variant="outlined"
                        startIcon={<Chat />}
                        onClick={() => handleChat(friend._id)}
                        sx={{ borderRadius: 20 }}
                      >
                        Chat 💕
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={friend.name}
                      secondary={friend.email}
                    />
                  </ListItem>
                  {index < friends.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Friend Requests 💌
            </Typography>
            <List>
              {friendRequests.map((request, index) => (
                <ListItem
                  key={request._id || index}
                  secondaryAction={
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAcceptRequest(request._id)}
                      sx={{ borderRadius: 20 }}
                    >
                      Accept 💕
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <Email />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={request.name}
                    secondary={request.email}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Container>

      {/* Add Friend Dialog */}
      <Dialog open={openAddFriend} onClose={() => setOpenAddFriend(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: 'primary.main' }}>
          💕 Add a New Friend 💕
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Friend's Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newFriendEmail}
            onChange={(e) => setNewFriendEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAddFriend(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddFriend}
            disabled={loading || !newFriendEmail.trim()}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #e91e63 30%, #ff69b4 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #c2185b 30%, #e91e63 90%)',
              }
            }}
          >
            {loading ? 'Sending...' : 'Send Request 💕'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 