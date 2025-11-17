import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Divider, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Badge, 
  Grid, 
  CircularProgress,
  Button,
  Fade,
  Grow,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Message as MessageIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  ChatBubbleOutline as ChatBubbleIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ChatService from '../../services/ChatService';
import NewChatDialog from './NewChatDialog';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
`;

const ChatList = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(() => {
      fetchChats(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      applySearchFilter();
    }
  }, [searchTerm, chats]);

  const fetchChats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await ChatService.getAllChats();
      setChats(response.data || []);
      setFilteredChats(response.data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySearchFilter = () => {
    if (!searchTerm.trim()) {
      setFilteredChats(chats);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = chats.filter(chat => 
      chat.otherParticipant.name.toLowerCase().includes(term) ||
      (chat.lastMessage && chat.lastMessage.content.toLowerCase().includes(term))
    );
    setFilteredChats(filtered);
  };

  const handleChatItemClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const handleOpenNewChatDialog = () => {
    setNewChatDialogOpen(true);
  };

  const handleCloseNewChatDialog = () => {
    setNewChatDialogOpen(false);
  };

  const handleStartNewChat = async (userId) => {
    try {
      const response = await ChatService.createChat(userId);
      handleCloseNewChatDialog();
      navigate(`/chat/${response.data.id}`);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now - messageTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageTime.toLocaleDateString();
  };

  const getUnreadCount = () => {
    return chats.filter(chat => chat.hasUnread).length;
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      backgroundColor: '#f0f2f5', 
      minHeight: '100vh' 
    }}>
      {/* Header Section */}
      <Fade in={true} timeout={600}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 50%, #00d2ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Poppins', sans-serif",
                mb: 0.5,
              }}
            >
              Messages
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {getUnreadCount() > 0 
                ? `${getUnreadCount()} unread conversation${getUnreadCount() > 1 ? 's' : ''}`
                : 'All caught up!'
              }
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenNewChatDialog}
            sx={{
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #2980b9 0%, #1f5f89 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(52, 152, 219, 0.4)',
              },
            }}
          >
            New Chat
          </Button>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {/* Chat List Panel */}
        <Grid item xs={12} md={4}>
          <Grow in={true} timeout={800}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: '16px',
                overflow: 'hidden',
                height: 'calc(100vh - 200px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Search Bar */}
              <Box 
                sx={{ 
                  p: 2,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                          onClick={() => setSearchTerm('')}
                          sx={{ '&:hover': { color: '#e74c3c' } }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Box>
              
              {/* Chat List */}
              <Box 
                sx={{ 
                  overflowY: 'auto',
                  flexGrow: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(52, 152, 219, 0.3)',
                    borderRadius: '10px',
                  },
                }}
              >
                {loading && chats.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    p: 3,
                  }}>
                    <CircularProgress 
                      size={40} 
                      thickness={4}
                      sx={{ color: '#3498db', mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Loading chats...
                    </Typography>
                  </Box>
                ) : filteredChats.length === 0 ? (
                  <Fade in={true} timeout={500}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      p: 4,
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
                          mb: 3,
                        }}
                      >
                        <ChatBubbleIcon sx={{ fontSize: 36, color: '#95a5a6' }} />
                      </Box>
                      <Typography 
                        variant="h6" 
                        color="text.secondary" 
                        align="center"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        {searchTerm ? 'No results found' : 'No conversations yet'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        align="center"
                        sx={{ mb: 3 }}
                      >
                        {searchTerm 
                          ? 'Try a different search term'
                          : 'Start chatting with your team'
                        }
                      </Typography>
                      {!searchTerm && (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={handleOpenNewChatDialog}
                          sx={{ 
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: '#3498db',
                            color: '#3498db',
                            '&:hover': {
                              borderColor: '#2980b9',
                              backgroundColor: 'rgba(52, 152, 219, 0.05)',
                            }
                          }}
                        >
                          Start a conversation
                        </Button>
                      )}
                    </Box>
                  </Fade>
                ) : (
                  <List sx={{ width: '100%', p: 1 }}>
                    {filteredChats.map((chat, index) => (
                      <Fade 
                        in={true} 
                        timeout={300 + index * 100} 
                        key={chat.id}
                      >
                        <Box>
                          <ListItem 
                            button
                            onClick={() => handleChatItemClick(chat.id)}
                            sx={{
                              borderRadius: '12px',
                              mb: 0.5,
                              px: 2,
                              py: 1.5,
                              transition: 'all 0.2s ease',
                              backgroundColor: chat.hasUnread 
                                ? 'rgba(52, 152, 219, 0.08)' 
                                : 'transparent',
                              border: chat.hasUnread 
                                ? '1px solid rgba(52, 152, 219, 0.2)'
                                : '1px solid transparent',
                              '&:hover': {
                                backgroundColor: chat.hasUnread
                                  ? 'rgba(52, 152, 219, 0.12)'
                                  : 'rgba(0, 0, 0, 0.04)',
                                transform: 'translateX(4px)',
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                variant="dot"
                                sx={{
                                  '& .MuiBadge-badge': {
                                    backgroundColor: chat.otherParticipant.online 
                                      ? '#44b700' 
                                      : 'transparent',
                                    boxShadow: chat.otherParticipant.online
                                      ? '0 0 0 2px white'
                                      : 'none',
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    animation: chat.otherParticipant.online 
                                      ? `${pulse} 2s infinite`
                                      : 'none',
                                  },
                                }}
                              >
                                <Avatar 
                                  sx={{ 
                                    width: 52,
                                    height: 52,
                                    background: chat.hasUnread 
                                      ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                                      : 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)',
                                    fontSize: '1.2rem',
                                    fontWeight: 600,
                                    boxShadow: chat.hasUnread
                                      ? '0 4px 12px rgba(52, 152, 219, 0.3)'
                                      : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                  }}
                                >
                                  {chat.otherParticipant.name.charAt(0).toUpperCase()}
                                </Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText
                              sx={{ ml: 1 }}
                              primary={
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center' 
                                }}>
                                  <Typography 
                                    variant="body1" 
                                    sx={{
                                      fontWeight: chat.hasUnread ? 700 : 500,
                                      color: '#2c3e50',
                                      fontSize: '0.95rem',
                                    }}
                                  >
                                    {chat.otherParticipant.name}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{
                                      color: chat.hasUnread ? '#3498db' : 'text.secondary',
                                      fontWeight: chat.hasUnread ? 600 : 400,
                                      fontSize: '0.7rem',
                                    }}
                                  >
                                    {formatRelativeTime(chat.lastMessage?.timestamp)}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  mt: 0.5,
                                }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{
                                      color: chat.hasUnread ? '#2c3e50' : 'text.secondary',
                                      fontWeight: chat.hasUnread ? 500 : 400,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      maxWidth: chat.hasUnread ? 'calc(100% - 24px)' : '100%',
                                      fontSize: '0.85rem',
                                    }}
                                  >
                                    {chat.lastMessage?.content || 'No messages yet'}
                                  </Typography>
                                  {chat.hasUnread && (
                                    <Box 
                                      sx={{ 
                                        width: 10, 
                                        height: 10, 
                                        borderRadius: '50%', 
                                        background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                                        boxShadow: '0 2px 8px rgba(52, 152, 219, 0.4)',
                                        flexShrink: 0,
                                        ml: 1,
                                      }} 
                                    />
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        </Box>
                      </Fade>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Grow>
        </Grid>
        
        {/* Welcome Panel */}
        <Grid item xs={12} md={8}>
          <Grow in={true} timeout={1000}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 200px)',
                background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.03) 0%, rgba(41, 128, 185, 0.08) 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -80,
                  left: -80,
                  width: 250,
                  height: 250,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0, 210, 255, 0.08) 0%, transparent 70%)',
                },
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4,
                  boxShadow: '0 12px 40px rgba(52, 152, 219, 0.3)',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <MessageIcon sx={{ fontSize: 56, color: 'white' }} />
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: '#2c3e50',
                  mb: 2,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Welcome to Chat
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                align="center" 
                sx={{ 
                  maxWidth: '60%', 
                  mb: 4,
                  lineHeight: 1.6,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Select a conversation from the sidebar or start a new chat to begin messaging with your team members.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleOpenNewChatDialog}
                sx={{ 
                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #2980b9 0%, #1f5f89 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(52, 152, 219, 0.4)',
                  },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: '0 4px 16px rgba(52, 152, 219, 0.3)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Start New Conversation
              </Button>
            </Paper>
          </Grow>
        </Grid>
      </Grid>
      
      <NewChatDialog 
        open={newChatDialogOpen}
        onClose={handleCloseNewChatDialog}
        onStartChat={handleStartNewChat}
      />
    </Box>
  );
};

export default ChatList;