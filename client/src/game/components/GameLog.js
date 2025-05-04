import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  HowToVote,
  Handshake,
  Event,
  NotificationsActive,
  EmojiEvents,
  Info,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useGame } from '../GameState';

function GameLog() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { gameLog } = useGame();
  
  // Show newest entries first
  const reversedLog = [...gameLog].reverse().slice(0, 15); // Show only most recent 15 entries
  
  // Get appropriate icon for log entry type
  const getIconForLogType = (type) => {
    switch (type) {
      case 'vote':
        return <HowToVote color="primary" fontSize={isMobile ? "small" : "medium"} />;
      case 'alliance':
        return <Handshake color="primary" fontSize={isMobile ? "small" : "medium"} />;
      case 'event':
        return <Event color="primary" fontSize={isMobile ? "small" : "medium"} />;
      case 'phase':
        return <NotificationsActive color="primary" fontSize={isMobile ? "small" : "medium"} />;
      case 'winner':
        return <EmojiEvents color="primary" fontSize={isMobile ? "small" : "medium"} />;
      case 'success':
        return <CheckCircle color="success" fontSize={isMobile ? "small" : "medium"} />;
      case 'failure':
        return <Cancel color="error" fontSize={isMobile ? "small" : "medium"} />;
      default:
        return <Info color="primary" fontSize={isMobile ? "small" : "medium"} />;
    }
  };
  
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: { xs: 1, md: 2 }, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText' 
      }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"}>
          Game Log
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        maxHeight: { xs: '200px', sm: '250px', md: '400px' },
        '&::-webkit-scrollbar': {
          width: '0.4em'
        },
        '&::-webkit-scrollbar-track': {
          boxShadow: 'inset 0 0 6px rgba(0,0,0,0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 4,
        }
      }}>
        {reversedLog.length > 0 ? (
          <List dense>
            {reversedLog.map((entry, index) => (
              <ListItem 
                key={index} 
                alignItems="flex-start" 
                divider={index < reversedLog.length - 1}
                sx={{ 
                  py: { xs: 0.75, md: 1 },
                  px: { xs: 1, md: 2 }
                }}
              >
                <ListItemIcon sx={{ minWidth: { xs: 28, md: 36 } }}>
                  {getIconForLogType(entry.type)}
                </ListItemIcon>
                <ListItemText
                  primary={entry.message}
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No game events yet. The log will fill as you play.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default GameLog; 