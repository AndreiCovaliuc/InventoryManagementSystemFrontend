import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
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
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Message as MessageIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  ChatBubbleOutline as ChatBubbleIcon,
  PersonAdd as PersonAddIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { usePresence } from '../../context/PresenceContext';
import ChatService from '../../services/ChatService';
import websocketService from '../../services/WebSocketService';
import NewChatDialog from './NewChatDialog';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
`;

const ChatList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { currentUser } = useContext(AuthContext);
  const { isUserOnline } = usePresence();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);

  // New state for inline chat
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const chatSubRef = useRef(null);
  const unreadSubRef = useRef(null);

  // Append incoming WS message to the inline panel, deduplicated by id
  const handleIncomingMessage = useCallback((msg) => {
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
    // Refresh chat list so the last-message preview updates
    fetchChats(false);
  }, []);

  useEffect(() => {
    fetchChats();
    // Still poll chat list (metadata / last message preview) — no WS topic for that
    const interval = setInterval(() => {
      fetchChats(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe/unsubscribe from the selected chat's message topic
  useEffect(() => {
    if (chatSubRef.current) {
      chatSubRef.current.unsubscribe();
      chatSubRef.current = null;
    }
    if (!selectedChatId) return;

    const subTimeout = setTimeout(() => {
      chatSubRef.current = websocketService.subscribe(
        `/topic/chat/${selectedChatId}`,
        handleIncomingMessage
      );
    }, 200);

    return () => {
      clearTimeout(subTimeout);
      if (chatSubRef.current) {
        chatSubRef.current.unsubscribe();
        chatSubRef.current = null;
      }
    };
  }, [selectedChatId, handleIncomingMessage]);

  // Subscribe to unread count updates to keep hasUnread badges in sync
  useEffect(() => {
    if (!currentUser?.id) return;
    const subTimeout = setTimeout(() => {
      unreadSubRef.current = websocketService.subscribe(
        `/topic/chat/unread/${currentUser.id}`,
        () => {
          // Re-fetch for authoritative hasUnread state — fires for both
          // new incoming messages AND mark-as-read (which decrements the count)
          fetchChats(false);
        }
      );
    }, 200);

    return () => {
      clearTimeout(subTimeout);
      if (unreadSubRef.current) {
        unreadSubRef.current.unsubscribe();
        unreadSubRef.current = null;
      }
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (chats.length > 0) {
      applySearchFilter();
    }
  }, [searchTerm, chats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await ChatService.getAllChats();
      setChats(response.data || []);
      setFilteredChats(response.data || []);
      
      // Update selected chat info if it's open
      if (selectedChatId && response.data) {
        const updatedChat = response.data.find(c => c.id === selectedChatId);
        if (updatedChat) {
          setSelectedChat(updatedChat);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId, showLoading = true) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const response = await ChatService.getMessages(chatId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const applySearchFilter = () => {
    if (!searchTerm.trim()) {
      setFilteredChats(chats);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = chats.filter(chat =>
      (chat.otherParticipant && chat.otherParticipant.name && chat.otherParticipant.name.toLowerCase().includes(term)) ||
      (chat.lastMessage && chat.lastMessage.content.toLowerCase().includes(term))
    );
    setFilteredChats(filtered);
  };

  const handleChatItemClick = async (chat) => {
    setSelectedChatId(chat.id);
    setSelectedChat(chat);
    await fetchMessages(chat.id);

    // Mark as read
    try {
      await ChatService.markChatAsRead(chat.id);
      // Refresh chat list but don't update selectedChat since we just set it
      const response = await ChatService.getAllChats();
      setChats(response.data || []);
      setFilteredChats(response.data || []);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId) return;

    try {
      const response = await ChatService.sendMessage(selectedChatId, messageInput.trim());
      setMessages([...messages, response.data]);
      setMessageInput('');
      fetchChats(false); // Refresh to update last message
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    setSelectedChat(null);
    setMessages([]);
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
      const newChat = response.data;
      
      // Add to chats list and select it
      setChats([newChat, ...chats]);
      setFilteredChats([newChat, ...filteredChats]);
      handleChatItemClick(newChat);
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

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
      {/* Header Section - Hide when viewing chat on mobile */}
      {(!isMobile || !selectedChat) && (
        <Fade in={true} timeout={600}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 2, md: 4 }
          }}>
            <Box>
              <Typography
                variant={isMobile ? "h5" : "h4"}
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
              size={isMobile ? "small" : "medium"}
              sx={{
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.2 },
                boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2980b9 0%, #1f5f89 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(52, 152, 219, 0.4)',
                },
              }}
            >
              {isMobile ? 'New' : 'New Chat'}
            </Button>
          </Box>
        </Fade>
      )}

      <Grid container spacing={isMobile ? 0 : 3}>
        {/* Chat List Panel - Hide on mobile when chat is selected */}
        <Grid item xs={12} md={4} sx={{ display: isMobile && selectedChat ? 'none' : 'block' }}>
          <Grow in={true} timeout={800}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                height: { xs: 'calc(100vh - 140px)', md: 'calc(100vh - 200px)' },
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
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
                  overflowX: 'hidden',
                  flexGrow: 1,
                  pb: 1,
                  scrollbarGutter: 'stable',
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
                  <List sx={{ width: '100%', p: 1.5 }}>
                    {filteredChats.map((chat, index) => (
                      <Fade 
                        in={true} 
                        timeout={300 + index * 100} 
                        key={chat.id}
                      >
                        <Box>
                          <ListItemButton
                            onClick={() => handleChatItemClick(chat)}
                            selected={selectedChatId === chat.id}
                            sx={{
                              borderRadius: '12px',
                              mb: 0.5,
                              px: 1.5,
                              py: 1,
                              transition: 'all 0.2s ease',
                              backgroundColor: selectedChatId === chat.id
                                ? 'rgba(52, 152, 219, 0.15)'
                                : chat.hasUnread
                                  ? 'rgba(52, 152, 219, 0.08)'
                                  : 'transparent',
                              border: selectedChatId === chat.id
                                ? '1px solid rgba(52, 152, 219, 0.4)'
                                : chat.hasUnread
                                  ? '1px solid rgba(52, 152, 219, 0.2)'
                                  : '1px solid transparent',
                              '&:hover': {
                                backgroundColor: selectedChatId === chat.id
                                  ? 'rgba(52, 152, 219, 0.2)'
                                  : chat.hasUnread
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
                                    backgroundColor: chat.otherParticipant && isUserOnline(chat.otherParticipant.id)
                                      ? '#44b700'
                                      : 'transparent',
                                    boxShadow: chat.otherParticipant && isUserOnline(chat.otherParticipant.id)
                                      ? '0 0 0 2px white'
                                      : 'none',
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                  },
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 44,
                                    height: 44,
                                    background: chat.hasUnread
                                      ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                                      : 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    boxShadow: chat.hasUnread
                                      ? '0 4px 12px rgba(52, 152, 219, 0.3)'
                                      : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                  }}
                                >
                                  {chat.otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
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
                                    {chat.otherParticipant?.name || 'Unknown'}
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
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mt: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    component="span"
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
                                      component="span"
                                      sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                                        boxShadow: '0 2px 8px rgba(52, 152, 219, 0.4)',
                                        flexShrink: 0,
                                        ml: 1,
                                        display: 'inline-block',
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                            />
                          </ListItemButton>
                        </Box>
                      </Fade>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Grow>
        </Grid>
        
        {/* Chat Conversation / Welcome Panel - Show on mobile only when chat selected */}
        <Grid item xs={12} md={8} sx={{ display: isMobile && !selectedChat ? 'none' : 'block' }}>
          <Grow in={true} timeout={1000}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: isMobile ? '0' : '16px',
                height: isMobile ? 'calc(100vh - 16px)' : 'calc(100vh - 200px)',
                boxShadow: isMobile ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {selectedChat ? (
                // Chat Conversation View
                <>
                  {/* Chat Header */}
                  <Box
                    sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    {isMobile && (
                      <IconButton
                        onClick={handleBackToList}
                        sx={{
                          color: '#3498db',
                        }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                    )}
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: selectedChat.otherParticipant && isUserOnline(selectedChat.otherParticipant.id)
                            ? '#44b700'
                            : '#95a5a6',
                          boxShadow: '0 0 0 2px white',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                        }}
                      >
                        {selectedChat.otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
                      </Avatar>
                    </Badge>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                        {selectedChat.otherParticipant?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {selectedChat.otherParticipant && isUserOnline(selectedChat.otherParticipant.id) ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Messages Area */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      overflowY: 'auto',
                      p: { xs: 1.5, sm: 2 },
                      background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.02) 0%, rgba(41, 128, 185, 0.05) 100%)',
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
                    {loadingMessages ? (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%' 
                      }}>
                        <CircularProgress size={40} sx={{ color: '#3498db' }} />
                      </Box>
                    ) : messages.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%',
                      }}>
                        <MessageIcon sx={{ fontSize: 48, color: '#bdc3c7', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          No messages yet. Start the conversation!
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        {messages.map((msg, index) => {
                          const isOwnMessage = msg.senderId === currentUser?.id;
                          const prevMsg = index > 0 ? messages[index - 1] : null;
                          const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

                          // Check if we should show timestamp
                          // Show if: last message, different sender next, or 5+ min gap to next message
                          let showTimestamp = true;
                          if (nextMsg) {
                            const sameSenderNext = nextMsg.senderId === msg.senderId;
                            const currentTime = new Date(msg.timestamp);
                            const nextTime = new Date(nextMsg.timestamp);
                            const timeDiffMinutes = (nextTime - currentTime) / (1000 * 60);

                            // Hide timestamp if same sender and less than 5 min gap
                            if (sameSenderNext && timeDiffMinutes < 5) {
                              showTimestamp = false;
                            }
                          }

                          // Reduce margin if consecutive messages from same sender
                          const isConsecutive = prevMsg && prevMsg.senderId === msg.senderId;

                          return (
                            <Fade in={true} timeout={300} key={msg.id || index}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                  mb: showTimestamp ? 1.5 : 0.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    maxWidth: { xs: '85%', sm: '70%' },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      background: isOwnMessage
                                        ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                                        : '#ffffff',
                                      color: isOwnMessage ? '#ffffff' : '#2c3e50',
                                      borderRadius: isOwnMessage
                                        ? isConsecutive ? '12px 12px 4px 12px' : '18px 18px 4px 18px'
                                        : isConsecutive ? '12px 12px 12px 4px' : '18px 18px 18px 4px',
                                      px: { xs: 1.5, sm: 2 },
                                      py: { xs: 0.8, sm: 1 },
                                      boxShadow: isOwnMessage
                                        ? '0 2px 8px rgba(52, 152, 219, 0.25)'
                                        : '0 1px 4px rgba(0, 0, 0, 0.08)',
                                      wordBreak: 'break-word',
                                    }}
                                  >
                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.925rem' } }}>
                                      {msg.content}
                                    </Typography>
                                  </Box>
                                  {showTimestamp && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'text.secondary',
                                        mt: 0.3,
                                        px: 0.5,
                                        fontSize: '0.65rem',
                                      }}
                                    >
                                      {formatMessageTime(msg.timestamp)}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Fade>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </Box>
                    )}
                  </Box>

                  {/* Message Input */}
                  <Box 
                    sx={{ 
                      p: 2,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: '#f0f2f5',
                            '& fieldset': {
                              borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(52, 152, 219, 0.3)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#3498db',
                            },
                          },
                        }}
                      />
                      <IconButton
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        sx={{
                          background: messageInput.trim()
                            ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                            : '#e0e0e0',
                          color: '#ffffff',
                          width: 48,
                          height: 48,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: messageInput.trim()
                              ? 'linear-gradient(135deg, #2980b9 0%, #1f5f89 100%)'
                              : '#e0e0e0',
                            transform: messageInput.trim() ? 'scale(1.05)' : 'none',
                          },
                          '&:disabled': {
                            color: '#9e9e9e',
                          },
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </>
              ) : (
                // Welcome Panel
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.03) 0%, rgba(41, 128, 185, 0.08) 100%)',
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
                </Box>
              )}
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