import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [product, setProduct] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    category: null,
    supplier: null
  });

  const isEditMode = !!id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories and suppliers
        const categoriesRes = await axios.get('http://localhost:8080/api/categories');
        const suppliersRes = await axios.get('http://localhost:8080/api/suppliers');
        
        setCategories(categoriesRes.data);
        setSuppliers(suppliersRes.data);
        
        // If in edit mode, fetch the product details
        if (isEditMode) {
          const productRes = await axios.get(`http://localhost:8080/api/products/${id}`);
          setProduct(productRes.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: value
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      const selectedCategory = categories.find(cat => cat.id === value);
      setProduct(prevProduct => ({
        ...prevProduct,
        category: selectedCategory
      }));
    } else if (name === 'supplier') {
      const selectedSupplier = suppliers.find(sup => sup.id === value);
      setProduct(prevProduct => ({
        ...prevProduct,
        supplier: selectedSupplier
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/products/${id}`, product);
      } else {
        await axios.post('http://localhost:8080/api/products', product);
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="name"
              label="Product Name"
              value={product.name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="sku"
              label="SKU"
              value={product.sku || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              value={product.description || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              name="price"
              label="Price"
              type="number"
              value={product.price || ''}
              onChange={handleChange}
              fullWidth
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={product.category?.id || ''}
                onChange={handleSelectChange}
                label="Category"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Supplier</InputLabel>
              <Select
                name="supplier"
                value={product.supplier?.id || ''}
                onChange={handleSelectChange}
                label="Supplier"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {suppliers.map(supplier => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              sx={{ mr: 2 }}
            >
              {isEditMode ? 'Update' : 'Create'} Product
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/products')}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProductForm;