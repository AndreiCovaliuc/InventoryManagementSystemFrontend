import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  IconButton, 
  Avatar, 
  Badge, 
  CircularProgress,
  Fade,
  Grow,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachIcon,
  KeyboardArrowDown as ScrollDownIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ChatService from '../../services/ChatService';
import Message from './Message';
import { keyframes } from '@mui/system';
import EmojiPicker from 'emoji-picker-react';
import { Popover } from '@mui/material';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const typingDots = keyframes`
  0%, 20% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`;

const ChatDetail = () => {
  const { chatId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);
  const inputRef = useRef(null);
  
  // Emoji picker state
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (chatId) {
      fetchChatInfo();
      fetchMessages();
      
      const interval = setInterval(() => {
        fetchMessages(false);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatInfo = async () => {
    try {
      setLoading(true);
      const response = await ChatService.getChatInfo(chatId);
      setChatInfo(response.data);
    } catch (error) {
      console.error('Error fetching chat info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await ChatService.getMessages(chatId);
      
      if (response.data && response.data.length > 0) {
        ChatService.markChatAsRead(chatId);
      }
      
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto' 
      });
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      await ChatService.sendMessage(chatId, newMessage);
      setNewMessage('');
      await fetchMessages(false);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleBackToList = () => {
    navigate('/chat');
  };

  const getMessageGroups = () => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  const getFormattedDateHeader = (dateStr) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();
    
    if (dateStr === today) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return dateStr;
  };

  // Emoji handlers
  const handleEmojiClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setAnchorEl(null);
  };

  const onEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji.emoji);
    handleEmojiClose();
    inputRef.current?.focus();
  };

  if (loading && !chatInfo) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={50} 
            thickness={4}
            sx={{ color: '#3498db' }}
          />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 2, fontWeight: 500 }}
          >
            Loading conversation...
          </Typography>
        </Box>
      </Box>
    );
  }

  const messageGroups = getMessageGroups();

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      backgroundColor: '#f0f2f5', 
      minHeight: '100vh' 
    }}>
      <Grow in={true} timeout={500}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: '16px',
            overflow: 'hidden',
            height: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Enhanced Chat Header */}
          <Box 
            sx={{ 
              p: 2,
              px: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Back to chats">
                <IconButton 
                  onClick={handleBackToList} 
                  sx={{ 
                    mr: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(52, 152, 219, 0.1)',
                      transform: 'translateX(-2px)',
                    }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              
              {chatInfo && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: chatInfo.otherParticipant.online ? '#44b700' : '#bdbdbd',
                        color: chatInfo.otherParticipant.online ? '#44b700' : '#bdbdbd',
                        boxShadow: `0 0 0 2px white`,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        animation: chatInfo.otherParticipant.online 
                          ? `${pulse} 2s infinite` 
                          : 'none',
                      },
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 48, 
                        height: 48,
                        background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
                      }}
                    >
                      {chatInfo.otherParticipant.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                  <Box sx={{ ml: 2 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        color: '#2c3e50',
                      }}
                    >
                      {chatInfo.otherParticipant.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: chatInfo.otherParticipant.online ? '#44b700' : 'text.secondary',
                        fontWeight: 500,
                        fontSize: '0.8rem',
                      }}
                    >
                      {chatInfo.otherParticipant.online ? '● Online' : '○ Offline'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
            
            <Tooltip title="More options">
              <IconButton 
                sx={{ 
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                  }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Enhanced Message List */}
          <Box 
            ref={messageListRef}
            onScroll={handleScroll}
            sx={{ 
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              background: 'linear-gradient(180deg, #e8eef7 0%, #dfe6f0 100%)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
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
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(52, 152, 219, 0.5)',
              },
            }}
          >
            {Object.keys(messageGroups).map(date => (
              <Box key={date}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 3, 
                    mt: 2 
                  }}
                >
                  <Chip
                    label={getFormattedDateHeader(date)}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: '#546e7a',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                    }}
                  />
                </Box>
                
                {messageGroups[date].map((message) => (
                  <Message 
                    key={message.id} 
                    message={message} 
                    isOwn={message.senderId === currentUser?.id} 
                  />
                ))}
              </Box>
            ))}
            
            {/* Empty State */}
            {messages.length === 0 && (
              <Fade in={true} timeout={800}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '100%',
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      boxShadow: '0 8px 32px rgba(52, 152, 219, 0.3)',
                    }}
                  >
                    <SendIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#2c3e50',
                      mb: 1,
                    }}
                  >
                    Start a Conversation
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ maxWidth: 300 }}
                  >
                    Send your first message to begin chatting with {chatInfo?.otherParticipant?.name || 'this person'}
                  </Typography>
                </Box>
              </Fade>
            )}
            
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Scroll to Bottom Button */}
          <Fade in={showScrollButton}>
            <IconButton
              onClick={() => scrollToBottom()}
              sx={{
                position: 'absolute',
                bottom: 100,
                right: 30,
                backgroundColor: 'white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ScrollDownIcon />
            </IconButton>
          </Fade>
          
          {/* Enhanced Message Input */}
          <Box 
            component="form" 
            onSubmit={handleSendMessage}
            sx={{ 
              p: 2,
              px: 3,
              backgroundColor: '#ffffff',
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            {/* Commented out file attachment */}
            {/* <Tooltip title="Attach file">
              <IconButton 
                sx={{ 
                  color: '#95a5a6',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                  }
                }}
              >
                <AttachIcon />
              </IconButton>
            </Tooltip> */}
            
            <TextField
              fullWidth
              placeholder="Type your message..."
              variant="outlined"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              inputRef={inputRef}
              multiline
              maxRows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                  backgroundColor: '#f8f9fa',
                  transition: 'all 0.3s ease',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(52, 152, 219, 0.3)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3498db',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputBase-input': {
                  py: 1.5,
                  px: 2,
                },
              }}
            />
            
            <Tooltip title="Add emoji">
              <IconButton 
                onClick={handleEmojiClick}
                sx={{ 
                  color: '#95a5a6',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                  }
                }}
              >
                <EmojiIcon />
              </IconButton>
            </Tooltip>
            
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleEmojiClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <EmojiPicker onEmojiClick={onEmojiSelect} />
            </Popover>
            
            <IconButton 
              type="submit" 
              disabled={sending || !newMessage.trim()} 
              sx={{ 
                background: newMessage.trim() 
                  ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                  : 'rgba(0, 0, 0, 0.12)',
                color: 'white',
                width: 48,
                height: 48,
                transition: 'all 0.3s ease',
                boxShadow: newMessage.trim() 
                  ? '0 4px 12px rgba(52, 152, 219, 0.4)'
                  : 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2980b9 0%, #1f5f89 100%)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 6px 16px rgba(52, 152, 219, 0.5)',
                },
                '&.Mui-disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                }
              }}
            >
              {sending ? (
                <CircularProgress size={24} color="inherit" thickness={3} />
              ) : (
                <SendIcon sx={{ fontSize: 22 }} />
              )}
            </IconButton>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
};

export default ChatDetail;