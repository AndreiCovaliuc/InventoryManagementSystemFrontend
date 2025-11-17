import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Fade,
  Slide,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import ChatService from '../../services/ChatService';
import { keyframes } from '@mui/system';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const NewChatDialog = ({ open, onClose, onStartChat }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSearchTerm('');
      setSelectedUser(null);
    }
  }, [open]);

  useEffect(() => {
    if (users.length > 0) {
      applySearchFilter();
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await ChatService.getAvailableUsers();
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySearchFilter = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user.id);
    setTimeout(() => {
      onStartChat(user.id);
    }, 300);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      TransitionComponent={Transition}
      transitionDuration={400}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.2)',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
            }}
          >
            <PersonAddIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: '#2c3e50',
              }}
            >
              New Conversation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a team member to start chatting
            </Typography>
          </Box>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          autoFocus
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#f0f2f5',
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(52, 152, 219, 0.3)',
              },
              '&.Mui-focused': {
                backgroundColor: '#ffffff',
                boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.15)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3498db',
                borderWidth: '2px',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#3498db' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={handleClearSearch}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#e74c3c',
                      backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ 
        p: 0,
        minHeight: 300,
        maxHeight: 400,
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            py: 6 
          }}>
            <CircularProgress 
              size={44} 
              thickness={4}
              sx={{ color: '#3498db', mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Loading team members...
            </Typography>
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Fade in={true} timeout={500}>
            <Box sx={{ 
              py: 6, 
              px: 3, 
              textAlign: 'center' 
            }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <SearchIcon sx={{ fontSize: 36, color: '#95a5a6' }} />
              </Box>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                {searchTerm ? 'No results found' : 'No team members available'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm 
                  ? 'Try searching with different keywords'
                  : 'Check back later for available users'
                }
              </Typography>
            </Box>
          </Fade>
        ) : (
          <List sx={{ width: '100%', pt: 0 }}>
            {filteredUsers.map((user, index) => (
              <Fade in={true} timeout={200 + index * 50} key={user.id}>
                <Box>
                  <ListItem 
                    button 
                    onClick={() => handleUserClick(user)}
                    selected={selectedUser === user.id}
                    sx={{
                      py: 2,
                      px: 3,
                      transition: 'all 0.2s ease',
                      backgroundColor: selectedUser === user.id
                        ? 'rgba(52, 152, 219, 0.15)'
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: selectedUser === user.id
                          ? 'rgba(52, 152, 219, 0.2)'
                          : 'rgba(52, 152, 219, 0.05)',
                        transform: 'translateX(8px)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(52, 152, 219, 0.15)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          width: 52,
                          height: 52,
                          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
                          transition: 'transform 0.2s ease',
                          ...(selectedUser === user.id && {
                            transform: 'scale(1.1)',
                          }),
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      sx={{ ml: 1 }}
                      primary={
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: '#2c3e50',
                            fontSize: '1rem',
                          }}
                        >
                          {user.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 0.5 
                        }}>
                          <EmailIcon 
                            sx={{ 
                              fontSize: 14, 
                              color: '#95a5a6', 
                              mr: 0.5 
                            }} 
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.85rem',
                            }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      }
                    />
                    {selectedUser === user.id && (
                      <Chip
                        label="Starting..."
                        size="small"
                        sx={{
                          background: 'linear-gradient(90deg, #3498db 25%, #5dade2 50%, #3498db 75%)',
                          backgroundSize: '200% 100%',
                          animation: `${shimmer} 1.5s infinite`,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </ListItem>
                  <Divider component="li" sx={{ opacity: 0.5 }} />
                </Box>
              </Fade>
            ))}
          </List>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2.5,
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
      }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '10px',
            px: 3,
            py: 1,
            borderColor: '#bdc3c7',
            color: '#7f8c8d',
            '&:hover': {
              borderColor: '#95a5a6',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewChatDialog;