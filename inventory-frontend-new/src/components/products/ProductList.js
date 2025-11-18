import React, { useState, useEffect, useCallback } from 'react';
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
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
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
  Search as SearchIcon,
  Category as CategoryIcon,
  LocalShipping as SupplierIcon,
  ShoppingCart as ProductIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  FilterList as FilterListIcon
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

const ModernProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: '',
    description: '',
    sku: '',
    price: '',
    categoryId: null,
    categoryName: '',
    supplierId: null,
    supplierName: ''
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoryId: '',
    supplierId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      applyFilters();
    }
  }, [searchTerm, filters, products]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
        axios.get('http://localhost:8080/api/products', { headers: authHeader() }),
        axios.get('http://localhost:8080/api/categories', { headers: authHeader() }),
        axios.get('http://localhost:8080/api/suppliers', { headers: authHeader() })
      ]);
      
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setFilteredProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : []);
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
    let result = [...products];
    
    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(product => 
        (product.name && product.name.toLowerCase().includes(lowerSearchTerm)) || 
        (product.sku && product.sku.toLowerCase().includes(lowerSearchTerm)) ||
        (product.description && product.description.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply category filter
    if (filters.categoryId) {
      result = result.filter(product => product.categoryId === filters.categoryId);
    }
    
    // Apply supplier filter
    if (filters.supplierId) {
      result = result.filter(product => product.supplierId === filters.supplierId);
    }
    
    setFilteredProducts(result);
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setCurrentProduct({
        ...product,
        price: product.price ? product.price.toString() : ''
      });
      setIsEditing(true);
    } else {
      setCurrentProduct({
        id: null,
        name: '',
        description: '',
        sku: '',
        price: '',
        categoryId: null,
        categoryName: '',
        supplierId: null,
        supplierName: ''
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
    
    if (name === 'price') {
      // Allow only numbers and decimal point for price
      if (/^\d*\.?\d*$/.test(value) || value === '') {
        setCurrentProduct({
          ...currentProduct,
          [name]: value
        });
      }
    } else {
      setCurrentProduct({
        ...currentProduct,
        [name]: value
      });
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'categoryId') {
      const selectedCategory = categories.find(cat => cat.id === value);
      setCurrentProduct({
        ...currentProduct,
        categoryId: value,
        categoryName: selectedCategory ? selectedCategory.name : ''
      });
    } else if (name === 'supplierId') {
      const selectedSupplier = suppliers.find(sup => sup.id === value);
      setCurrentProduct({
        ...currentProduct,
        supplierId: value,
        supplierName: selectedSupplier ? selectedSupplier.name : ''
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSaveProduct = async () => {
    try {
      // Validate inputs
      if (!currentProduct.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Product name is required',
          severity: 'error'
        });
        return;
      }
      
      // Validate SKU
      if (!currentProduct.sku || !currentProduct.sku.trim()) {
        setSnackbar({
          open: true,
          message: 'SKU is required',
          severity: 'error'
        });
        return;
      }
      
      // Convert price to number
      const productToSave = {
        ...currentProduct,
        price: currentProduct.price ? parseFloat(currentProduct.price) : null
      };
  
      let response;
      if (isEditing) {
        response = await axios.put(
          `http://localhost:8080/api/products/${currentProduct.id}`, 
          productToSave,
          {
            headers: {
              ...authHeader(),
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Update products array with edited product
        setProducts(products.map(p => p.id === currentProduct.id ? response.data : p));
        
        setSnackbar({
          open: true,
          message: 'Product updated successfully!',
          severity: 'success'
        });
      } else {
        response = await axios.post(
          'http://localhost:8080/api/products', 
          productToSave,
          {
            headers: {
              ...authHeader(),
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Add new product to products array
        setProducts([...products, response.data]);
        
        setSnackbar({
          open: true,
          message: 'Product added successfully!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save product. Please try again.',
        severity: 'error'
      });
    }
  };

  const openDeleteConfirm = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/products/${productToDelete.id}`, {
        headers: authHeader()
      });
      
      // Remove deleted product from products array
      setProducts(products.filter(p => p.id !== productToDelete.id));
      
      setSnackbar({
        open: true,
        message: 'Product deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete product. It may be referenced by inventory or transactions.',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      categoryId: '',
      supplierId: ''
    });
  };

  if (loading && products.length === 0) {
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
            Products
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
              sx={{ 
                backgroundColor: '#28a745',
                '&:hover': { backgroundColor: '#218838' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search products by name, SKU or description"
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
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-filter-label">Filter by Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  label="Filter by Category"
                  sx={{
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ddd',
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  {Array.isArray(categories) && categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="supplier-filter-label">Filter by Supplier</InputLabel>
                <Select
                  labelId="supplier-filter-label"
                  name="supplierId"
                  value={filters.supplierId}
                  onChange={handleFilterChange}
                  label="Filter by Supplier"
                  sx={{
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ddd',
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Suppliers</em>
                  </MenuItem>
                  {Array.isArray(suppliers) && suppliers.map(supplier => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <Button 
                variant="outlined" 
                startIcon={<FilterListIcon />}
                onClick={clearFilters}
                disabled={!searchTerm && !filters.categoryId && !filters.supplierId}
                sx={{ 
                  borderRadius: '8px',
                  borderColor: '#3a7bd5',
                  color: '#3a7bd5',
                  '&:hover': {
                    borderColor: '#2a6ac5',
                    backgroundColor: 'rgba(58, 123, 213, 0.04)'
                  }
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Products Table */}
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
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>Supplier</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#3a7bd5' }}>Price</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#3a7bd5' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id}
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
                            backgroundColor: 'rgba(58, 123, 213, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2
                          }}
                        >
                          <ProductIcon sx={{ color: '#3a7bd5' }} />
                        </Box>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>{product.name}</Typography>
                          {product.description && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                display: 'block',
                                maxWidth: '300px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {product.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.sku || '-'} 
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderColor: '#aaa',
                          fontFamily: 'monospace'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {product.categoryName ? (
                        <Chip 
                          icon={<CategoryIcon fontSize="small" />}
                          label={product.categoryName} 
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            color: '#2ecc71',
                            fontWeight: 500,
                            '& .MuiChip-icon': { color: '#2ecc71' }
                          }}
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {product.supplierName ? (
                        <Chip 
                          icon={<SupplierIcon fontSize="small" />}
                          label={product.supplierName} 
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(155, 89, 182, 0.1)',
                            color: '#9b59b6',
                            fontWeight: 500,
                            '& .MuiChip-icon': { color: '#9b59b6' }
                          }}
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        icon={<MoneyIcon fontSize="small" />}
                        label={product.price ? `$${parseFloat(product.price).toFixed(2)}` : '-'} 
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(52, 152, 219, 0.1)',
                          color: '#3498db',
                          fontWeight: 500,
                          '& .MuiChip-icon': { color: '#3498db' }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(product)}
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
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDeleteConfirm(product)}
                            sx={{ 
                              mx: 0.5,
                              '&:hover': {
                                backgroundColor: 'rgba(231, 76, 60, 0.1)'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No products found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {searchTerm || filters.categoryId || filters.supplierId 
                        ? 'Try adjusting your search or filters' 
                        : 'Add your first product using the button above'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Product Dialog */}
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
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Product Name"
                  fullWidth
                  value={currentProduct.name}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="sku"
                  label="SKU"
                  fullWidth
                  value={currentProduct.sku || ''}
                  onChange={handleInputChange}
                  required
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  helperText="Unique product identifier"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  value={currentProduct.description || ''}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  name="price"
                  label="Price"
                  fullWidth
                  value={currentProduct.price || ''}
                  onChange={handleInputChange}
                  required
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    name="categoryId"
                    value={currentProduct.categoryId || ''}
                    onChange={handleSelectChange}
                    label="Category"
                    sx={{ 
                      borderRadius: '8px',
                    }}
                  >
                    <MenuItem value="">
                      <em>Select Category</em>
                    </MenuItem>
                    {Array.isArray(categories) && categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel id="supplier-select-label">Supplier</InputLabel>
                  <Select
                    labelId="supplier-select-label"
                    name="supplierId"
                    value={currentProduct.supplierId || ''}
                    onChange={handleSelectChange}
                    label="Supplier"
                    sx={{ 
                      borderRadius: '8px',
                    }}
                  >
                    <MenuItem value="">
                      <em>Select Supplier</em>
                    </MenuItem>
                    {Array.isArray(suppliers) && suppliers.map(supplier => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
              onClick={handleSaveProduct} 
              variant="contained"
              sx={{ 
                backgroundColor: '#3a7bd5',
                '&:hover': { backgroundColor: '#2a6ac5' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              {isEditing ? 'Update' : 'Add'} Product
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
              Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
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
              onClick={handleDeleteProduct} 
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

export default ModernProductList;