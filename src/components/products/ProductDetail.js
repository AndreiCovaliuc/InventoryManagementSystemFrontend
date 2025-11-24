// src/components/products/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Paper, 
  Typography, 
  Button, 
  Grid, 
  Box, 
  Divider, 
  CircularProgress 
} from '@mui/material';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button component={Link} to="/products" sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Paper>
    );
  }

  if (!product) {
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography>Product not found</Typography>
        <Button component={Link} to="/products" sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          {product.name}
        </Typography>
        <Button variant="contained" component={Link} to={`/products/edit/${product.id}`}>
          Edit Product
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">SKU:</Typography>
          <Typography gutterBottom>{product.sku || 'Not specified'}</Typography>
          
          <Typography variant="subtitle1" fontWeight="bold" mt={2}>Price:</Typography>
          <Typography gutterBottom>${product.price?.toFixed(2) || '0.00'}</Typography>
          
          <Typography variant="subtitle1" fontWeight="bold" mt={2}>Category:</Typography>
          <Typography gutterBottom>{product.category?.name || 'Not categorized'}</Typography>
          
          <Typography variant="subtitle1" fontWeight="bold" mt={2}>Supplier:</Typography>
          <Typography gutterBottom>{product.supplier?.name || 'Not specified'}</Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">Description:</Typography>
          <Typography gutterBottom>{product.description || 'No description provided'}</Typography>
        </Grid>
      </Grid>
      
      <Box mt={4}>
        <Button component={Link} to="/products" sx={{ mr: 2 }}>
          Back to Products
        </Button>
      </Box>
    </Paper>
  );
};

export default ProductDetail;