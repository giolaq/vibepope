import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { useGame, GAME_PHASES } from './GameState';
import CharacterCreation from './phases/CharacterCreation';
import AlliancePhase from './phases/AlliancePhase';
import VotingPhase from './phases/VotingPhase';
import EventPhase from './phases/EventPhase';
import GameOver from './phases/GameOver';
import Introduction from './phases/Introduction';
import GameLog from './components/GameLog';
import PlayerStats from './components/PlayerStats';
import { useTheme } from '@mui/material/styles';

function Game() {
  const theme = useTheme();
  const { phase, player, loading, error } = useGame();

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5">
          Gathering Cardinals for the Conclave...
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Box className="loading-animation">
            <Box className="smoke"></Box>
            <Box className="smoke smoke-2"></Box>
            <Box className="smoke smoke-3"></Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          textAlign: 'center',
          bgcolor: 'error.light',
          color: 'error.contrastText'
        }}
      >
        <Typography variant="h5" gutterBottom>
          An Error Occurred
        </Typography>
        <Typography>
          {error}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Please try refreshing the page.
        </Typography>
      </Paper>
    );
  }

  // Render current game phase
  const renderGamePhase = () => {
    switch (phase) {
      case GAME_PHASES.INTRODUCTION:
        return <Introduction />;
      case GAME_PHASES.CHARACTER_SELECTION:
        return <CharacterCreation />;
      case GAME_PHASES.ALLIANCE_PHASE:
        return <AlliancePhase />;
      case GAME_PHASES.VOTING_PHASE:
        return <VotingPhase />;
      case GAME_PHASES.EVENT_PHASE:
        return <EventPhase />;
      case GAME_PHASES.GAME_OVER:
        return <GameOver />;
      default:
        return <Introduction />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ position: 'relative' }}>
        <Paper 
          elevation={6} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            borderRadius: { xs: 1, md: 2 },
            backgroundImage: 'url(https://www.vatican.va/content/dam/vatican/images/mosaici/mosaici_sistina.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid rgba(180, 180, 180, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(2px)',
              borderRadius: 'inherit',
              zIndex: 0,
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              align="center" 
              gutterBottom
              sx={{ 
                color: theme.palette.primary.main,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                fontFamily: '"Cinzel", serif',
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                mt: { xs: 1, md: 2 }
              }}
            >
              Conclave: The Papal Election
            </Typography>
            
            {player && (
              <Typography 
                variant="h6" 
                align="center" 
                gutterBottom
                sx={{ 
                  mb: { xs: 2, md: 4 },
                  fontStyle: 'italic',
                  color: theme.palette.text.secondary,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                }}
              >
                Playing as: {player.name} from {player.country}
              </Typography>
            )}
            
            {/* Game content container */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 3 },
              }}
            >
              {/* Main game area */}
              <Box 
                sx={{ 
                  flex: 3,
                  minHeight: { xs: '300px', md: '400px' },
                }}
              >
                {renderGamePhase()}
              </Box>
              
              {/* Right sidebar - only show when player has been selected */}
              {player && (
                <Box 
                  sx={{ 
                    flex: { xs: 'auto', md: 1 },
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: phase !== GAME_PHASES.VOTING_PHASE ? 'row' : 'column', md: 'column' },
                    gap: { xs: 2, md: 3 },
                  }}
                >
                  <Box sx={{ flex: { xs: '1', sm: phase !== GAME_PHASES.VOTING_PHASE ? '1' : 'auto', md: 'auto' } }}>
                    <PlayerStats />
                  </Box>
                  <Box sx={{ flex: { xs: '1', sm: phase !== GAME_PHASES.VOTING_PHASE ? '1' : 'auto', md: 'auto' } }}>
                    <GameLog />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
      
      {/* CSS for loading animation */}
      <Box sx={{
        '@keyframes smokeAnimation': {
          '0%': { transform: 'translateY(0) scaleX(1)', opacity: 0.3 },
          '100%': { transform: 'translateY(-60px) scaleX(1.5)', opacity: 0 }
        },
        '.loading-animation': {
          position: 'relative',
          width: '100px',
          height: '100px',
          margin: '0 auto',
        },
        '.smoke': {
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'rgba(200, 200, 200, 0.4)',
          transform: 'translateX(-50%)',
          animation: 'smokeAnimation 2s infinite',
        },
        '.smoke-2': {
          animationDelay: '0.7s',
          left: '40%',
        },
        '.smoke-3': {
          animationDelay: '1.4s',
          left: '60%',
        }
      }} />
    </Container>
  );
}

export default Game; 