import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  Grow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Remove as RemoveIcon
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

const ModernInventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInventory, setCurrentInventory] = useState({
    id: null,
    productId: null,
    productName: '',
    quantity: 0,
    reorderLevel: 0,
    reorderQuantity: 0,
    location: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filteredInventory, setFilteredInventory] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (inventory.length > 0) {
      applyFilters();
    }
  }, [searchTerm, inventory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryRes, productsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/inventory', { headers: authHeader() }),
        axios.get('http://localhost:8080/api/products', { headers: authHeader() })
      ]);
      
      const newInventory = Array.isArray(inventoryRes.data) ? inventoryRes.data : [];
      const newProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
      
      // If inventory already exists, update items individually to avoid reordering
      if (inventory.length > 0 && newInventory.length > 0) {
        const updatedInventory = [...inventory];
        
        // Update existing items without changing their order
        newInventory.forEach(newItem => {
          const existingIndex = updatedInventory.findIndex(item => item.id === newItem.id);
          if (existingIndex >= 0) {
            updatedInventory[existingIndex] = newItem;
          } else {
            // Add new items at the end
            updatedInventory.push(newItem);
          }
        });
        
        // Remove items that no longer exist
        const updatedItems = updatedInventory.filter(item => 
          newInventory.some(newItem => newItem.id === item.id)
        );
        
        setInventory(updatedItems);
      } else {
        // Initial load, just set the data
        setInventory(newInventory);
      }
      
      setProducts(newProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load data. Please try again later.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...inventory];
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.productName && item.productName.toLowerCase().includes(lowerSearchTerm)) || 
        (item.productSku && item.productSku.toLowerCase().includes(lowerSearchTerm)) ||
        (item.location && item.location.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Sort by ID to maintain consistent order
    result.sort((a, b) => a.id - b.id);
    
    setFilteredInventory(result);
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setCurrentInventory(item);
      setIsEditing(true);
    } else {
      setCurrentInventory({
        id: null,
        productId: '',
        productName: '',
        quantity: 0,
        reorderLevel: 0,
        reorderQuantity: 0,
        location: ''
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
    setCurrentInventory({
      ...currentInventory,
      [name]: name === 'quantity' || name === 'reorderLevel' || name === 'reorderQuantity' 
        ? parseInt(value) || 0 
        : value
    });
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    const selectedProduct = products.find(p => p.id === productId);
    setCurrentInventory({
      ...currentInventory,
      productId: productId,
      productName: selectedProduct ? selectedProduct.name : ''
    });
  };

  const handleSaveInventory = async () => {
    try {
      if (!currentInventory.productId) {
        setSnackbar({
          open: true,
          message: 'Please select a product',
          severity: 'error'
        });
        return;
      }

      let response;
      if (isEditing) {
        response = await axios.put(
          `http://localhost:8080/api/inventory/${currentInventory.id}`, 
          currentInventory,
          {
            headers: {
              ...authHeader(),
              'Content-Type': 'application/json'
            }
          }
        );
        setSnackbar({
          open: true,
          message: 'Inventory updated successfully!',
          severity: 'success'
        });
      } else {
        response = await axios.post(
          'http://localhost:8080/api/inventory', 
          currentInventory,
          {
            headers: {
              ...authHeader(),
              'Content-Type': 'application/json'
            }
          }
        );
        setSnackbar({
          open: true,
          message: 'Inventory added successfully!',
          severity: 'success'
        });
      }
      
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving inventory:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save inventory. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleUpdateQuantity = async (productId, change) => {
    try {
      // Don't set global loading state to avoid full table refresh
      // Instead, we could add individual loading states per row if needed
      
      // Create a local update to show immediate feedback
      const updatedInventory = inventory.map(item => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: Math.max(0, item.quantity + change)
          };
        }
        return item;
      });
      
      // Update the state immediately for responsive UI
      setInventory(updatedInventory);
      
      // Call the API
      await axios.put(
        `http://localhost:8080/api/inventory/update-quantity/${productId}`,
        { quantityChange: change },
        {
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Show success notification
      setSnackbar({
        open: true,
        message: `Quantity ${change > 0 ? 'increased' : 'decreased'} successfully!`,
        severity: 'success'
      });
      
      // Fetch the latest data in the background without full UI refresh
      const inventoryRes = await axios.get('http://localhost:8080/api/inventory', { 
        headers: authHeader() 
      });
      
      if (Array.isArray(inventoryRes.data)) {
        // Update inventory items individually to preserve order
        const newData = inventoryRes.data;
        const updatedItems = [...inventory];
        
        newData.forEach(newItem => {
          const existingIndex = updatedItems.findIndex(item => item.id === newItem.id);
          if (existingIndex >= 0) {
            updatedItems[existingIndex] = newItem;
          }
        });
        
        setInventory(updatedItems);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      
      // Revert the optimistic update on error
      await fetchData();
      
      // Show detailed error message if available
      const errorMessage = error.response?.data?.message || 'Failed to update quantity. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };
  
  const handleDeleteInventory = async () => {
    try {
      if (!currentInventory.id) {
        handleCloseDialog();
        return;
      }
      
      await axios.delete(
        `http://localhost:8080/api/inventory/${currentInventory.id}`,
        {
          headers: authHeader()
        }
      );
      
      setSnackbar({
        open: true,
        message: 'Inventory entry deleted successfully!',
        severity: 'success'
      });
      
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error deleting inventory:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete inventory. Please try again.',
        severity: 'error'
      });
    }
  };

  const isLowStock = (item) => {
    return item.quantity <= item.reorderLevel;
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Filter out products that already have inventory
  const getAvailableProducts = () => {
    const inventoryProductIds = inventory.map(item => item.productId);
    return products.filter(product => !inventoryProductIds.includes(product.id));
  };

  if (loading && inventory.length === 0) {
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
            Inventory Management
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
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
              onClick={() => handleOpenDialog()}
              disabled={getAvailableProducts().length === 0}
              sx={{ 
                backgroundColor: '#28a745',
                '&:hover': { backgroundColor: '#218838' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              Add Inventory
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by product name, SKU or location..."
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

        {/* Inventory Table */}
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
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>SKU</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#3a7bd5' }}>Quantity</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#3a7bd5' }}>Reorder Level</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>Location</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#3a7bd5' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#3a7bd5' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <TableRow 
                    key={item.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(58, 123, 213, 0.03)'
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
                            backgroundColor: isLowStock(item) ? 'rgba(231, 76, 60, 0.1)' : 'rgba(58, 123, 213, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2
                          }}
                        >
                          <InventoryIcon sx={{ color: isLowStock(item) ? '#e74c3c' : '#3a7bd5' }} />
                        </Box>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>{item.productName || 'Unknown Product'}</Typography>
                          {item.productCategoryName && (
                            <Typography variant="caption" color="text.secondary">{item.productCategoryName}</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{item.productSku || '-'}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleUpdateQuantity(item.productId, -1)}
                          disabled={item.quantity <= 0}
                          sx={{ 
                            border: '1px solid rgba(231, 76, 60, 0.3)',
                            mr: 1,
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            p: 0
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            minWidth: '40px',
                            textAlign: 'center',
                            color: isLowStock(item) ? '#e74c3c' : 'inherit'
                          }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleUpdateQuantity(item.productId, 1)}
                          sx={{ 
                            border: '1px solid rgba(58, 123, 213, 0.3)',
                            ml: 1,
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            p: 0
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="center">{item.reorderLevel}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ color: 'rgba(58, 123, 213, 0.6)', mr: 1, fontSize: '1rem' }} />
                        <Typography variant="body2">{item.location || 'Not specified'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {isLowStock(item) ? (
                        <Chip 
                          icon={<WarningIcon />} 
                          label="Low Stock" 
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            color: '#e74c3c',
                            fontWeight: 500,
                            '& .MuiChip-icon': {
                              color: '#e74c3c'
                            }
                          }}
                        />
                      ) : (
                        <Chip 
                          icon={<CheckCircleIcon />} 
                          label="In Stock" 
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            color: '#2ecc71',
                            fontWeight: 500,
                            '& .MuiChip-icon': {
                              color: '#2ecc71'
                            }
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(item)}
                          sx={{ 
                            color: '#3a7bd5',
                            '&:hover': {
                              backgroundColor: 'rgba(58, 123, 213, 0.1)'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No inventory items found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {searchTerm ? 'Try adjusting your search terms' : 'Add your first inventory item using the button above'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Inventory Dialog */}
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
            <Typography variant="h5" fontWeight={600} color="#3a7bd5">
              {isEditing ? 'Update Inventory' : 'Add New Inventory'}
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            {isEditing ? (
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 500 }}>
                Product: {currentInventory.productName}
              </Typography>
            ) : (
              <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
                <InputLabel id="product-select-label">Product</InputLabel>
                <Select
                  labelId="product-select-label"
                  name="productId"
                  value={currentInventory.productId || ''}
                  onChange={handleProductChange}
                  label="Product"
                  required
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="">
                    <em>Select a product</em>
                  </MenuItem>
                  {getAvailableProducts().map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="quantity"
                  label="Quantity"
                  type="number"
                  variant="outlined"
                  value={currentInventory.quantity}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ borderRadius: '8px' }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="reorderLevel"
                  label="Reorder Level"
                  type="number"
                  variant="outlined"
                  value={currentInventory.reorderLevel}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ borderRadius: '8px' }}
                  helperText="Alert when stock falls below this level"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="reorderQuantity"
                  label="Reorder Quantity"
                  type="number"
                  variant="outlined"
                  value={currentInventory.reorderQuantity}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ borderRadius: '8px' }}
                  helperText="Suggested quantity to purchase when reordering"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="location"
                  label="Storage Location"
                  type="text"
                  variant="outlined"
                  value={currentInventory.location || ''}
                  onChange={handleInputChange}
                  sx={{ borderRadius: '8px' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon sx={{ color: 'rgba(58, 123, 213, 0.6)' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Warehouse location, shelf number, etc."
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
            
            {isEditing && (
              <Button 
                onClick={handleDeleteInventory}
                variant="contained"
                color="error" 
                sx={{ 
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '8px',
                  mr: 1
                }}
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            )}
            
            <Button 
              onClick={handleSaveInventory} 
              variant="contained"
              sx={{ 
                backgroundColor: '#3a7bd5',
                '&:hover': { backgroundColor: '#2a6ac5' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              {isEditing ? 'Update' : 'Add'} Inventory
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

export default ModernInventoryList;