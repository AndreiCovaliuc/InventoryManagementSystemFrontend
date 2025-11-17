import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { keyframes } from '@mui/system';

// Subtle entrance animation
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Message = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 2,
        px: 1,
        animation: `${fadeInUp} 0.3s ease-out`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
          maxWidth: '65%',
          minWidth: '120px',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            px: 2.5,
            borderRadius: '20px',
            borderBottomRightRadius: isOwn ? 6 : 20,
            borderBottomLeftRadius: isOwn ? 20 : 6,
            backgroundColor: isOwn 
              ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
              : '#ffffff',
            background: isOwn 
              ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
              : '#ffffff',
            color: isOwn ? 'white' : '#2c3e50',
            boxShadow: isOwn
              ? '0 4px 12px rgba(52, 152, 219, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
            position: 'relative',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isOwn
                ? '0 6px 16px rgba(52, 152, 219, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.12)',
            },
            '&::before': isOwn ? {} : {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: -8,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '0 10px 10px 0',
              borderColor: 'transparent #ffffff transparent transparent',
            },
            '&::after': isOwn ? {
              content: '""',
              position: 'absolute',
              bottom: 0,
              right: -8,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '10px 10px 0 0',
              borderColor: '#2980b9 transparent transparent transparent',
            } : {},
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.5,
              wordBreak: 'break-word',
              fontSize: '0.95rem',
              letterSpacing: '0.01em',
            }}
          >
            {message.content}
          </Typography>
        </Paper>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 0.75,
            px: 0.5,
            opacity: 0.7,
            transition: 'opacity 0.2s ease',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              mr: 0.5,
              fontSize: '0.7rem',
              fontWeight: 500,
              color: 'text.secondary',
            }}
          >
            {formatTime(message.timestamp)}
          </Typography>
          
          {isOwn && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {message.read ? (
                <DoneAllIcon 
                  sx={{ 
                    fontSize: '1rem', 
                    color: '#3498db',
                    filter: 'drop-shadow(0 1px 2px rgba(52, 152, 219, 0.3))',
                  }} 
                />
              ) : (
                <DoneIcon 
                  sx={{ 
                    fontSize: '1rem',
                    color: 'text.secondary',
                  }} 
                />
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Message;