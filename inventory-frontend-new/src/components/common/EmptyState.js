// Generic empty state component
// src/components/common/EmptyState.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    py: 8,
    textAlign: 'center'
  }}>
    {Icon && <Icon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />}
    <Typography variant="h5" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
      {description}
    </Typography>
    {actionText && onAction && (
      <Button variant="contained" onClick={onAction}>
        {actionText}
      </Button>
    )}
  </Box>
);

export default EmptyState;