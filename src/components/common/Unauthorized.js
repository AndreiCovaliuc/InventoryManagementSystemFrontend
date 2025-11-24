import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Unauthorized = () => {
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
          <Typography component="h1" variant="h4" sx={{ mt: 2 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You do not have permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please contact your administrator if you believe this is an error.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              component={Link}
              to="/dashboard"
              variant="contained"
              color="primary"
            >
              Return to Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;