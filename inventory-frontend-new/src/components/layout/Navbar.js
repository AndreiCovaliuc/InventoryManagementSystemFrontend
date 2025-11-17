import React, { useState, useContext } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  useTheme, 
  useMediaQuery, 
  Avatar, 
  Divider
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ReceiptIcon from '@mui/icons-material/Receipt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import { AuthContext } from '../../context/AuthContext';
import NotificationsSystem from '../../components/notifications/NotificationsSystem';
import ChatNavIcon from '../../components/chat/ChatNavIcon';
import ChatIcon from '@mui/icons-material/Chat'

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useContext(AuthContext);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const isActive = (path) => location.pathname === path;

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const drawerItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Products', icon: <ShoppingCartIcon />, path: '/products' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Suppliers', icon: <LocalShippingIcon />, path: '/suppliers' },
    { text: 'Inventory', icon: <WarehouseIcon />, path: '/inventory' },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/transactions' },
    { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
  ];
  
  // Add Users management for admins
  if (isAdmin()) {
    drawerItems.push({ text: 'Users', icon: <PeopleIcon />, path: '/users' });
  }

  const drawer = (
    <Box 
      sx={{ width: 280 }} 
      role="presentation" 
      onClick={toggleDrawer(false)} 
      onKeyDown={toggleDrawer(false)}
    >
      <Box 
        sx={{ 
          p: 3, 
          mb: 2, 
          backgroundImage: 'linear-gradient(120deg, #3498db, #2980b9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar 
          sx={{ 
            width: 70, 
            height: 70, 
            mb: 2, 
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          <InventoryIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          Inventory System
        </Typography>
        {currentUser && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)', 
              mt: 1,
              fontFamily: "'Roboto', sans-serif"
            }}
          >
            {currentUser.username}
          </Typography>
        )}
      </Box>
      
      <List component="nav" sx={{ px: 2 }}>
        {drawerItems.map((item) => (
          <ListItem 
            button 
            component={Link} 
            to={item.path} 
            key={item.text}
            sx={{ 
              py: 1.5,
              mb: 1,
              backgroundColor: isActive(item.path) ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
              borderRadius: '8px',
              borderLeft: isActive(item.path) ? `4px solid #3498db` : '4px solid transparent',
              '&:hover': {
                backgroundColor: 'rgba(52, 152, 219, 0.05)',
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: isActive(item.path) ? '#3498db' : 'rgba(0, 0, 0, 0.54)',
              minWidth: '40px'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: isActive(item.path) ? 600 : 400,
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.95rem'
              }}
            />
            {isActive(item.path) && (
              <Box 
                sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  backgroundColor: '#3498db',
                  mr: 1
                }} 
              />
            )}
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <List component="nav" sx={{ px: 2 }}>
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{ 
            py: 1.5,
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(231, 76, 60, 0.05)',
            }
          }}
        >
          <ListItemIcon sx={{ 
            color: '#e74c3c',
            minWidth: '40px'
          }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.95rem',
              color: '#e74c3c'
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={1}
        sx={{ 
          backgroundColor: 'white', 
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Left section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile ? (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ 
                  mr: 2,
                  color: '#3498db'
                }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box 
                component={Link} 
                to="/"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(52, 152, 219, 0.1)', 
                    color: '#3498db',
                    width: 40,
                    height: 40,
                    mr: 1.5
                  }}
                >
                  <InventoryIcon />
                </Avatar>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    backgroundImage: 'linear-gradient(45deg, #3a7bd5, #00d2ff)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'Poppins', sans-serif",
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Inventory System
                </Typography>
                {currentUser?.companyName && (
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                  ml: 1.5,
                  color: '#666',
                  fontWeight: 500,
                  fontFamily: "'Poppins', sans-serif",
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                | {currentUser.companyName}
              </Typography>
            )}
              </Box>
            )}
          </Box>

          {/* Center section - Navigation (desktop only) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mx: 2 }}>
              {drawerItems.map((item) => (
                <Button 
                  key={item.text}
                  component={Link} 
                  to={item.path}
                  sx={{ 
                    mx: 1, 
                    color: 'text.primary',
                    fontWeight: isActive(item.path) ? 600 : 400,
                    borderRadius: '8px',
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '5px',
                      left: isActive(item.path) ? '20%' : '50%',
                      right: isActive(item.path) ? '20%' : '50%',
                      height: '3px',
                      backgroundColor: '#3498db',
                      transition: 'all 0.3s ease',
                      opacity: isActive(item.path) ? 1 : 0
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(52, 152, 219, 0.05)',
                      '&:after': {
                        left: '20%',
                        right: '20%',
                        opacity: 1
                      }
                    }
                  }}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {/* Right section - User & notifications */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Notifications */}
            <NotificationsSystem buttonStyle={{ mx: 0.5 }} />
            
            {/* Chat icon */}
            <ChatNavIcon />

            {/* User profile */}
            <Box 
              sx={{ 
                ml: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Button
                onClick={handleUserMenuOpen}
                sx={{
                  textTransform: 'none',
                  borderRadius: '24px',
                  border: '1px solid',
                  borderColor: 'divider',
                  px: 1,
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(52, 152, 219, 0.05)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: 'rgba(52, 152, 219, 0.8)',
                    mr: { xs: 0, sm: 1 }
                  }}
                >
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Typography 
                  sx={{ 
                    display: { xs: 'none', sm: 'block' },
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: '0.9rem'
                  }}
                >
                  {currentUser?.username}
                </Typography>
                <KeyboardArrowDownIcon 
                  sx={{ 
                    ml: 0.5,
                    fontSize: '1rem',
                    display: { xs: 'none', sm: 'block' }
                  }} 
                />
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
      
      {/* User Profile Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        id="account-menu"
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            mt: 1.5, 
            borderRadius: '12px',
            minWidth: 220,
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
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: 'rgba(52, 152, 219, 0.8)',
                mr: 1.5
              }}
            >
              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {currentUser?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentUser?.email || 'user@example.com'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider />
        
        <MenuItem 
          component={Link} 
          to="/profile" 
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" sx={{ color: '#3498db' }} />
          </ListItemIcon>
          <ListItemText>
            My Profile
          </ListItemText>
        </MenuItem>
        
        {isAdmin() && (
          <MenuItem component={Link} to="/users" sx={{ py: 1.5 }}>
            <ListItemIcon>
              <PeopleIcon fontSize="small" sx={{ color: '#3498db' }} />
            </ListItemIcon>
            <ListItemText>
              User Management
            </ListItemText>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#e74c3c' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#e74c3c' }} />
          </ListItemIcon>
          <ListItemText>
            Logout
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navbar;