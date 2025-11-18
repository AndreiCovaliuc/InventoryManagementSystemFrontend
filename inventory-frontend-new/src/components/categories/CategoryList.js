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
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Avatar,
  Grow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  ShoppingBag as ShoppingBagIcon,
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

const ModernCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    id: null,
    name: '',
    description: '',
    productCount: 0
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      applyFilters();
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/categories', {
        headers: authHeader()
      });
      
      setCategories(Array.isArray(response.data) ? response.data : []);
      setFilteredCategories(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load categories. Please try again later.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...categories];
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(category => 
        (category.name && category.name.toLowerCase().includes(lowerSearchTerm)) || 
        (category.description && category.description.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    setFilteredCategories(result);
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setCurrentCategory({
        ...category
      });
      setIsEditing(true);
    } else {
      setCurrentCategory({
        id: null,
        name: '',
        description: '',
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
    setCurrentCategory({
      ...currentCategory,
      [name]: value
    });
  };

  const handleSaveCategory = async () => {
    try {
      // Validate inputs
      if (!currentCategory.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Category name is required',
          severity: 'error'
        });
        return;
      }

      let response;
      if (isEditing) {
        response = await axios.put(
          `http://localhost:8080/api/categories/${currentCategory.id}`, 
          currentCategory,
          {
            headers: {
              ...authHeader(),
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Update categories array with edited category
        setCategories(categories.map(c => c.id === currentCategory.id ? response.data : c));
        
        setSnackbar({
          open: true,
          message: 'Category updated successfully!',
          severity: 'success'
        });
      } else {
        response = await axios.post(
          'http://localhost:8080/api/categories', 
          currentCategory,
          {
            headers: {
              ...authHeader(),
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Add new category to categories array
        setCategories([...categories, response.data]);
        
        setSnackbar({
          open: true,
          message: 'Category added successfully!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save category. Please try again.',
        severity: 'error'
      });
    }
  };

  const openDeleteConfirm = (category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/categories/${categoryToDelete.id}`, {
        headers: authHeader()
      });
      
      // Remove deleted category from categories array
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      
      setSnackbar({
        open: true,
        message: 'Category deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete category. It may be referenced by products.',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading && categories.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Helper function to generate random background colors for categories
  const getCategoryColor = (index) => {
    const colors = [
      'linear-gradient(45deg, #3a7bd5, #00d2ff)',
      'linear-gradient(45deg, #11998e, #38ef7d)',
      'linear-gradient(45deg, #834d9b, #d04ed6)',
      'linear-gradient(45deg, #fc4a1a, #f7b733)',
      'linear-gradient(45deg, #4b6cb7, #182848)',
      'linear-gradient(45deg, #24c6dc, #514a9d)',
      'linear-gradient(45deg, #ff512f, #dd2476)'
    ];
    return colors[index % colors.length];
  };

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
            Product Categories
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchCategories}
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
              color="primary" 
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
              Add Category
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search categories by name or description"
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

        {/* Category Cards Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
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
                        background: getCategoryColor(index),
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px'
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              background: getCategoryColor(index),
                              mr: 2
                            }}
                          >
                            <CategoryIcon />
                          </Avatar>
                          <Typography 
                            variant="h6" 
                            component="div" 
                            fontWeight={600}
                            sx={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            {category.name}
                          </Typography>
                        </Box>
                        <Chip 
                          icon={<ShoppingBagIcon sx={{ fontSize: '1rem !important' }} />}
                          label={`${category.productCount} products`} 
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(58, 123, 213, 0.1)',
                            color: '#3a7bd5',
                            fontWeight: 500,
                            '& .MuiChip-icon': { color: '#3a7bd5' }
                          }}
                        />
                      </Box>
                      {category.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 2,
                            minHeight: '40px',
                          }}
                        >
                          {category.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(category);
                            }}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteConfirm(category);
                              }}
                              disabled={category.productCount > 0}
                              sx={{ 
                                backgroundColor: category.productCount > 0 ? 'rgba(200, 200, 200, 0.1)' : 'rgba(231, 76, 60, 0.1)',
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
                  <CategoryIcon sx={{ fontSize: 60, color: '#aaa', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No categories found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? 'Try adjusting your search terms' : 'Add your first category using the button above'}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* Add/Edit Category Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
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
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              name="name"
              label="Category Name"
              fullWidth
              value={currentCategory.name}
              onChange={handleInputChange}
              required
              autoFocus
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon sx={{ color: 'rgba(58, 123, 213, 0.6)' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              value={currentCategory.description || ''}
              onChange={handleInputChange}
              multiline
              rows={4}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
              placeholder="Enter a description for this category (optional)"
            />
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
              onClick={handleSaveCategory} 
              variant="contained"
              sx={{ 
                backgroundColor: '#3a7bd5',
                '&:hover': { backgroundColor: '#2a6ac5' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              {isEditing ? 'Update' : 'Add'} Category
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
              Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
            </Typography>
            {categoryToDelete && categoryToDelete.productCount > 0 && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mt: 2,
                  borderRadius: '8px'
                }}
              >
                This category has {categoryToDelete.productCount} products assigned to it. 
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
              onClick={handleDeleteCategory} 
              variant="contained" 
              color="error"
              disabled={categoryToDelete && categoryToDelete.productCount > 0}
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

export default ModernCategoryList;