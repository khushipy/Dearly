// client/src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

export default function Dashboard() {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState({
    connections: false,
    notes: false,
    sending: false,
    inviting: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { connectionId } = useParams();

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Load connections
  useEffect(() => {
    const loadConnections = async () => {
      try {
        setLoading(prev => ({ ...prev, connections: true }));
        const { data } = await axios.get("/api/connections");
        setConnections(data);
        
        // If there's a connectionId in URL, select that connection
        if (connectionId) {
          const connection = data.find(c => c.userId._id === connectionId);
          if (connection) {
            setSelectedConnection(connection);
          }
        } else if (data.length > 0) {
          // Otherwise select the first connection by default
          setSelectedConnection(data[0]);
        }
      } catch (err) {
        console.error("Failed to load connections:", err);
        showSnackbar("Failed to load connections", "error");
      } finally {
        setLoading(prev => ({ ...prev, connections: false }));
      }
    };
    
    if (currentUser) {
      loadConnections();
    }
  }, [currentUser, connectionId]);

  // Load notes for selected connection
  useEffect(() => {
    const loadNotes = async () => {
      if (!selectedConnection) return;
      
      try {
        setLoading(prev => ({ ...prev, notes: true }));
        const { data } = await axios.get(`/api/notes/${selectedConnection.userId._id}`);
        setNotes(data);
      } catch (err) {
        console.error("Failed to load notes:", err);
        showSnackbar("Failed to load notes", "error");
      } finally {
        setLoading(prev => ({ ...prev, notes: false }));
      }
    };
    
    loadNotes();
  }, [selectedConnection]);

  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedConnection) return;

    try {
      setLoading(prev => ({ ...prev, sending: true }));
      
      // In a real app, encrypt the content here
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      await axios.post(`/api/notes/${selectedConnection.userId._id}`, {
        content,
        iv: Array.from(iv).join(","),
      });

      setContent("");
      showSnackbar("Note sent successfully");
      
      // Refresh notes
      const { data } = await axios.get(`/api/notes/${selectedConnection.userId._id}`);
      setNotes(data);
    } catch (err) {
      console.error("Failed to send note:", err);
      showSnackbar(err.response?.data?.msg || "Failed to send note", "error");
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(prev => ({ ...prev, inviting: true }));
      await axios.post("/api/connections/invite", { email });
      setEmail("");
      showSnackbar("Invitation sent successfully!");
    } catch (err) {
      console.error("Failed to send invite:", err);
      showSnackbar(err.response?.data?.msg || "Failed to send invitation", "error");
    } finally {
      setLoading(prev => ({ ...prev, inviting: false }));
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out:", err);
      showSnackbar("Failed to log out", "error");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ display: "flex", height: "100vh", p: 0, bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Paper 
        elevation={0} 
        sx={{
          width: 320,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h1">Connections</Typography>
            <Tooltip title="Logout">
              <Button onClick={handleLogout} size="small" color="inherit">
                Logout
              </Button>
            </Tooltip>
          </Box>
          
          <Box component="form" onSubmit={handleSendInvite} sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter email to invite"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              disabled={loading.inviting}
              InputProps={{
                startAdornment: <PersonAddIcon color="action" sx={{ mr: 1 }} />
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading.inviting || !email}
              sx={{ minWidth: '100px' }}
            >
              {loading.inviting ? <CircularProgress size={24} /> : 'Invite'}
            </Button>
          </Box>
        </Box>

        {loading.connections ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : connections.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <EmailIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No connections yet. Invite someone to get started!
            </Typography>
          </Box>
        ) : (
          <List sx={{ overflowY: 'auto', flex: 1 }}>
            {connections.map((connection) => (
              <React.Fragment key={connection._id}>
                <ListItem
                  button
                  selected={
                    selectedConnection &&
                    selectedConnection._id === connection._id
                  }
                  onClick={() => setSelectedConnection(connection)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>{connection.userId.email[0].toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={connection.userId.email}
                    secondary={
                      connection.status === "pending" ? (
                        <Typography component="span" variant="caption" color="text.secondary">
                          Pending acceptance
                        </Typography>
                      ) : null
                    }
                    primaryTypographyProps={{
                      fontWeight: selectedConnection?._id === connection._id ? 'medium' : 'regular'
                    }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: 'background.paper' }}>
        {selectedConnection ? (
          <>
            <Paper 
              elevation={0} 
              square 
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: "flex",
                alignItems: "center",
                bgcolor: 'background.default'
              }}
            >
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {selectedConnection.userId.email[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" component="div">
                  {selectedConnection.userId.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedConnection.status === 'connected' 
                    ? 'Online' 
                    : 'Offline'}
                </Typography>
              </Box>
            </Paper>

            <Box sx={{ 
              flex: 1, 
              overflowY: "auto", 
              p: 2,
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
              backgroundAttachment: 'local',
              backgroundSize: 'cover'
            }}>
              {loading.notes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : notes.length === 0 ? (
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  color: 'text.secondary'
                }}>
                  <NoteAddIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    No messages yet
                  </Typography>
                  <Typography variant="body2">
                    Send a message to start your conversation with {selectedConnection.userId.email.split('@')[0]}
                  </Typography>
                </Box>
              ) : (
                notes.map((note) => (
                  <Paper
                    key={note._id}
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      maxWidth: '75%',
                      ml: note.sender === currentUser?._id ? 'auto' : 0,
                      backgroundColor: note.sender === currentUser?._id 
                        ? 'primary.main' 
                        : 'background.paper',
                      color: note.sender === currentUser?._id 
                        ? 'primary.contrastText' 
                        : 'text.primary',
                      borderRadius: 2,
                      borderTopLeftRadius: note.sender === currentUser?._id ? 12 : 4,
                      borderTopRightRadius: note.sender === currentUser?._id ? 4 : 12,
                    }}
                  >
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {note.content}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{
                        display: 'block',
                        textAlign: 'right',
                        mt: 0.5,
                        opacity: 0.8,
                        color: note.sender === currentUser?._id 
                          ? 'primary.contrastText' 
                          : 'text.secondary',
                      }}
                    >
                      {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Paper>
                ))
              )}
            </Box>

            <Paper 
              elevation={0} 
              square 
              sx={{ 
                p: 2, 
                borderTop: 1, 
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}
            >
              <form onSubmit={handleSendNote}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    maxRows={4}
                    disabled={loading.sending || !selectedConnection}
                    InputProps={{
                      sx: { 
                        bgcolor: 'background.paper',
                        '&.Mui-focused': {
                          bgcolor: 'background.paper',
                        },
                        '&:hover': {
                          bgcolor: 'background.paper',
                        },
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!content.trim() || loading.sending || !selectedConnection}
                    sx={{ minWidth: '100px' }}
                  >
                    {loading.sending ? <CircularProgress size={24} /> : 'Send'}
                  </Button>
                </Box>
              </form>
            </Paper>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: 'column',
              justifyContent: "center",
              alignItems: "center",
              color: "text.secondary",
              p: 3,
              textAlign: 'center'
            }}
          >
            <EmailIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" gutterBottom>
              Welcome to Secure Notes
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, maxWidth: 400 }}>
              {connections.length > 0 
                ? "Select a connection to start sharing notes"
                : "Invite someone to start your first secure conversation"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
