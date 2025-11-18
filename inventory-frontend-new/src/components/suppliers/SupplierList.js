import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Card,
  CardContent,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  LocalShipping as SupplierIcon,
  ShoppingCart as ProductIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
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

const ModernSupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState({
    id: null,
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    productCount: 0
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (suppliers.length > 0) {
      applyFilters();
    }
  }, [searchTerm, suppliers]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/suppliers', {
        headers: authHeader()
      });
      
      setSuppliers(Array.isArray(response.data) ? response.data : []);
      setFilteredSuppliers(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load suppliers. Please try again later.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!Array.isArray(suppliers)) return;
    
    let result = [...suppliers];
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(supplier => 
        (supplier.name && supplier.name.toLowerCase().includes(lowerSearchTerm)) || 
        (supplier.contactName && supplier.contactName.toLowerCase().includes(lowerSearchTerm)) ||
        (supplier.email && supplier.email.toLowerCase().includes(lowerSearchTerm)) ||
        (supplier.phone && supplier.phone.toLowerCase().includes(lowerSearchTerm)) ||
        (supplier.address && supplier.address.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    setFilteredSuppliers(result);
  };

  const handleOpenDialog = (supplier = null) => {
    if (supplier) {
      setCurrentSupplier({
        ...supplier
      });
      setIsEditing(true);
    } else {
      setCurrentSupplier({
        id: null,
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        productCount: 0
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSupplier({
      ...currentSupplier,
      [name]: value
    });
  };

  const handleSaveSupplier = async () => {
    try {
      // Validate inputs
      if (!currentSupplier.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Supplier name is required',
          severity: 'error'
        });
        return;
      }

      let response;
      if (isEditing) {
        response = await axios.put(
          `http://localhost:8080/api/suppliers/${currentSupplier.id}`, 
          currentSupplier,
          {
            headers: {
              ...authHeader(),
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Update suppliers array with edited supplier
        setSuppliers(suppliers.map(s => s.id === currentSupplier.id ? response.data : s));
        
        setSnackbar({
          open: true,
          message: 'Supplier updated successfully!',
          severity: 'success'
        });
      } else {
        response = await axios.post(
          'http://localhost:8080/api/suppliers', 
          currentSupplier,
          {
            headers: {
              ...authHeader(),
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Add new supplier to suppliers array
        setSuppliers([...suppliers, response.data]);
        
        setSnackbar({
          open: true,
          message: 'Supplier added successfully!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving supplier:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save supplier. Please try again.',
        severity: 'error'
      });
    }
  };

  const openDeleteConfirm = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/suppliers/${supplierToDelete.id}`, {
        headers: authHeader()
      });
      
      // Remove deleted supplier from suppliers array
      setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id));
      
      setSnackbar({
        open: true,
        message: 'Supplier deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete supplier. It may be referenced by products.',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Function to toggle between grid and table view
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'table' : 'grid');
  };

  if (loading && suppliers.length === 0) {
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
            Suppliers
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchSuppliers}
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
              variant="outlined" 
              onClick={toggleViewMode}
              sx={{ 
                mr: 2,
                borderColor: '#3a7bd5',
                color: '#3a7bd5',
                '&:hover': { 
                  borderColor: '#2a6ac5',
                  backgroundColor: 'rgba(58, 123, 213, 0.04)'
                },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              {viewMode === 'grid' ? 'Table View' : 'Grid View'}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                backgroundColor: '#28a745',
                '&:hover': { backgroundColor: '#218838' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              Add Supplier
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search suppliers by name, contact, email, phone or address"
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

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <Grid item xs={12} sm={6} md={4} key={supplier.id}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      borderRadius: '12px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: '6px',
                        background: 'linear-gradient(90deg, #9b59b6, #6a0dad)',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px'
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              background: 'linear-gradient(90deg, #9b59b6, #6a0dad)',
                              mr: 2
                            }}
                          >
                            <SupplierIcon />
                          </Avatar>
                          <Box>
                            <Typography 
                              variant="h6" 
                              component="div" 
                              fontWeight={600}
                              sx={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                              {supplier.name}
                            </Typography>
                            {supplier.contactName && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <PersonIcon sx={{ color: '#6a0dad', fontSize: '0.875rem', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {supplier.contactName}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                        <Chip 
                          icon={<ProductIcon sx={{ fontSize: '1rem !important' }} />}
                          label={`${supplier.productCount} products`} 
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(155, 89, 182, 0.1)',
                            color: '#9b59b6',
                            fontWeight: 500,
                            '& .MuiChip-icon': { color: '#9b59b6' }
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        {supplier.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <EmailIcon sx={{ color: '#9b59b6', fontSize: '1.25rem', mr: 1 }} />
                            <Typography variant="body2">
                              {supplier.email}
                            </Typography>
                          </Box>
                        )}
                        
                        {supplier.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PhoneIcon sx={{ color: '#9b59b6', fontSize: '1.25rem', mr: 1 }} />
                            <Typography variant="body2">
                              {supplier.phone}
                            </Typography>
                          </Box>
                        )}
                        
                        {supplier.address && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                            <LocationIcon sx={{ color: '#9b59b6', fontSize: '1.25rem', mr: 1, mt: 0.2 }} />
                            <Typography variant="body2">
                              {supplier.address}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenDialog(supplier)}
                            sx={{ 
                              mr: 1,
                              backgroundColor: 'rgba(58, 123, 213, 0.1)',
                              '&:hover': { backgroundColor: 'rgba(58, 123, 213, 0.2)' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => openDeleteConfirm(supplier)}
                              disabled={supplier.productCount > 0}
                              sx={{ 
                                backgroundColor: supplier.productCount > 0 ? 'rgba(200, 200, 200, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                                '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.2)' }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 4, 
                    borderRadius: '12px',
                    textAlign: 'center',
                    background: 'white',
                    border: '1px dashed #ccc'
                  }}
                >
                  <SupplierIcon sx={{ fontSize: 60, color: '#aaa', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No suppliers found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? 'Try adjusting your search terms' : 'Add your first supplier using the button above'}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        ) : (
          // Table View
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
              <TableHead sx={{ backgroundColor: 'rgba(155, 89, 182, 0.1)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#9b59b6' }}>Supplier</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#9b59b6' }}>Contact Person</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#9b59b6' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#9b59b6' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#9b59b6' }}>Products</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#9b59b6' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <TableRow 
                      key={supplier.id}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(155, 89, 182, 0.03)'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '8px',
                              backgroundColor: 'rgba(155, 89, 182, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2
                            }}
                          >
                            <SupplierIcon sx={{ color: '#9b59b6' }} />
                          </Box>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>{supplier.name}</Typography>
                            {supplier.address && (
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  mt: 0.5
                                }}
                              >
                                <LocationIcon sx={{ fontSize: '0.75rem', mr: 0.5 }} />
                                {supplier.address}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{supplier.contactName || '-'}</TableCell>
                      <TableCell>
                        {supplier.email ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ color: '#9b59b6', fontSize: '1rem', mr: 0.5 }} />
                            {supplier.email}
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {supplier.phone ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon sx={{ color: '#9b59b6', fontSize: '1rem', mr: 0.5 }} />
                            {supplier.phone}
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<ProductIcon fontSize="small" />}
                          label={supplier.productCount || 0} 
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(155, 89, 182, 0.1)',
                            color: '#9b59b6',
                            fontWeight: 500,
                            '& .MuiChip-icon': { color: '#9b59b6' }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handleOpenDialog(supplier)}
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
                          <Tooltip title="Delete">
                            <span>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => openDeleteConfirm(supplier)}
                                disabled={supplier.productCount > 0}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No suppliers found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {searchTerm ? 'Try adjusting your search terms' : 'Add your first supplier using the button above'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add/Edit Supplier Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: 2
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" fontWeight={600} color="#9b59b6">
              {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Supplier Name"
                  fullWidth
                  value={currentSupplier.name}
                  onChange={handleInputChange}
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
                        <SupplierIcon sx={{ color: 'rgba(155, 89, 182, 0.6)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="contactName"
                  label="Contact Person"
                  fullWidth
                  value={currentSupplier.contactName || ''}
                  onChange={handleInputChange}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'rgba(155, 89, 182, 0.6)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  value={currentSupplier.email || ''}
                  onChange={handleInputChange}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'rgba(155, 89, 182, 0.6)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="phone"
                  label="Phone"
                  fullWidth
                  value={currentSupplier.phone || ''}
                  onChange={handleInputChange}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: 'rgba(155, 89, 182, 0.6)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Address"
                  fullWidth
                  value={currentSupplier.address || ''}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <LocationIcon sx={{ color: 'rgba(155, 89, 182, 0.6)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              sx={{ 
                color: '#6c757d',
                fontWeight: 500,
                borderRadius: '8px'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSupplier} 
              variant="contained"
              sx={{ 
                backgroundColor: '#9b59b6',
                '&:hover': { backgroundColor: '#8e44ad' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              {isEditing ? 'Update' : 'Add'} Supplier
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
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete the supplier "{supplierToDelete?.name}"? This action cannot be undone.
            </Typography>
            {supplierToDelete && supplierToDelete.productCount > 0 && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mt: 2,
                  borderRadius: '8px'
                }}
              >
                This supplier has {supplierToDelete.productCount} products assigned to it. 
                Please reassign or delete these products first.
              </Alert>
            )}
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
              onClick={handleDeleteSupplier} 
              variant="contained" 
              color="error"
              disabled={supplierToDelete && supplierToDelete.productCount > 0}
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
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
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

export default ModernSupplierList;