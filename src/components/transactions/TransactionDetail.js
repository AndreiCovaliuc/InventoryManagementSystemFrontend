import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip,
  Button,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer, 
  TableHead,
  TableRow,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  ShoppingCart as ProductIcon,
  LocalShipping as ShippingIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  ImportExport as TransactionIcon,
  Store as StoreIcon,
  Notes as NotesIcon,
  Person as PersonIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import authHeader from '../../services/AuthHeader';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        // First fetch the transaction details
        const response = await axios.get(`http://localhost:8080/api/transactions/${id}`, {
          headers: authHeader()
        });
        
        console.log('Transaction API response:', response.data);
        
        // Debugging the user information specifically
        console.log('User info in transaction:', {
          userName: response.data.userName,
          userId: response.data.userId,
          createdBy: response.data.createdBy,
          user: response.data.user
        });
        
        // If product details are missing, try to fetch them
        let transactionData = response.data;
        
        if (transactionData && transactionData.productId && (!transactionData.productName || !transactionData.productSku)) {
          try {
            const productResponse = await axios.get(`http://localhost:8080/api/products/${transactionData.productId}`, {
              headers: authHeader()
            });
            
            console.log('Product details:', productResponse.data);
            
            // Merge product details with transaction data
            transactionData = {
              ...transactionData,
              productName: productResponse.data.name,
              productSku: productResponse.data.sku,
              productCategoryName: productResponse.data.categoryName,
              productSupplierName: productResponse.data.supplierName
            };
          } catch (productErr) {
            console.error('Error fetching product details:', productErr);
          }
        }
        
        // If user details are missing, try to fetch the user name
        // First check if we have user info in createdBy
        if (transactionData && transactionData.createdBy && transactionData.createdBy.id) {
          console.log('Found user info in createdBy:', transactionData.createdBy);
          // We already have user info in createdBy, no need to fetch
        } 
        // Then check if we have a userId but no user details
        else if (transactionData && transactionData.userId && 
                !transactionData.userName && 
                !transactionData.createdBy?.name && 
                !transactionData.user?.name) {
          console.log('Attempting to fetch user with ID:', transactionData.userId);
          
          // Try different API endpoints that might provide user info
          try {
            // First try /api/admin/users/{id}
            const userResponse = await axios.get(`http://localhost:8080/api/admin/users/${transactionData.userId}`, {
              headers: authHeader()
            });
            
            console.log('User details from admin API:', userResponse.data);
            
            // Add user name to transaction data
            transactionData = {
              ...transactionData,
              userName: userResponse.data.name || userResponse.data.username || userResponse.data.email
            };
          } catch (adminUserErr) {
            console.log('Admin user API failed, trying regular users endpoint');
            
            // If admin endpoint fails, try /api/users/{id}
            try {
              const regularUserResponse = await axios.get(`http://localhost:8080/api/users/${transactionData.userId}`, {
                headers: authHeader()
              });
              
              console.log('User details from regular API:', regularUserResponse.data);
              
              // Add user name to transaction data
              transactionData = {
                ...transactionData,
                userName: regularUserResponse.data.name || regularUserResponse.data.username || regularUserResponse.data.email
              };
            } catch (userErr) {
              console.error('All attempts to fetch user details failed:', userErr);
            }
          }
        }
        
        setTransaction(transactionData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        setError('Failed to load transaction details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTransaction();
  }, [id]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };
  
  const getTransactionTypeChip = (type) => {
    if (!type) return null;
    
    let color, icon, label;
    
    switch(type) {
      case 'PURCHASE':
        color = '#3498db';
        icon = <ShippingIcon fontSize="small" />;
        label = 'Purchase';
        break;
      case 'SALE':
        color = '#2ecc71';
        icon = <MoneyIcon fontSize="small" />;
        label = 'Sale';
        break;
      case 'RETURN':
        color = '#e74c3c';
        icon = <TransactionIcon fontSize="small" />;
        label = 'Return';
        break;
      case 'ADJUSTMENT':
        color = '#f39c12';
        icon = <TransactionIcon fontSize="small" />;
        label = 'Adjustment';
        break;
      case 'TRANSFER':
        color = '#9b59b6';
        icon = <TransactionIcon fontSize="small" />;
        label = 'Transfer';
        break;
      default:
        color = '#95a5a6';
        icon = <TransactionIcon fontSize="small" />;
        label = type || 'Unknown';
    }
    
    return (
      <Chip 
        icon={icon}
        label={label} 
        sx={{ 
          backgroundColor: `${color}20`,
          color: color,
          fontWeight: 500,
          fontSize: '0.95rem',
          px: 1,
          py: 2.5,
          '& .MuiChip-icon': { color }
        }}
      />
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            borderRadius: '12px',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/transactions"
            sx={{ mt: 2 }}
          >
            Back to Transactions
          </Button>
        </Paper>
      </Box>
    );
  }
  
  if (!transaction) {
    return (
      <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            borderRadius: '12px',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" gutterBottom>
            Transaction not found
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/transactions"
            sx={{ mt: 2 }}
          >
            Back to Transactions
          </Button>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }} className="invoice-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            backgroundImage: 'linear-gradient(45deg, #f39c12, #e67e22)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          Transaction Invoice
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/transactions')}
            sx={{ 
              mr: 2,
              borderColor: '#6c757d',
              color: '#6c757d',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px'
            }}
            className="no-print"
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ 
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px',
              backgroundColor: '#3498db',
              '&:hover': { backgroundColor: '#2980b9' }
            }}
            className="no-print"
          >
            Print
          </Button>
        </Box>
      </Box>
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          borderRadius: '12px',
          mb: 3
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
              Transaction #{transaction.id || '-'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon sx={{ color: '#7f8c8d', mr: 1, fontSize: '0.9rem' }} />
              <Typography variant="body2" color="text.secondary">
                Date: {formatDate(transaction.transactionDate)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ color: '#7f8c8d', mr: 1, fontSize: '0.9rem' }} />
              <Typography variant="body2" color="text.secondary">
                Created by: {transaction.userName || 
                            (transaction.createdBy && transaction.createdBy.name) || 
                            (transaction.user && transaction.user.name) ||
                            (transaction.createdBy && transaction.createdBy.username) ||
                            (transaction.user && transaction.user.username) ||
                            (transaction.userId ? `User ID: ${transaction.userId}` : 'Unknown')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            {getTransactionTypeChip(transaction.transactionType)}
            {transaction.referenceNumber && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Ref: {transaction.referenceNumber}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Product Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Product Information
          </Typography>
          
          <TableContainer component={Paper} elevation={1} sx={{ mb: 4, borderRadius: '8px' }}>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '8px',
                          backgroundColor: 'rgba(52, 152, 219, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <ProductIcon sx={{ color: '#3498db' }} />
                      </Box>
                      <Typography fontWeight={500}>
                        {transaction.productName || 
                         (transaction.product && transaction.product.name) || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {transaction.productSku || 
                     (transaction.product && transaction.product.sku) || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={<CategoryIcon />}
                      label={
                        transaction.productCategoryName || 
                        (transaction.product && transaction.product.categoryName) || 
                        (transaction.product && transaction.product.category && transaction.product.category.name) || 
                        'Not categorized'
                      }
                      sx={{ 
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        color: '#2ecc71',
                        '& .MuiChip-icon': { color: '#2ecc71' }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={<ShippingIcon />}
                      label={
                        transaction.productSupplierName || 
                        (transaction.product && transaction.product.supplierName) || 
                        (transaction.product && transaction.product.supplier && transaction.product.supplier.name) || 
                        'Not specified'
                      }
                      sx={{ 
                        backgroundColor: 'rgba(155, 89, 182, 0.1)',
                        color: '#9b59b6',
                        '& .MuiChip-icon': { color: '#9b59b6' }
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        
        {/* Transaction Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Transaction Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card elevation={1} sx={{ borderRadius: '8px', height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      color: transaction.transactionType === 'SALE' ? '#e74c3c' : '#2ecc71',
                      mt: 1
                    }}
                  >
                    {transaction.transactionType === 'SALE' ? '-' : '+'}{Math.abs(transaction.quantity || 0)} units
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={1} sx={{ borderRadius: '8px', height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Unit Price
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
                    {formatCurrency(transaction.unitPrice)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={1} sx={{ borderRadius: '8px', height: '100%', backgroundColor: 'rgba(52, 152, 219, 0.05)' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
                    {formatCurrency(transaction.totalAmount)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {/* Notes section */}
        {transaction.notes && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Notes
            </Typography>
            
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }}
            >
              <Box sx={{ display: 'flex' }}>
                <NotesIcon sx={{ color: '#7f8c8d', mr: 2, mt: 0.5 }} />
                <Typography>
                  {transaction.notes}
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
        
        {/* Footer */}
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Transaction ID: {transaction.id}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              This document serves as an official record of the transaction.
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Add print styles */}
      <style jsx="true">{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .invoice-container {
            padding: 0 !important;
            background-color: white !important;
          }
          
          @page {
            size: auto;
            margin: 20mm;
          }
        }
      `}</style>
    </Box>
  );
};

export default TransactionDetail;