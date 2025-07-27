import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider,
  Fab,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  Send,
  Favorite,
  Note,
  Chat as ChatIcon,
  Lock,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Chat = ({ mode, setMode }) => {
  const { friendId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sharedPassword, setSharedPassword] = useState('');
  const [notepadId, setNotepadId] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  const [messageType, setMessageType] = useState('chat'); // 'chat' or 'note'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [friendInfo, setFriendInfo] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFriendInfo();
  }, [user, friendId, navigate]);

  const fetchFriendInfo = async () => {
    try {
      // This would need to be implemented in your backend
      // For now, we'll use a placeholder
      setFriendInfo({ name: 'Friend', email: 'friend@email.com' });
    } catch (error) {
      console.error('Error fetching friend info:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!sharedPassword.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/notepad/create-or-join', {
        userId1: user.id,
        userId2: friendId,
        sharedPassword: sharedPassword
      });
      
      setNotepadId(response.data.notepad._id);
      setShowPasswordDialog(false);
      fetchMessages(response.data.notepad._id);
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to access notepad');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const response = await axios.get(`/notepad/${id}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !notepadId) return;
    
    try {
      const response = await axios.post('/notepad/send', {
        notepadId: notepadId,
        sender: user.id,
        type: messageType,
        content: newMessage
      });
      
      setMessages(response.data.notepad.messages);
      setNewMessage('');
    } catch (error) {
      setError('Failed to send message');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message) => {
    return message.sender === user.id || message.sender._id === user.id;
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #e91e63 30%, #ff69b4 90%)' }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              💕 Chat with {friendInfo?.name || 'Friend'} 💕
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {friendInfo?.email}
            </Typography>
          </Box>
          
          <IconButton 
            color="inherit" 
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            sx={{ mr: 1 }}
          >
            {mode === 'light' ? <DarkMode /> : <LightMode />}
          </IconButton>
          
          <Chip 
            icon={<Lock />} 
            label="Protected" 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} 
          />
        </Toolbar>
      </AppBar>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: 'primary.main' }}>
          🔐 Enter Shared Password 🔐
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the password you and your friend agreed on to access your private chat 💕
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Shared Password"
            value={sharedPassword}
            onChange={(e) => setSharedPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            disabled={loading || !sharedPassword.trim()}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #e91e63 30%, #ff69b4 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #c2185b 30%, #e91e63 90%)',
              }
            }}
          >
            {loading ? 'Unlocking...' : 'Unlock Chat 💕'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Area */}
      {!showPasswordDialog && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  💕 Start your conversation! 💕
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Send a message or a sticky note to begin 💝
                </Typography>
              </Box>
            ) : (
              <List>
                {messages.map((message, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      flexDirection: 'column',
                      alignItems: isOwnMessage(message) ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        flexDirection: isOwnMessage(message) ? 'row-reverse' : 'row'
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: isOwnMessage(message) ? 'primary.main' : 'secondary.main',
                          mr: isOwnMessage(message) ? 0 : 1,
                          ml: isOwnMessage(message) ? 1 : 0
                        }}
                      >
                        {isOwnMessage(message) ? user.name[0] : friendInfo?.name[0]}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {message.sender?.name || (isOwnMessage(message) ? user.name : friendInfo?.name)}
                      </Typography>
                    </Box>
                    
                    <Card
                      sx={{
                        maxWidth: '70%',
                        bgcolor: isOwnMessage(message) ? 'primary.main' : 'background.paper',
                        color: isOwnMessage(message) ? 'white' : 'text.primary',
                        borderRadius: 3,
                        position: 'relative'
                      }}
                    >
                      <CardContent sx={{ p: 2, pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {message.type === 'note' ? (
                            <Note sx={{ fontSize: 16, mr: 0.5 }} />
                          ) : (
                            <ChatIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          )}
                          <Chip
                            label={message.type === 'note' ? 'Note' : 'Chat'}
                            size="small"
                            sx={{ 
                              fontSize: '0.7rem',
                              bgcolor: 'rgba(255,255,255,0.2)',
                              color: 'inherit'
                            }}
                          />
                        </Box>
                        <Typography variant="body2">
                          {message.content}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                          {formatTime(message.createdAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </ListItem>
                ))}
                <div ref={messagesEndRef} />
              </List>
            )}
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Button
                variant={messageType === 'chat' ? 'contained' : 'outlined'}
                size="small"
                startIcon={<ChatIcon />}
                onClick={() => setMessageType('chat')}
                sx={{ mr: 1, borderRadius: 20 }}
              >
                Chat
              </Button>
              <Button
                variant={messageType === 'note' ? 'contained' : 'outlined'}
                size="small"
                startIcon={<Note />}
                onClick={() => setMessageType('note')}
                sx={{ borderRadius: 20 }}
              >
                Note
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={messageType === 'chat' ? "Type your message..." : "Write a sticky note..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                sx={{ mr: 1 }}
              />
              <Fab
                color="primary"
                size="medium"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                sx={{
                  background: 'linear-gradient(45deg, #e91e63 30%, #ff69b4 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #c2185b 30%, #e91e63 90%)',
                  }
                }}
              >
                <Send />
              </Fab>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Chat; 