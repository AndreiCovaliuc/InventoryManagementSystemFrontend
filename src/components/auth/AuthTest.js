import React, { useState } from 'react';
import { Box, Button, Paper, Typography, TextField, Stack, Alert } from '@mui/material';
import axios from 'axios';

const AuthTest = () => {
  const [testResponse, setTestResponse] = useState('');
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [token, setToken] = useState('');

  const testPublicEndpoint = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/test/public');
      setTestResponse(JSON.stringify(response.data, null, 2));
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setTestResponse('');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', loginData);
      setToken(response.data.token);
      setTestResponse(JSON.stringify(response.data, null, 2));
      setError('');
    } catch (err) {
      setError(`Login Error: ${err.message}`);
      setTestResponse('');
    }
  };

  const testProtectedEndpoint = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/test/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestResponse(JSON.stringify(response.data, null, 2));
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setTestResponse('');
    }
  };

  const testAdminEndpoint = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/test/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestResponse(JSON.stringify(response.data, null, 2));
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setTestResponse('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Authentication Test</Typography>
      
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Public Test</Typography>
        <Button variant="contained" onClick={testPublicEndpoint}>
          Test Public Endpoint
        </Button>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Login Test</Typography>
        <Box component="form" sx={{ mb: 2 }}>
          <TextField
            label="Email"
            name="email"
            value={loginData.email}
            onChange={handleInputChange}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={loginData.password}
            onChange={handleInputChange}
            margin="normal"
            fullWidth
          />
        </Box>
        <Button variant="contained" onClick={handleLogin} sx={{ mb: 2 }}>
          Login
        </Button>
        {token && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Successfully logged in! Token received.
          </Alert>
        )}
      </Paper>
      
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Protected Endpoints Test</Typography>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            onClick={testProtectedEndpoint}
            disabled={!token}
          >
            Test User Endpoint
          </Button>
          <Button 
            variant="contained" 
            onClick={testAdminEndpoint}
            disabled={!token}
            color="secondary"
          >
            Test Admin Endpoint
          </Button>
        </Stack>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {testResponse && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Response:</Typography>
          <Box 
            component="pre" 
            sx={{ 
              p: 2, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 1,
              overflow: 'auto'
            }}
          >
            {testResponse}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AuthTest;