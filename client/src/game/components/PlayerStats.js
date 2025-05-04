import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Divider,
  LinearProgress,
  Chip,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Psychology,
  Church,
  Balance,
  Public,
} from '@mui/icons-material';
import { useGame } from '../GameState';

// Default image if cardinal photo is missing
const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image+Available';

function PlayerStats() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { player, round, alliances } = useGame();
  
  // If no player is selected yet, don't render
  if (!player) return null;
  
  // Count player's alliances
  const allianceCount = alliances.filter(alliance => 
    alliance.members.includes(player.id)
  ).length;

  return (
    <Paper elevation={3} sx={{ height: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: { xs: 1, md: 2 }, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText'
      }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"}>
          Cardinal Profile
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ 
        p: { xs: 1, md: 2 }, 
        display: 'flex', 
        alignItems: 'center'
      }}>
        <Avatar 
          src={player.photo_url || defaultImage}
          alt={player.name}
          sx={{ 
            width: { xs: 50, md: 60 }, 
            height: { xs: 50, md: 60 }, 
            mr: { xs: 1, md: 2 } 
          }}
        />
        <Box>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{ 
              fontSize: { xs: '0.95rem', md: '1.25rem' },
              lineHeight: 1.2
            }}
          >
            {player.name}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: { xs: '0.75rem', md: '0.875rem' }
            }}
          >
            <Public fontSize="small" sx={{ mr: 0.5, fontSize: isMobile ? 14 : 16 }} />
            {player.country}
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: { xs: 1, md: 2 } }}>
        <Typography 
          variant="subtitle2" 
          gutterBottom
          sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
        >
          Round: {round} | Alliances: {allianceCount}
        </Typography>
        
        <Box sx={{ mt: { xs: 1, md: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 1 } }}>
            <Church 
              fontSize="small" 
              sx={{ 
                mr: { xs: 0.5, md: 1 }, 
                color: 'primary.main',
                fontSize: isMobile ? 16 : 20
              }} 
            />
            <Typography 
              variant="body2" 
              component="span" 
              sx={{ 
                minWidth: { xs: 60, md: 80 },
                fontSize: { xs: '0.7rem', md: '0.875rem' }
              }}
            >
              Piety:
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={player.piety * 10} 
              sx={{ 
                flex: 1, 
                height: { xs: 6, md: 8 }, 
                borderRadius: 4,
                mx: { xs: 0.5, md: 1 }
              }} 
            />
            <Typography 
              variant="body2" 
              sx={{ 
                ml: { xs: 0.5, md: 1 }, 
                minWidth: 20,
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                fontWeight: 'bold'
              }}
            >
              {player.piety}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 1 } }}>
            <Psychology 
              fontSize="small" 
              sx={{ 
                mr: { xs: 0.5, md: 1 }, 
                color: 'primary.main',
                fontSize: isMobile ? 16 : 20
              }} 
            />
            <Typography 
              variant="body2" 
              component="span" 
              sx={{ 
                minWidth: { xs: 60, md: 80 },
                fontSize: { xs: '0.7rem', md: '0.875rem' }
              }}
            >
              Influence:
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={player.influence * 10} 
              sx={{ 
                flex: 1, 
                height: { xs: 6, md: 8 }, 
                borderRadius: 4,
                mx: { xs: 0.5, md: 1 }
              }} 
            />
            <Typography 
              variant="body2" 
              sx={{ 
                ml: { xs: 0.5, md: 1 }, 
                minWidth: 20,
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                fontWeight: 'bold'
              }}
            >
              {player.influence}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 1 } }}>
            <Balance 
              fontSize="small" 
              sx={{ 
                mr: { xs: 0.5, md: 1 }, 
                color: 'primary.main',
                fontSize: isMobile ? 16 : 20
              }} 
            />
            <Typography 
              variant="body2" 
              component="span" 
              sx={{ 
                minWidth: { xs: 60, md: 80 },
                fontSize: { xs: '0.7rem', md: '0.875rem' }
              }}
            >
              Diplomacy:
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={player.diplomacy * 10} 
              sx={{ 
                flex: 1, 
                height: { xs: 6, md: 8 }, 
                borderRadius: 4,
                mx: { xs: 0.5, md: 1 }
              }} 
            />
            <Typography 
              variant="body2" 
              sx={{ 
                ml: { xs: 0.5, md: 1 }, 
                minWidth: 20,
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                fontWeight: 'bold'
              }}
            >
              {player.diplomacy}
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mt: { xs: 1, md: 2 }, 
            fontStyle: 'italic',
            fontSize: { xs: '0.7rem', md: '0.8rem' }
          }}
        >
          Ideology: {player.conservative ? 'Conservative' : 'Progressive'}
        </Typography>
      </Box>
    </Paper>
  );
}

export default PlayerStats; 