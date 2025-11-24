import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button,
  Fade,
  Chip
} from '@mui/material';
import {
  Chat as ChatIcon,
  Forum as ForumIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import ChatService from '../../services/ChatService';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const ChatNavIcon = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    fetchRecentChats();
    
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchRecentChats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await ChatService.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

  const fetchRecentChats = async () => {
    try {
      setLoading(true);
      const response = await ChatService.getRecentChats();
      setRecentChats(response.data || []);
    } catch (error) {
      console.error('Error fetching recent chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const navigateToChat = (chatId) => {
    handleMenuClose();
    navigate(`/chat/${chatId}`);
  };

  const navigateToChatList = () => {
    handleMenuClose();
    navigate('/chat');
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

  return (
    <>
      <Tooltip title="Messages" arrow>
        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
          size="medium"
          sx={{ 
            position: 'relative', 
            mx: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              transform: 'scale(1.05)',
            }
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                fontWeight: 700,
                fontSize: '0.7rem',
                minWidth: 18,
                height: 18,
                animation: unreadCount > 0 ? `${pulse} 2s infinite` : 'none',
              }
            }}
          >
            <ChatIcon sx={{ fontSize: 24 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        transitionDuration={250}
        PaperProps={{
          elevation: 0,
          sx: { 
            mt: 1.5, 
            borderRadius: '16px',
            width: 360,
            maxHeight: 500,
            overflow: 'visible',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: -8,
              right: 16,
              width: 16,
              height: 16,
              bgcolor: 'background.paper',
              transform: 'rotate(45deg)',
              zIndex: 0,
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
            },
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2.5 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: '#2c3e50',
                }}
              >
                Messages
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} unread`}
                  size="small"
                  sx={{
                    mt: 0.5,
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    color: 'white',
                  }}
                />
              )}
            </Box>
            <Tooltip title="View all chats" arrow>
              <IconButton 
                size="small" 
                onClick={navigateToChatList}
                sx={{
                  backgroundColor: 'rgba(52, 152, 219, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                  }
                }}
              >
                <ForumIcon sx={{ color: '#3498db', fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Divider sx={{ mb: 2, opacity: 0.6 }} />
          
          {/* Chat List */}
          <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
            {recentChats.length === 0 ? (
              <Box sx={{ 
                py: 4, 
                textAlign: 'center' 
              }}>
                <ChatIcon sx={{ 
                  fontSize: 40, 
                  color: '#bdc3c7', 
                  mb: 1 
                }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  No recent conversations
                </Typography>
              </Box>
            ) : (
              recentChats.map((chat, index) => (
                <Fade in={true} timeout={300 + index * 100} key={chat.id}>
                  <MenuItem 
                    onClick={() => navigateToChat(chat.id)}
                    sx={{
                      borderRadius: '12px',
                      mb: 1,
                      py: 1.5,
                      px: 1.5,
                      backgroundColor: chat.hasUnread 
                        ? 'rgba(52, 152, 219, 0.08)' 
                        : 'transparent',
                      border: chat.hasUnread
                        ? '1px solid rgba(52, 152, 219, 0.15)'
                        : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: chat.hasUnread
                          ? 'rgba(52, 152, 219, 0.12)'
                          : 'rgba(0, 0, 0, 0.04)',
                        transform: 'translateX(4px)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: chat.otherParticipant?.online 
                              ? '#44b700' 
                              : 'transparent',
                            boxShadow: chat.otherParticipant?.online
                              ? '0 0 0 2px white'
                              : 'none',
                            width: 10,
                            height: 10,
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
                          {chat.otherParticipant.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center' 
                        }}>
                          <Typography 
                            variant="body2" 
                            sx={{
                              fontWeight: chat.hasUnread ? 700 : 500,
                              color: '#2c3e50',
                              fontSize: '0.9rem',
                            }}
                          >
                            {chat.otherParticipant.name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{
                              color: chat.hasUnread ? '#3498db' : 'text.secondary',
                              fontWeight: chat.hasUnread ? 600 : 400,
                              fontSize: '0.65rem',
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
                        }}>
                          <Typography 
                            variant="caption" 
                            sx={{
                              color: chat.hasUnread ? '#2c3e50' : 'text.secondary',
                              fontWeight: chat.hasUnread ? 500 : 400,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: chat.hasUnread ? 'calc(100% - 16px)' : '100%',
                              fontSize: '0.8rem',
                            }}
                          >
                            {chat.lastMessage?.content || 'No messages yet'}
                          </Typography>
                          {chat.hasUnread && (
                            <CircleIcon 
                              sx={{ 
                                fontSize: 10, 
                                color: '#3498db',
                                flexShrink: 0,
                                ml: 1,
                              }} 
                            />
                          )}
                        </Box>
                      }
                    />
                  </MenuItem>
                </Fade>
              ))
            )}
          </Box>
          
          <Divider sx={{ my: 1.5, opacity: 0.6 }} />
          
          {/* Footer Button */}
          <Button
            component={Link}
            to="/chat"
            fullWidth
            variant="contained"
            onClick={handleMenuClose}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              py: 1.2,
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #2980b9 0%, #1f5f89 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(52, 152, 219, 0.4)',
              }
            }}
          >
            Open Chat Center
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default ChatNavIcon;