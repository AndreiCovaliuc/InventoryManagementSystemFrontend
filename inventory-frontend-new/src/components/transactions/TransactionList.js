import React, { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
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
  Refresh as RefreshIcon,
  ShoppingCart as ProductIcon,
  CalendarToday as CalendarIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  ImportExport as TransactionIcon
} from '@mui/icons-material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Link, useNavigate } from 'react-router-dom';
import TransactionService from '../../services/TransactionService';
import format from 'date-fns/format';

// Get auth header function
function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { 'Authorization': 'Bearer ' + user.token };
  } else {
    return {};
  }
}

const TransactionList = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [dateRange, setDateRange] = useState('all');
  const [filters, setFilters] = useState({
    type: '',
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      applyFilters();
    }
  }, [searchTerm, filters, transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await TransactionService.getAllTransactions();
      setTransactions(Array.isArray(response.data) ? response.data : []);
      setFilteredTransactions(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load transactions. Please try again later.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...transactions];
    
    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(transaction => 
        (transaction.productName && transaction.productName.toLowerCase().includes(lowerSearchTerm)) || 
        (transaction.notes && transaction.notes.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply transaction type filter
    if (filters.type) {
      result = result.filter(transaction => transaction.transactionType === filters.type);
    }
    
    // Apply date range filters
    if (filters.startDate) {
      result = result.filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate);
        return transactionDate >= filters.startDate;
      });
    }
    
    if (filters.endDate) {
      result = result.filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate);
        return transactionDate <= filters.endDate;
      });
    }
    
    setFilteredTransactions(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    
    const now = new Date();
    let startDate = null;
    let endDate = new Date();
    
    switch(range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        // 'all' - no filtering
        startDate = null;
        endDate = null;
    }
    
    setFilters(prev => ({
      ...prev,
      startDate,
      endDate
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange('all');
    setFilters({
      type: '',
      startDate: null,
      endDate: null
    });
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await TransactionService.deleteTransaction(id);
      setSnackbar({
        open: true,
        message: 'Transaction deleted successfully!',
        severity: 'success'
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete transaction. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const getTransactionTypeChip = (type) => {
    let color, icon, label;
    
    switch(type) {
      case 'PURCHASE':
        color = '#3498db';
        icon = <ShippingIcon fontSize="small" />;
        label = 'Purchase';
        break;
      case 'SALE':
        color = '#e74c3c';
        icon = <MoneyIcon fontSize="small" />;
        label = 'Sale';
        break;
      case 'RETURN':
        color = '#2ecc71';
        icon = <TransactionIcon fontSize="small" />;
        label = 'Return';
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
        size="small"
        sx={{ 
          backgroundColor: `${color}20`,
          color: color,
          fontWeight: 500,
          '& .MuiChip-icon': { color }
        }}
      />
    );
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  if (loading && transactions.length === 0) {
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
            Transactions
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchTransactions}
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
              component={Link}
              to="/transactions/new"
              sx={{ 
                backgroundColor: '#28a745',
                '&:hover': { backgroundColor: '#218838' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              New Transaction
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search transactions..."
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
              <FormControl fullWidth>
                <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  label="Transaction Type"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="PURCHASE">Purchase</MenuItem>
                  <MenuItem value="SALE">Sale</MenuItem>
                  <MenuItem value="RETURN">Return</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel id="date-filter-label">Date Range</InputLabel>
                <Select
                  labelId="date-filter-label"
                  name="dateRange"
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  label="Date Range"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={clearFilters}
                disabled={!searchTerm && !filters.type && !filters.startDate && !filters.endDate}
                sx={{ 
                  borderColor: '#3a7bd5',
                  color: '#3a7bd5',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '8px',
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

        {/* Transactions Table */}
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
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#3a7bd5' }}>Quantity</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#3a7bd5' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#3a7bd5' }}>Notes</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#3a7bd5' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(58, 123, 213, 0.03)'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon sx={{ color: '#3a7bd5', mr: 1, fontSize: '1.1rem' }} />
                        <Typography variant="body2">
                          {formatDate(transaction.transactionDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '6px',
                            backgroundColor: 'rgba(52, 152, 219, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1.5
                          }}
                        >
                          <ProductIcon sx={{ color: '#3498db', fontSize: '1.1rem' }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {transaction.productName || 'Unknown Product'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getTransactionTypeChip(transaction.transactionType)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: transaction.transactionType === 'SALE' ? '#e74c3c' : '#2ecc71'
                        }}
                      >
                        {transaction.transactionType === 'SALE' ? 
                          `-${Math.abs(transaction.quantity)}` : 
                          `+${Math.abs(transaction.quantity)}`
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(transaction.unitPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {transaction.notes || '-'}
                      </Typography>
                    </TableCell>
    
                    <TableCell align="center">
                      <Box>
                        <Tooltip title="View Invoice">
                          <IconButton 
                            size="small" 
                            color="info" 
                            component={Link}
                            to={`/transactions/${transaction.id}`}
                            sx={{ 
                              mx: 0.5,
                              color: '#3498db',
                              '&:hover': {
                                backgroundColor: 'rgba(52, 152, 219, 0.1)'
                              }
                            }}
                          >
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            component={Link}
                            to={`/transactions/${transaction.id}/edit`}
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
                            onClick={() => handleDeleteTransaction(transaction.id)}
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
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <TransactionIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No transactions found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                        {searchTerm || filters.type || filters.startDate || filters.endDate ? 
                          'Try adjusting your filters or search criteria' : 
                          'Add your first transaction using the button above'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

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

export default TransactionList;