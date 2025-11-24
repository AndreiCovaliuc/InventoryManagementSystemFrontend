import React, { useState, useEffect, useContext } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress
} from '@mui/material';

import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import { formatDistance } from 'date-fns';
import NotificationService from '../../services/NotificationService';
import { AuthContext } from '../../context/AuthContext';

const NotificationsSystem = ({ buttonStyle }) => {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await NotificationService.getUserNotifications();
      setNotifications(response.data || []);
      setUnreadCount(response.data.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to empty array on error
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!currentUser) return;

    try {
      const response = await NotificationService.getUnreadCount();
      console.log('Notification count response:', response.data);
      const count = response.data?.count ?? response.data ?? 0;
      console.log('Setting unread count to:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications on component mount and set up refresh interval
  useEffect(() => {
    if (!currentUser) return;

    fetchNotifications();

    // Set up auto-refresh interval (every 5 seconds for better responsiveness)
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5000);

    // Clean up interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, [currentUser]);

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    fetchNotifications(); // Refresh notifications when opening the menu
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation(); // Prevent triggering parent click handler
    
    try {
      await NotificationService.deleteNotification(notificationId);
      // Remove from local state
      setNotifications(notifications.filter(n => n.id !== notificationId));
      // Update unread count if needed
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Helper function to get icon component based on icon name from backend
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'ShoppingCart':
        return <ShoppingCartIcon fontSize="small" />;
      case 'Category':
        return <CategoryIcon fontSize="small" />;
      case 'LocalShipping':
        return <LocalShippingIcon fontSize="small" />;
      case 'Person':
        return <PersonIcon fontSize="small" />;
      case 'Warning':
        return <WarningIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };
  
  // Format relative time (e.g., "5 minutes ago")
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleNotificationOpen}
        size="small"
        sx={buttonStyle || { position: 'relative', mx: 0.5 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            mt: 1.5, 
            borderRadius: '12px',
            width: 320,
            maxHeight: 450,
            overflow: 'visible',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: -6,
              right: 14,
              width: 12,
              height: 12,
              bgcolor: 'background.paper',
              transform: 'rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                onClick={handleMarkAllRead}
                sx={{ fontSize: '0.75rem' }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {/* Notification Items */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">No notifications</Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {notifications.map(notification => (
                <Box 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    p: 1.5,
                    mb: 1,
                    bgcolor: notification.bgColor || 'rgba(0, 0, 0, 0.04)',
                    borderRadius: '8px',
                    border: `1px solid ${notification.borderColor || 'transparent'}`,
                    cursor: 'pointer',
                    opacity: notification.read ? 0.7 : 1,
                    '&:hover': {
                      opacity: 0.9
                    },
                    position: 'relative'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: notification.avatarColor || 'rgba(0, 0, 0, 0.08)', 
                      color: notification.iconColor || 'inherit',
                      mr: 1.5
                    }}
                  >
                    {getIconComponent(notification.iconName)}
                  </Avatar>
                  <Box sx={{ width: 'calc(100% - 55px)' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: notification.read ? 400 : 600,
                        mb: 0.5
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word'
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        fontSize: '0.65rem',
                        fontStyle: 'italic'
                      }}
                    >
                      {formatRelativeTime(notification.timestamp)}
                    </Typography>
                  </Box>
                  
                  {/* Delete button */}
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                    sx={{ 
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      opacity: 0.6,
                      '&:hover': {
                        opacity: 1,
                        bgcolor: 'rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default NotificationsSystem;