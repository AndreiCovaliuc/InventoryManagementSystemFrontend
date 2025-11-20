import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Box,
  Fab,
  Slide,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Fade,
  Chip,
  Tooltip,
  useMediaQuery,
  useTheme,
  ClickAwayListener,
} from '@mui/material';
import { keyframes } from '@mui/system';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AuthContext } from '../../context/AuthContext';
import AIService from '../../services/AIService';

// Animations
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(52, 152, 219, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0);
  }
`;

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

const typingDots = keyframes`
  0%, 20% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  80%, 100% {
    opacity: 0;
  }
`;

function AIAssistant() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick question suggestions
  const quickQuestions = [
    { label: "Low stock", question: "What products are low on stock?", icon: <TrendingDownIcon fontSize="small" /> },
    { label: "Inventory", question: "Show inventory summary", icon: <InventoryIcon fontSize="small" /> },
    { label: "Suppliers", question: "List all suppliers", icon: <LocalShippingIcon fontSize="small" /> },
    { label: "Transactions", question: "Show recent transactions", icon: <ReceiptIcon fontSize="small" /> },
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (question = inputValue) => {
    if (!question.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await AIService.askQuestion(question);
      const aiMessage = {
        type: 'ai',
        content: response.data.answer,
        timestamp: response.data.timestamp,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error asking AI:', error);
      const errorMessage = {
        type: 'ai',
        content: error.response?.data?.answer ||
                 error.response?.data?.message ||
                 'Sorry, I encountered an error. Please make sure the AI service is running and try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Don't render if not authenticated
  if (!isAuthenticated()) {
    return null;
  }

  const panelWidth = isMobile ? '100%' : 420;

  return (
    <>
      {/* Floating Action Button */}
      <Tooltip title={isOpen ? "Close AI Assistant" : "AI Assistant"} placement="left">
        <Fab
          onClick={handleToggle}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: isOpen && !isMobile ? `calc(${panelWidth}px + 24px)` : 24,
            background: isOpen
              ? 'linear-gradient(135deg, #2980b9 0%, #1f5f89 100%)'
              : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 20px rgba(52, 152, 219, 0.4)',
            transition: 'all 0.3s ease',
            zIndex: 1400,
            animation: !isOpen ? `${pulse} 2s infinite` : 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #2980b9 0%, #1f5f89 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 6px 24px rgba(52, 152, 219, 0.5)',
            },
          }}
        >
          {isOpen ? <CloseIcon /> : <SmartToyIcon />}
        </Fab>
      </Tooltip>

      {/* Side Panel - Non-modal */}
      <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: panelWidth,
            height: '100vh',
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
            borderRadius: 0,
          }}
        >
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              color: 'white',
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SmartToyIcon sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Ask me about your inventory
                </Typography>
              </Box>
            </Box>
            <Box>
              <Tooltip title="Clear chat">
                <IconButton
                  onClick={handleClearChat}
                  sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={handleToggle}
                sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Paper>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Welcome message if no messages */}
            {messages.length === 0 && (
              <Fade in timeout={500}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SmartToyIcon sx={{ fontSize: 64, color: '#3498db', opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#2c3e50', mb: 1, fontWeight: 600 }}>
                    How can I help you?
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 3 }}>
                    Ask me anything about your inventory, products, suppliers, or transactions.
                  </Typography>

                  {/* Quick Questions */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {quickQuestions.map((q, index) => (
                      <Chip
                        key={index}
                        icon={q.icon}
                        label={q.label}
                        onClick={() => handleQuickQuestion(q.question)}
                        sx={{
                          background: 'rgba(52, 152, 219, 0.1)',
                          color: '#3498db',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'rgba(52, 152, 219, 0.2)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Fade>
            )}

            {/* Message bubbles */}
            {messages.map((message, index) => (
              <Fade in key={index} timeout={300}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    animation: `${fadeInUp} 0.3s ease`,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: '85%',
                      borderRadius: message.type === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      background: message.type === 'user'
                        ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                        : message.isError
                          ? 'rgba(231, 76, 60, 0.1)'
                          : '#ffffff',
                      color: message.type === 'user' ? 'white' : '#2c3e50',
                      border: message.type === 'user'
                        ? 'none'
                        : message.isError
                          ? '1px solid rgba(231, 76, 60, 0.3)'
                          : '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: message.type === 'user'
                        ? '0 4px 12px rgba(52, 152, 219, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: 1.6,
                      }}
                    >
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        opacity: 0.7,
                        textAlign: message.type === 'user' ? 'right' : 'left',
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Paper>
                </Box>
              </Fade>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <Fade in>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '16px 16px 16px 4px',
                      background: '#ffffff',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <CircularProgress size={16} sx={{ color: '#3498db' }} />
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      Thinking
                      <Box component="span" sx={{
                        animation: `${typingDots} 1.4s infinite`,
                        animationDelay: '0s',
                      }}>.</Box>
                      <Box component="span" sx={{
                        animation: `${typingDots} 1.4s infinite`,
                        animationDelay: '0.2s',
                      }}>.</Box>
                      <Box component="span" sx={{
                        animation: `${typingDots} 1.4s infinite`,
                        animationDelay: '0.4s',
                      }}>.</Box>
                    </Typography>
                  </Paper>
                </Box>
              </Fade>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Quick questions bar (when there are messages) */}
          {messages.length > 0 && (
            <Box
              sx={{
                px: 2,
                py: 1,
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                background: '#ffffff',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2
                },
              }}
            >
              {quickQuestions.map((q, index) => (
                <Chip
                  key={index}
                  icon={q.icon}
                  label={q.label}
                  size="small"
                  onClick={() => handleQuickQuestion(q.question)}
                  sx={{
                    mr: 1,
                    background: 'rgba(52, 152, 219, 0.08)',
                    color: '#3498db',
                    fontSize: '0.75rem',
                    '&:hover': {
                      background: 'rgba(52, 152, 219, 0.15)',
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Input Area */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              background: '#ffffff',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Ask about your inventory..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                inputRef={inputRef}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '24px',
                    backgroundColor: '#f8f9fa',
                    fontSize: '0.95rem',
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(52, 152, 219, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3498db',
                      borderWidth: '1px',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.15)',
                    },
                  },
                }}
              />
              <IconButton
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                sx={{
                  background: inputValue.trim()
                    ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                    : 'rgba(0, 0, 0, 0.1)',
                  color: inputValue.trim() ? 'white' : 'rgba(0, 0, 0, 0.3)',
                  width: 44,
                  height: 44,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: inputValue.trim()
                      ? 'linear-gradient(135deg, #2980b9 0%, #1f5f89 100%)'
                      : 'rgba(0, 0, 0, 0.15)',
                    transform: inputValue.trim() ? 'scale(1.05)' : 'none',
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(0, 0, 0, 0.1)',
                    color: 'rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        </Paper>
      </Slide>
    </>
  );
}

export default AIAssistant;
