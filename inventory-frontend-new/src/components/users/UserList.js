import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Grow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Person as UserIcon,
  Email as EmailIcon,
  Password as PasswordIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

// Get auth header function
function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { 'Authorization': 'Bearer ' + user.token };
  } else {
    return {};
  }
}

const ModernUserList = () => {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE'
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false
  });

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const getFieldError = (fieldName, value, isEditMode) => {
    switch (fieldName) {
      case 'name':
        if (!value || !value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 50) return 'Name must be less than 50 characters';
        return '';
      case 'email':
        if (!value || !value.trim()) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!isEditMode && (!value || !value.trim())) return 'Password is required';
        if (value && value.length > 0 && value.length < 8) return 'Password must be at least 8 characters';
        if (value && value.length > 0 && !validatePassword(value)) {
          return 'Password must contain uppercase, lowercase, and number';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const nameError = getFieldError('name', currentEditUser.name, isEditing);
    const emailError = getFieldError('email', currentEditUser.email, isEditing);
    const passwordError = getFieldError('password', currentEditUser.password, isEditing);

    setFormErrors({
      name: nameError,
      email: emailError,
      password: passwordError
    });

    return !nameError && !emailError && !passwordError;
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = getFieldError(fieldName, currentEditUser[fieldName], isEditing);
    setFormErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      applyFilters();
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/admin/users', { 
        headers: authHeader() 
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
      setFilteredUsers(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load users. Please try again later.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(lowerSearchTerm)) || 
        (user.email && user.email.toLowerCase().includes(lowerSearchTerm)) ||
        (user.role && user.role.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    setFilteredUsers(result);
  };

  const handleCreateUser = async () => {
    try {
      // Mark all fields as touched
      setTouched({ name: true, email: true, password: true });

      // Validate form
      if (!validateForm()) {
        setSnackbar({
          open: true,
          message: 'Please fix the errors in the form',
          severity: 'error'
        });
        return;
      }

      let response;
      
      if (currentEditUser.id) {
        // Update user
        response = await axios.put(
          `http://localhost:8080/api/admin/users/${currentEditUser.id}`, 
          currentEditUser,
          { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
        );
      } else {
        // Create user
        response = await axios.post(
          'http://localhost:8080/api/admin/users', 
          currentEditUser,
          { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
        );
      }
      
      setSnackbar({
        open: true,
        message: currentEditUser.id ? 'User updated successfully' : 'User created successfully',
        severity: 'success'
      });
      
      setOpenDialog(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${userToDelete.id}`, {
        headers: authHeader()
      });
      
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
      
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    }
  };

  const openEditDialog = (user) => {
    setCurrentEditUser({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '', // Don't prefill password
      role: user.role
    });
    setFormErrors({ name: '', email: '', password: '' });
    setTouched({ name: false, email: false, password: false });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const openCreateDialog = () => {
    setCurrentEditUser({
      id: null,
      name: '',
      email: '',
      password: '',
      role: 'EMPLOYEE'
    });
    setFormErrors({ name: '', email: '', password: '' });
    setTouched({ name: false, email: false, password: false });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEditUser({
      ...currentEditUser,
      [name]: value
    });
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'ADMIN':
        return <AdminIcon sx={{ color: '#e74c3c' }} />;
      case 'MANAGER':
        return <ManagerIcon sx={{ color: '#3498db' }} />;
      default:
        return <UserIcon sx={{ color: '#2ecc71' }} />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN':
        return {
          bg: 'rgba(231, 76, 60, 0.1)',
          text: '#e74c3c',
          iconColor: '#e74c3c'
        };
      case 'MANAGER':
        return {
          bg: 'rgba(52, 152, 219, 0.1)',
          text: '#3498db',
          iconColor: '#3498db'
        };
      default:
        return {
          bg: 'rgba(46, 204, 113, 0.1)',
          text: '#2ecc71',
          iconColor: '#2ecc71'
        };
    }
  };
  
  // Get current user's ID to prevent self-deletion
  const currentUserId = currentUser?.id;

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Grow in={true} timeout={500}>
      <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              backgroundImage: 'linear-gradient(45deg, #3a7bd5, #00d2ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Poppins', sans-serif"
            }}
          >
            User Management
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              sx={{ 
                mr: 2,
                backgroundColor: '#6c757d',
                '&:hover': { backgroundColor: '#5a6268' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              sx={{ 
                backgroundColor: '#28a745',
                '&:hover': { backgroundColor: '#218838' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              Add User
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name, email or role"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&.Mui-focused fieldset': {
                  borderColor: '#3a7bd5',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#3a7bd5' }} />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Users Table */}
        <TableContainer 
          component={Paper} 
          elevation={2} 
          sx={{ 
            borderRadius: '12px',
            overflow: 'hidden',
            mb: 3
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(58, 123, 213, 0.1)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>Role</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#3a7bd5' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const roleStyles = getRoleColor(user.role);
                  return (
                    <TableRow 
                      key={user.id}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(58, 123, 213, 0.03)'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              mr: 2,
                              bgcolor: roleStyles.bg,
                              color: roleStyles.text,
                              fontWeight: 'bold'
                            }}
                          >
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </Avatar>
                          <Typography variant="body1" fontWeight={500}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon sx={{ color: '#95a5a6', mr: 1, fontSize: '1rem' }} />
                          <Typography variant="body2">{user.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={getRoleIcon(user.role)}
                          label={user.role} 
                          size="small"
                          sx={{ 
                            backgroundColor: roleStyles.bg,
                            color: roleStyles.text,
                            fontWeight: 500,
                            '& .MuiChip-icon': {
                              color: roleStyles.iconColor
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => openEditDialog(user)}
                              sx={{ 
                                mx: 0.5,
                                color: '#3a7bd5',
                                '&:hover': {
                                  backgroundColor: 'rgba(58, 123, 213, 0.1)'
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.id === currentUserId ? "Can't delete yourself" : "Delete"}>
                            <span>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => openDeleteDialog(user)}
                                disabled={user.id === currentUserId}
                                sx={{ 
                                  mx: 0.5,
                                  '&:hover': {
                                    backgroundColor: 'rgba(231, 76, 60, 0.1)'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No users found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {searchTerm ? 'Try adjusting your search terms' : 'Add your first user using the button above'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create/Edit User Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: 2
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" fontWeight={600} color="#3a7bd5">
              {isEditing ? 'Edit User' : 'Create New User'}
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Full Name"
                  fullWidth
                  value={currentEditUser.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('name')}
                  error={touched.name && !!formErrors.name}
                  helperText={touched.name && formErrors.name}
                  required
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <UserIcon sx={{ color: touched.name && formErrors.name ? '#d32f2f' : 'rgba(58, 123, 213, 0.6)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={currentEditUser.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('email')}
                  error={touched.email && !!formErrors.email}
                  helperText={touched.email && formErrors.email}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: touched.email && formErrors.email ? '#d32f2f' : 'rgba(58, 123, 213, 0.6)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="password"
                  label={isEditing ? "Password (leave empty to keep current)" : "Password"}
                  type="password"
                  fullWidth
                  value={currentEditUser.password}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('password')}
                  error={touched.password && !!formErrors.password}
                  helperText={(touched.password && formErrors.password) || (!isEditing && 'Min 8 chars with uppercase, lowercase, and number')}
                  required={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PasswordIcon sx={{ color: touched.password && formErrors.password ? '#d32f2f' : 'rgba(58, 123, 213, 0.6)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    name="role"
                    value={currentEditUser.role}
                    label="Role"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="ADMIN">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AdminIcon sx={{ mr: 1, color: '#e74c3c' }} />
                        Administrator
                      </Box>
                    </MenuItem>
                    <MenuItem value="MANAGER">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ManagerIcon sx={{ mr: 1, color: '#3498db' }} />
                        Manager
                      </Box>
                    </MenuItem>
                    <MenuItem value="EMPLOYEE">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <UserIcon sx={{ mr: 1, color: '#2ecc71' }} />
                        Employee
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              sx={{ 
                color: '#6c757d',
                fontWeight: 500,
                borderRadius: '8px'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              variant="contained"
              sx={{ 
                backgroundColor: '#3a7bd5',
                '&:hover': { backgroundColor: '#2a6ac5' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              {isEditing ? 'Update' : 'Create'} User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: 2
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              Confirm Delete
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Typography>
              Are you sure you want to delete the user "{userToDelete?.name}" ({userToDelete?.email})? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteConfirmOpen(false)} 
              sx={{ 
                color: '#6c757d',
                fontWeight: 500,
                borderRadius: '8px'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteUser} 
              variant="contained" 
              color="error"
              sx={{ 
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ 
              width: '100%',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              borderRadius: '8px'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Grow>
  );
};

export default ModernUserList;