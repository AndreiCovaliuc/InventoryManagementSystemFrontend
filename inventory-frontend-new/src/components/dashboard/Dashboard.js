import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Divider, 
  Card, 
  CardContent, 
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Container,
  Grow
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  LocalShipping as SupplierIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  LocationOn as LocationIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Brush } from 'recharts';
import axios from 'axios';
import authHeader from '../../services/AuthHeader';

const ResponsiveDashboard = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [hasPreviousStats, setHasPreviousStats] = useState(false);
  
  const [stats, setStats] = useState({
    productCount: 0,
    previousProductCount: null,
    categoryCount: 0,
    previousCategoryCount: null,
    supplierCount: 0,
    previousSupplierCount: null,
    lowStockCount: 0,
    previousLowStockCount: null,
    lowStockItems: [],
    totalQuantity: 0,
    previousTotalQuantity: null
  });
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  useEffect(() => {
    fetchData();
    fetchHistoryData();

    const refreshInterval = setInterval(() => {
      fetchData();
      fetchHistoryData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);


  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [
        productsRes, 
        categoriesRes, 
        suppliersRes, 
        inventoryRes
      ] = await Promise.all([
        axios.get('http://localhost:8080/api/products', { headers: authHeader() }),
        axios.get('http://localhost:8080/api/categories', { headers: authHeader() }),
        axios.get('http://localhost:8080/api/suppliers', { headers: authHeader() }),
        axios.get('http://localhost:8080/api/inventory', { headers: authHeader() })
      ]);
      
      let lowStockItems = [];
      try {
        const lowStockItemsRes = await axios.get('http://localhost:8080/api/inventory/low-stock', { headers: authHeader() });
        lowStockItems = Array.isArray(lowStockItemsRes.data) ? lowStockItemsRes.data : [];
      } catch (err) {
        console.error('Error fetching low stock items:', err);
      }
      
      const allInventory = Array.isArray(inventoryRes.data) ? inventoryRes.data : [];
      const totalQuantity = allInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);

      // Fetch previous stats from backend
      let previousStats = null;
      try {
        const previousStatsRes = await axios.get('http://localhost:8080/api/stats/previous', { headers: authHeader() });
        if (previousStatsRes.status === 200 && previousStatsRes.data) {
          previousStats = previousStatsRes.data;
          setHasPreviousStats(true);
        } else {
          setHasPreviousStats(false);
        }
      } catch (err) {
        console.log('Previous stats not available:', err.response?.status === 204 ? 'No data yet' : err.message);
        setHasPreviousStats(false);
      }

      setStats({
        productCount: Array.isArray(productsRes.data) ? productsRes.data.length : 0,
        previousProductCount: previousStats?.totalProducts ?? null,
        categoryCount: Array.isArray(categoriesRes.data) ? categoriesRes.data.length : 0,
        previousCategoryCount: previousStats?.totalCategories ?? null,
        supplierCount: Array.isArray(suppliersRes.data) ? suppliersRes.data.length : 0,
        previousSupplierCount: previousStats?.totalSuppliers ?? null,
        lowStockCount: lowStockItems.length,
        previousLowStockCount: previousStats?.lowStockItems ?? null,
        lowStockItems: lowStockItems,
        totalQuantity: totalQuantity,
        previousTotalQuantity: previousStats?.totalInventoryQuantity ?? null
      });

      const products = Array.isArray(productsRes.data) ? productsRes.data : [];
      const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

      const categoryProductCounts = {};
      categories.forEach(category => {
        categoryProductCounts[category.id] = {
          name: category.name,
          value: 0
        };
      });

      products.forEach(product => {
        if (product.categoryId && categoryProductCounts[product.categoryId]) {
          categoryProductCounts[product.categoryId].value += 1;
        }
      });

      const categoryData = Object.values(categoryProductCounts)
        .filter(category => category.value > 0)
        .sort((a, b) => b.value - a.value);
      
      if (categoryData.length === 0 && products.length > 0) {
        categoryData.push({ name: 'Uncategorized', value: products.length });
      }

      setProductsByCategory(categoryData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const limitDataPoints = (data) => {
    if (!data || data.length <= 6) return data;
    
    const result = [data[0]];
    const step = Math.ceil((data.length - 2) / 4);
    for (let i = step; i < data.length - 1; i += step) {
      result.push(data[i]);
    }
    result.push(data[data.length - 1]);
    
    return result;
  };

  const fetchHistoryData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/inventory-history/recent', {
        headers: authHeader()
      });

      console.log('Inventory history response:', response.data);
      console.log('Is array:', Array.isArray(response.data));
      console.log('Length:', response.data?.length);

      if (Array.isArray(response.data) && response.data.length > 0) {
        const formattedHistory = response.data.map(item => ({
          timestamp: new Date(item.timestamp),
          label: formatDateLabel(item.timestamp),
          totalQuantity: item.totalQuantity,
          change: item.quantityChange || 0
        }));

        formattedHistory.sort((a, b) => a.timestamp - b.timestamp);

        console.log('Processed history data:', formattedHistory);
        setInventoryHistory(formattedHistory);
      } else {
        console.log('No inventory history data received');
        setInventoryHistory([]);
      }
    } catch (error) {
      console.error('Error fetching inventory history:', error);
      console.error('Error details:', error.response?.data || error.message);
      setInventoryHistory([]);
    }
  };

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const timeStr = `${formattedHours}:${formattedMinutes}${ampm}`;
    
    if (!isXs && !isSm) {
      const currentYear = new Date().getFullYear();
      const labelYear = date.getFullYear();
      
      if (labelYear !== currentYear) {
        return `${month} ${day}, ${labelYear.toString().substr(2)} ${timeStr}`;
      }
      
      return `${month} ${day} ${timeStr}`;
    }
    
    return isXs ? `${month}${day} ${formattedHours}${ampm}` : `${month} ${day} ${formattedHours}${ampm}`;
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      const response = await axios.get('http://localhost:8080/api/export/excel', {
        headers: {
          ...authHeader(),
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const date = new Date();
      const filename = `inventory_export_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.xlsx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExporting(false);
    }
  };

  const calculateGrowth = (current, previous) => {
    if (previous === null || previous === undefined) {
      return { percentage: null, positive: true, hasData: false };
    }
    
    if (previous === 0 && current === 0) {
      return { percentage: 0, positive: true, hasData: true };
    }
    
    if (previous === 0) {
      return { percentage: current > 0 ? 100 : 0, positive: true, hasData: true };
    }
    
    const change = current - previous;
    const percentage = Math.abs(Math.round((change / previous) * 100));
    
    const isLowStockMetric = current === stats.lowStockCount && previous === stats.previousLowStockCount;
    const positive = isLowStockMetric ? change <= 0 : change >= 0;
    
    return {
      percentage: percentage || 0,
      positive: positive,
      hasData: true
    };
  };

  if (loading && Object.values(stats).every(val => val === 0 || val === null || (Array.isArray(val) && val.length === 0))) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const productGrowth = calculateGrowth(stats.productCount, stats.previousProductCount);
  const categoryGrowth = calculateGrowth(stats.categoryCount, stats.previousCategoryCount);
  const supplierGrowth = calculateGrowth(stats.supplierCount, stats.previousSupplierCount);
  const lowStockGrowth = calculateGrowth(stats.lowStockCount, stats.previousLowStockCount);
  const totalQuantityGrowth = calculateGrowth(stats.totalQuantity, stats.previousTotalQuantity);

  const getPieChartSize = () => {
    if (isXs) return { innerRadius: 40, outerRadius: 60 };
    if (isSm) return { innerRadius: 50, outerRadius: 70 };
    return { innerRadius: 60, outerRadius: 90 };
  };

  return (
    <Grow in={true} timeout={500}>
      <Box 
        sx={{ 
          padding: { xs: 1, sm: 2, md: 3 },
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          maxWidth: '100vw',
          overflowX: 'hidden'
        }}
      >
        <Container maxWidth="xl" sx={{ overflow: 'hidden' }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              mb: { xs: 2, sm: 4 },
              gap: { xs: 2, sm: 0 }
            }}
          >
            <Typography 
              variant={isXs ? "h5" : "h4"}
              sx={{ 
                fontWeight: 600,
                backgroundImage: 'linear-gradient(45deg, #3a7bd5, #00d2ff)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Inventory Dashboard
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  fetchData();
                  fetchHistoryData();
                }}
                sx={{ 
                  flex: { xs: 1, sm: 'none' },
                  backgroundColor: '#6c757d',
                  '&:hover': { backgroundColor: '#5a6268' },
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                {isXs ? "Refresh" : "Refresh Data"}
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={exporting}
                sx={{ 
                  flex: { xs: 1, sm: 'none' },
                  backgroundColor: '#28a745',
                  '&:hover': { backgroundColor: '#218838' },
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                {exporting 
                  ? (isXs ? "Exporting..." : "Exporting Data...") 
                  : (isXs ? "Export" : "Export to Excel")
                }
              </Button>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Box sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundImage: 'linear-gradient(120deg, #3498db, #2980b9)'
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      width: { xs: 40, sm: 48, md: 56 },
                      height: { xs: 40, sm: 48, md: 56 }
                    }}
                  >
                    <InventoryIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' } }} />
                  </Avatar>
                  <Box sx={{ ml: { xs: 1, sm: 2 } }}>
                    <Typography 
                      variant={isXs ? "h5" : "h4"}
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' }
                      }}
                    >
                      {stats.productCount}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }
                      }}
                    >
                      Total Products
                    </Typography>
                  </Box>
                </Box>
                <Box 
                  sx={{ 
                    p: 1, 
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: '#2980b9',
                      fontSize: { xs: '0.7rem', md: '0.75rem' }
                    }}
                  >
                    {productGrowth.hasData ? (
                      <>
                        {productGrowth.positive ? (
                          <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5, fontSize: { xs: '0.8rem', md: '1rem' } }} />
                        ) : (
                          <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5, fontSize: { xs: '0.8rem', md: '1rem' } }} />
                        )}
                        {productGrowth.percentage}% {productGrowth.positive ? 'increase' : 'decrease'} from last snapshot
                      </>
                    ) : (
                      `${stats.productCount} total products in inventory`
                    )}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Box sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundImage: 'linear-gradient(120deg, #2ecc71, #27ae60)'
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      width: { xs: 40, sm: 48, md: 56 },
                      height: { xs: 40, sm: 48, md: 56 }
                    }}
                  >
                    <CategoryIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' } }} />
                  </Avatar>
                  <Box sx={{ ml: { xs: 1, sm: 2 } }}>
                    <Typography 
                      variant={isXs ? "h5" : "h4"}
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' }
                      }}
                    >
                      {stats.categoryCount}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }
                      }}
                    >
                      Categories
                    </Typography>
                  </Box>
                </Box>
                <Box 
                  sx={{ 
                    p: 1, 
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: '#27ae60',
                      fontSize: { xs: '0.7rem', md: '0.75rem' }
                    }}
                  >
                    {categoryGrowth.hasData ? (
                      <>
                        {categoryGrowth.positive ? (
                          <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5, fontSize: { xs: '0.8rem', md: '1rem' } }} />
                        ) : (
                          <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5, fontSize: { xs: '0.8rem', md: '1rem' } }} />
                        )}
                        {categoryGrowth.percentage > 0
                          ? `${categoryGrowth.percentage}% ${categoryGrowth.positive ? 'growth' : 'reduction'} from last snapshot`
                          : 'No change from last snapshot'}
                      </>
                    ) : (
                      `${stats.categoryCount} categories organized`
                    )}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Box sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundImage: 'linear-gradient(120deg, #9b59b6, #8e44ad)'
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      width: { xs: 40, sm: 48, md: 56 },
                      height: { xs: 40, sm: 48, md: 56 }
                    }}
                  >
                    <SupplierIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' } }} />
                  </Avatar>
                  <Box sx={{ ml: { xs: 1, sm: 2 } }}>
                    <Typography 
                      variant={isXs ? "h5" : "h4"}
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' }
                      }}
                    >
                      {stats.supplierCount}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }
                      }}
                    >
                      Suppliers
                    </Typography>
                  </Box>
                </Box>
                <Box 
                  sx={{ 
                    p: 1, 
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: '#8e44ad',
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      textAlign: 'center'
                    }}
                  >
                    {supplierGrowth.hasData ? (
                      <>
                        {supplierGrowth.positive ? (
                          <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5, fontSize: { xs: '0.8rem', md: '1rem' } }} />
                        ) : (
                          <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5, fontSize: { xs: '0.8rem', md: '1rem' } }} />
                        )}
                        {supplierGrowth.percentage > 0
                          ? `${supplierGrowth.percentage}% ${supplierGrowth.positive ? 'increase' : 'decrease'} from last snapshot`
                          : 'No change from last snapshot'}
                      </>
                    ) : (
                      `${stats.supplierCount} active suppliers`
                    )}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Box sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundImage: 'linear-gradient(120deg, #e74c3c, #c0392b)'
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      width: { xs: 40, sm: 48, md: 56 },
                      height: { xs: 40, sm: 48, md: 56 }
                    }}
                  >
                    <WarningIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' } }} />
                  </Avatar>
                  <Box sx={{ ml: { xs: 1, sm: 2 } }}>
                    <Typography 
                      variant={isXs ? "h5" : "h4"}
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' }
                      }}
                    >
                      {stats.lowStockCount}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }
                      }}
                    >
                      Low Stock Items
                    </Typography>
                  </Box>
                </Box>
                <Box 
                  sx={{ 
                    p: 1, 
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: '#c0392b',
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      textAlign: 'center'
                    }}
                  >
                    {lowStockGrowth.hasData ? (
                      lowStockGrowth.positive ? (
                        <>
                          <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5, color: '#27ae60', fontSize: { xs: '0.8rem', md: '1rem' } }} />
                          {lowStockGrowth.percentage}% decrease from last snapshot
                        </>
                      ) : (
                        <>
                          <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5, color: '#e74c3c', fontSize: { xs: '0.8rem', md: '1rem' } }} />
                          {lowStockGrowth.percentage}% increase from last snapshot
                        </>
                      )
                    ) : (
                      stats.lowStockCount === 0
                        ? 'All items above reorder level'
                        : `${stats.lowStockCount} items need attention`
                    )}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} lg={8}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: '12px',
                  height: '100%'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}
                >
                  <AssessmentIcon sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} /> Inventory History
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: { xs: 320, sm: 350, md: 400 } }}>
                  {inventoryHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={inventoryHistory}
                        margin={{
                          top: 10,
                          right: isXs ? 10 : (isSm ? 20 : 30),
                          left: isXs ? -10 : (isSm ? 0 : 10),
                          bottom: 5
                        }}
                      >
                        <defs>
                          <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3498db" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3498db" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e8e8e8"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{
                            fill: '#888',
                            fontSize: isXs ? 8 : (isSm ? 9 : 10)
                          }}
                          interval="preserveStartEnd"
                          tickFormatter={(value) => {
                            // Show condensed format: "Jan 15" or "15 2PM"
                            const parts = value.split(' ');
                            if (parts.length >= 3) {
                              // Format: "Jan 15 2:30 PM" -> "Jan 15"
                              return `${parts[0]} ${parts[1]}`;
                            }
                            return value.substring(0, 8);
                          }}
                          height={35}
                          tickMargin={8}
                          axisLine={{ stroke: '#e0e0e0' }}
                          tickLine={{ stroke: '#e0e0e0' }}
                        />
                        <YAxis
                          tick={{
                            fill: '#888',
                            fontSize: isXs ? 9 : 10
                          }}
                          width={isXs ? 35 : 45}
                          tickCount={6}
                          domain={['dataMin - 5', 'dataMax + 5']}
                          axisLine={{ stroke: '#e0e0e0' }}
                          tickLine={{ stroke: '#e0e0e0' }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '10px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: 'none',
                            backgroundColor: 'rgba(255,255,255,0.98)',
                            fontSize: '0.8rem',
                            padding: '12px 16px'
                          }}
                          formatter={(value, name) => {
                            if (name === 'Total Items') {
                              return [`${value} items`, 'Total Quantity'];
                            }
                            return [value, name];
                          }}
                          labelFormatter={(label) => label}
                          labelStyle={{ fontWeight: 600, marginBottom: '4px', color: '#3498db' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="totalQuantity"
                          stroke="#3498db"
                          strokeWidth={2.5}
                          fill="url(#colorQuantity)"
                          dot={{ fill: '#3498db', r: isXs ? 3 : 4, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: isXs ? 5 : 7, stroke: '#3498db', strokeWidth: 2, fill: '#fff' }}
                          name="Total Items"
                        />
                        <Brush
                          dataKey="label"
                          height={30}
                          stroke="#3498db"
                          fill="#f5f5f5"
                          tickFormatter={(value) => ''}
                          startIndex={Math.max(0, inventoryHistory.length - 20)}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary" fontSize={{ xs: '0.8rem', md: '1rem' }}>
                        No historical data available yet. Inventory changes will be tracked over time.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: '12px',
                  height: '100%'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}
                >
                  <CategoryIcon sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} /> Product Categories
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ 
                  height: { xs: 200, sm: 250, md: 300 }, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Box sx={{ 
                    width: '100%', 
                    mb: 2, 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center', 
                    gap: 1,
                    maxWidth: '100%',
                    px: 1
                  }}>
                    {productsByCategory.map((entry, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mx: 1 
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            backgroundColor: COLORS[index % COLORS.length],
                            borderRadius: '50%',
                            mr: 1
                          }} 
                        />
                        <Typography
                          variant="caption"
                          fontSize={{ xs: '0.65rem', md: '0.75rem' }}
                          sx={{
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {entry.name} ({stats.productCount > 0 ? Math.round(entry.value / stats.productCount * 100) : 0}%)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  {productsByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productsByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={getPieChartSize().innerRadius}
                          outerRadius={getPieChartSize().outerRadius}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          label={false}
                        >
                          {productsByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value} items (${stats.productCount > 0 ? Math.round(value / stats.productCount * 100) : 0}%)`, name]}
                          contentStyle={{ 
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            border: 'none',
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            fontSize: isXs ? '0.7rem' : '0.75rem'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body1" color="text.secondary" align="center" fontSize={{ xs: '0.8rem', md: '1rem' }}>
                      No product categories data available
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 2, md: 3 }, 
              borderRadius: '12px',
              mb: 3,
              backgroundImage: 'linear-gradient(to right, #fff, rgba(231, 76, 60, 0.05))'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                pt: 1,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                color: '#c0392b',
                fontFamily: "'Poppins', sans-serif",
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              <WarningIcon sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} /> Low Stock Items
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {stats.lowStockItems.length > 0 ? (
              <List sx={{ width: '100%', p: 0 }}>
                {stats.lowStockItems.map((item) => (
                  <Paper 
                    key={item.id || item.productId} 
                    elevation={1} 
                    sx={{ 
                      mb: 2, 
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(231, 76, 60, 0.2)'
                    }}
                  >
                    <ListItem 
                      alignItems="flex-start"
                      sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        py: { xs: 1, sm: 2 },
                        px: { xs: 1, sm: 2 },
                        overflow: 'hidden',
                        width: '100%'
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        width: '100%',
                        mb: { xs: 1, sm: 0 }
                      }}>
                        <ListItemAvatar sx={{ minWidth: { xs: '40px', sm: '56px' } }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: 'rgba(231, 76, 60, 0.8)',
                              width: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 }
                            }}
                          >
                            <InventoryIcon fontSize={isXs ? "small" : "medium"} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 600,
                                fontSize: { xs: '0.85rem', md: '1rem' },
                                fontFamily: "'Roboto', sans-serif"
                              }}
                            >
                              {item.productName}
                            </Typography>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mt: 0.5, gap: { xs: 0.5, sm: 2 } }}>
                              <Typography
                                variant="body2"
                                component="span"
                                color="text.secondary"
                                fontSize={{ xs: '0.7rem', md: '0.75rem' }}
                                sx={{ whiteSpace: 'nowrap' }}
                              >
                                Reorder Level: {item.reorderLevel}
                              </Typography>

                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                <LocationIcon sx={{ color: 'text.secondary', fontSize: { xs: '0.7rem', md: '0.9rem' }, mr: 0.5, flexShrink: 0 }} />
                                <Typography
                                  variant="body2"
                                  component="span"
                                  color="text.secondary"
                                  fontSize={{ xs: '0.7rem', md: '0.75rem' }}
                                  sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: { xs: '100%', sm: '150px', md: '200px' }
                                  }}
                                >
                                  {item.location || 'Not specified'}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </Box>
                      
                      <Box sx={{ 
                        alignSelf: { xs: 'flex-start', sm: 'center' }, 
                        ml: { xs: 0, sm: 'auto' }, 
                        mt: { xs: 1, sm: 0 } 
                      }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: item.quantity === 0 ? '#c0392b' : '#e67e22',
                            fontWeight: 'bold',
                            bgcolor: item.quantity === 0 ? 'rgba(231, 76, 60, 0.1)' : 'rgba(230, 126, 34, 0.1)',
                            py: 0.5,
                            px: 1.5,
                            borderRadius: '16px',
                            fontSize: { xs: '0.7rem', md: '0.75rem' },
                            display: 'inline-block',
                            lineHeight: 1.5,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.quantity} {item.quantity === 1 ? "item" : "items"} in stock
                        </Typography>
                      </Box>
                    </ListItem>
                  </Paper>
                ))}
              </List>
            ) : (
              <Box 
                sx={{ 
                  py: 4, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'white',
                  borderRadius: '8px'
                }}
              >
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  align="center"
                  sx={{ mb: 1, fontSize: { xs: '0.85rem', md: '1rem' } }}
                >
                  No low stock items found. Your inventory is in good shape!
                </Typography>
                <Typography 
                  variant="body2" 
                  color="success.main" 
                  align="center"
                  fontSize={{ xs: '0.75rem', md: '0.85rem' }}
                >
                  All inventory items are above their reorder levels.
                </Typography>
              </Box>
            )}
          </Paper>

          <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: '12px',
                  height: '100%'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}
                >
                  <InventoryIcon sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} /> Inventory Summary
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderRadius: '8px',
                        p: { xs: 1.5, md: 2 }
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 'bold', 
                          color: '#3498db', 
                          mb: 1,
                          fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' }
                        }}>
                          {stats.totalQuantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontSize={{ xs: '0.75rem', md: '0.85rem' }}>
                          Total items in stock
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                          {totalQuantityGrowth.hasData ? (
                            <>
                              {totalQuantityGrowth.positive ? (
                                <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main', fontSize: { xs: '0.8rem', md: '1rem' } }} />
                              ) : (
                                <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5, color: 'error.main', fontSize: { xs: '0.8rem', md: '1rem' } }} />
                              )}
                              <Typography
                                variant="caption"
                                color={totalQuantityGrowth.positive ? 'success.main' : 'error.main'}
                                fontSize={{ xs: '0.7rem', md: '0.75rem' }}
                              >
                                {totalQuantityGrowth.percentage}% {totalQuantityGrowth.positive ? 'increase' : 'decrease'} from last snapshot
                              </Typography>
                            </>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontSize={{ xs: '0.7rem', md: '0.75rem' }}
                            >
                              Tracking inventory changes
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        borderRadius: '8px',
                        p: { xs: 1.5, md: 2 }
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 'bold', 
                          color: '#2ecc71', 
                          mb: 1,
                          fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' }
                        }}>
                          {stats.productCount > 0 ? Math.round((stats.productCount - stats.lowStockCount) / stats.productCount * 100) : 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontSize={{ xs: '0.75rem', md: '0.85rem' }}>
                          Healthy stock level
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            fontSize={{ xs: '0.7rem', md: '0.75rem' }}
                          >
                            {stats.productCount - stats.lowStockCount} products above reorder level
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 1, fontSize: { xs: '0.75rem', md: '0.85rem' } }}
                      >
                        <b>Inventory Health:</b> {stats.lowStockCount > 0 
                          ? `${stats.lowStockCount} items need attention` 
                          : 'All inventory levels are healthy'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        fontSize={{ xs: '0.75rem', md: '0.85rem' }}
                      >
                        <b>Average Stock Level:</b> {stats.productCount > 0 
                          ? `${Math.round(stats.totalQuantity / stats.productCount)} units per product` 
                          : 'No products in system'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: '12px',
                  height: '100%'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}
                >
                  <AssessmentIcon sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} /> Inventory Statistics
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 0.5, fontSize: { xs: '0.75rem', md: '0.85rem' } }}
                      >
                        Products per Category
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                        }}
                      >
                        {stats.categoryCount > 0 
                          ? (stats.productCount / stats.categoryCount).toFixed(1) 
                          : '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 0.5, fontSize: { xs: '0.75rem', md: '0.85rem' } }}
                      >
                        Products per Supplier
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                        }}
                      >
                        {stats.supplierCount > 0 
                          ? (stats.productCount / stats.supplierCount).toFixed(1) 
                          : '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 1, fontSize: { xs: '0.75rem', md: '0.85rem' } }}
                      >
                        Low Stock Percentage
                      </Typography>
                      <Box sx={{ position: 'relative', height: '24px', bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: `${stats.productCount > 0 ? Math.min(100, (stats.lowStockCount / stats.productCount) * 100) : 0}%`,
                            bgcolor: stats.lowStockCount > (stats.productCount * 0.2) ? '#e74c3c' : 
                                    stats.lowStockCount > (stats.productCount * 0.1) ? '#f39c12' : '#2ecc71',
                            borderRadius: '12px',
                            transition: 'width 0.5s ease'
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontWeight: 'bold',
                            mixBlendMode: 'difference',
                            color: 'white',
                            fontSize: { xs: '0.7rem', md: '0.75rem' }
                          }}
                        >
                          {stats.productCount > 0 
                            ? `${Math.round((stats.lowStockCount / stats.productCount) * 100)}%` 
                            : '0%'}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ display: 'block', mt: 0.5, fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                      >
                        {stats.lowStockCount} out of {stats.productCount} products are running low
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        fontSize={{ xs: '0.75rem', md: '0.85rem' }}
                      >
                        Dashboard last updated:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight="medium"
                        fontSize={{ xs: '0.75rem', md: '0.85rem' }}
                      >
                        {new Date().toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Grow>
  );
};

export default ResponsiveDashboard;