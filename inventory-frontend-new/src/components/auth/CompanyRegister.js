import React, { useState } from 'react';
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
  IconButton,
  LinearProgress
} from '@mui/material';
import { 
  Business as BusinessIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

const CompanyRegister = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    companyName: '',
    cui: '',
    adminName: '',
    adminEmail: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    return checks;
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    const checks = validatePassword(password);
    const passed = Object.values(checks).filter(Boolean).length;
    return (passed / 5) * 100;
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return '';
    if (strength <= 40) return 'Weak';
    if (strength <= 60) return 'Fair';
    if (strength <= 80) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 40) return 'error';
    if (strength <= 60) return 'warning';
    if (strength <= 80) return 'info';
    return 'success';
  };

  const validateCUI = (cui) => {
    // Basic CUI validation - adjust based on your requirements
    // Romanian CUI is typically 2-10 digits, optionally prefixed with 'RO'
    const cuiRegex = /^(RO)?[0-9]{2,10}$/i;
    return cuiRegex.test(cui.trim());
  };

  // Get field errors
  const getFieldError = (fieldName) => {
    if (!touched[fieldName]) return '';

    switch (fieldName) {
      case 'companyName':
        if (!formData.companyName.trim()) return 'Company name is required';
        if (formData.companyName.trim().length < 2) return 'Company name must be at least 2 characters';
        return '';
      
      case 'cui':
        if (!formData.cui.trim()) return 'CUI is required';
        if (!validateCUI(formData.cui)) return 'Invalid CUI format (e.g., RO12345678 or 12345678)';
        return '';
      
      case 'adminName':
        if (!formData.adminName.trim()) return 'Admin name is required';
        if (formData.adminName.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      
      case 'adminEmail':
        if (!formData.adminEmail.trim()) return 'Email is required';
        if (!validateEmail(formData.adminEmail)) return 'Invalid email format';
        return '';
      
      case 'password':
        if (!formData.password) return 'Password is required';
        const checks = validatePassword(formData.password);
        if (!checks.length) return 'Password must be at least 8 characters';
        if (!checks.uppercase) return 'Password must contain an uppercase letter';
        if (!checks.lowercase) return 'Password must contain a lowercase letter';
        if (!checks.number) return 'Password must contain a number';
        if (!checks.special) return 'Password must contain a special character';
        return '';
      
      case 'confirmPassword':
        if (!confirmPassword) return 'Please confirm your password';
        if (formData.password !== confirmPassword) return 'Passwords do not match';
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const isFormValid = () => {
    return (
      formData.companyName.trim().length >= 2 &&
      validateCUI(formData.cui) &&
      formData.adminName.trim().length >= 2 &&
      validateEmail(formData.adminEmail) &&
      getPasswordStrength(formData.password) === 100 &&
      formData.password === confirmPassword
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show errors
    setTouched({
      companyName: true,
      cui: true,
      adminName: true,
      adminEmail: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/register-company', formData);
      setSnackbar({
        open: true,
        message: 'Company registered successfully! Redirecting to login...',
        severity: 'success'
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      let message = 'Registration failed. Please try again.';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 409) {
        message = 'Company or email already exists';
      } else if (error.response?.status === 400) {
        message = 'Invalid registration data. Please check your inputs.';
      } else if (error.response?.status === 500) {
        message = 'Server error. Please try again later.';
      } else if (!error.response) {
        message = 'Network error. Please check your connection.';
      }
      
      setSnackbar({
        open: true,
        message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordChecks = validatePassword(formData.password);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', py: 4 }}>
      <Container component="main" maxWidth="sm">
        <Paper elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ 
            p: 3, 
            backgroundImage: 'linear-gradient(120deg, #2ecc71, #27ae60)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 70, height: 70, mb: 2 }}>
              <BusinessIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              Register Your Company
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              Create your company account and become the admin
            </Typography>
          </Box>
          
          <Box sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="companyName"
                    label="Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('companyName')}
                    error={!!getFieldError('companyName')}
                    helperText={getFieldError('companyName')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon sx={{ color: getFieldError('companyName') ? 'error.main' : '#2ecc71' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="cui"
                    label="CUI (Company Identification Number)"
                    value={formData.cui}
                    onChange={handleChange}
                    onBlur={() => handleBlur('cui')}
                    error={!!getFieldError('cui')}
                    helperText={getFieldError('cui') || 'Format: RO12345678 or 12345678'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: getFieldError('cui') ? 'error.main' : '#2ecc71' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="adminName"
                    label="Admin Full Name"
                    value={formData.adminName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('adminName')}
                    error={!!getFieldError('adminName')}
                    helperText={getFieldError('adminName')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: getFieldError('adminName') ? 'error.main' : '#2ecc71' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type="email"
                    name="adminEmail"
                    label="Admin Email"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    onBlur={() => handleBlur('adminEmail')}
                    error={!!getFieldError('adminEmail')}
                    helperText={getFieldError('adminEmail')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: getFieldError('adminEmail') ? 'error.main' : '#2ecc71' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    error={touched.password && !!getFieldError('password')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: touched.password && getFieldError('password') ? 'error.main' : '#2ecc71' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      }
                    }}
                  />
                  {formData.password && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={passwordStrength} 
                          color={getPasswordStrengthColor(passwordStrength)}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4, mr: 1 }}
                        />
                        <Typography variant="caption" color={`${getPasswordStrengthColor(passwordStrength)}.main`}>
                          {getPasswordStrengthLabel(passwordStrength)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {[
                          { key: 'length', label: '8+ chars' },
                          { key: 'uppercase', label: 'Uppercase' },
                          { key: 'lowercase', label: 'Lowercase' },
                          { key: 'number', label: 'Number' },
                          { key: 'special', label: 'Special' }
                        ].map(({ key, label }) => (
                          <Box 
                            key={key}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              fontSize: '0.7rem',
                              color: passwordChecks[key] ? 'success.main' : 'text.secondary'
                            }}
                          >
                            {passwordChecks[key] ? (
                              <CheckCircleIcon sx={{ fontSize: 14, mr: 0.3 }} />
                            ) : (
                              <CancelIcon sx={{ fontSize: 14, mr: 0.3 }} />
                            )}
                            {label}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    error={!!getFieldError('confirmPassword')}
                    helperText={getFieldError('confirmPassword')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: getFieldError('confirmPassword') ? 'error.main' : '#2ecc71' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {confirmPassword && (
                            formData.password === confirmPassword ? (
                              <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                            ) : (
                              <CancelIcon sx={{ color: 'error.main', mr: 1 }} />
                            )
                          )}
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      }
                    }}
                  />
                </Grid>
              </Grid>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !isFormValid()}
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  borderRadius: '8px',
                  backgroundImage: loading || !isFormValid() 
                    ? 'none' 
                    : 'linear-gradient(120deg, #2ecc71, #27ae60)',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Registering...' : 'Register Company'}
              </Button>
              
              <Typography variant="body2" align="center" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#2ecc71', textDecoration: 'none', fontWeight: 500 }}>
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled"
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ borderRadius: '8px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyRegister;