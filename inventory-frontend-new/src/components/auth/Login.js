import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container,
  Paper,
  Avatar,
  Snackbar,
  Alert,
  Grid,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error'
      });
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      let errorMessage = 'Invalid email or password';

      // Check for specific error responses
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.response.status === 404) {
          errorMessage = 'Account not found. Please check your email.';
        } else if (error.response.status === 403) {
          errorMessage = 'Account is locked. Please contact support.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: '16px',
              overflow: 'hidden',
              width: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            {/* Header with gradient background */}
            <Box 
              sx={{ 
                p: 3, 
                backgroundImage: 'linear-gradient(120deg, #3498db, #2980b9)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Avatar
                src="/favicon.png"
                alt="Inventra"
                sx={{
                  width: 70,
                  height: 70,
                  mb: 2
                }}
              />
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                Inventra
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  mt: 0.5,
                  fontFamily: "'Roboto', sans-serif"
                }}
              >
                Sign in to access your dashboard
              </Typography>
            </Box>
            
            {/* Login Form */}
            <Box sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#3498db' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '&:hover fieldset': {
                        borderColor: '#3498db',
                      },
                    }
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#3498db' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '&:hover fieldset': {
                        borderColor: '#3498db',
                      },
                    }
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    py: 1.5,
                    borderRadius: '8px',
                    backgroundImage: 'linear-gradient(120deg, #3498db, #2980b9)',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 6px rgba(52, 152, 219, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 8px rgba(52, 152, 219, 0.4)',
                    }
                  }}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
                <Grid container justifyContent="center">
  <Grid item>
    <Typography 
      variant="body2" 
      align="center"
      color="text.secondary"
      sx={{ 
        mt: 1,
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      Don't have a company account?{' '}
      <Link 
        to="/register-company" 
        style={{ color: '#3498db', textDecoration: 'none', fontWeight: 500 }}
      >
        Register your company
      </Link>
    </Typography>
  </Grid>
</Grid>
              </Box>
            </Box>
          </Paper>
          
          {/* Copyright Footer */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ mt: 4 }}
          >
            © {new Date().getFullYear()} Inventory Management System. All rights reserved.
          </Typography>
        </Box>
      </Container>
      
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
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;