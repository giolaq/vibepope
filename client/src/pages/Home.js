import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Zoom,
  Fab,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  HowToVote, 
  Groups, 
  EventNote, 
  Church,
  EmojiEvents,
  CheckCircle,
  PlayArrow,
  Gavel,
} from '@mui/icons-material';
import Game from '../game/Game';
import { GameProvider, useGame, GAME_PHASES } from '../game/GameState';

// Main component wrapper that uses GameProvider
function HomeWrapper() {
  return (
    <GameProvider>
      <Home />
    </GameProvider>
  );
}

// Home component that has access to the game state
function Home() {
  const theme = useTheme();
  const { phase, setPhase, player, selectPlayerCardinal, cardinals } = useGame();
  const gameRef = useRef(null);
  const [selectedCardinal, setSelectedCardinal] = useState(null);
  
  // Set up gameRef after component mounts
  useEffect(() => {
    gameRef.current = document.getElementById('game-section');
  }, []);

  // Subscribe to selected cardinal changes from the CharacterCreation component
  useEffect(() => {
    const handleCardinalSelected = (event) => {
      if (event.detail && event.detail.cardinal) {
        setSelectedCardinal(event.detail.cardinal);
      }
    };

    const handleBeginConclaveClicked = () => {
      // Respond to Begin Conclave button click from Introduction component
      gameRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleStartVotingClicked = () => {
      // Respond to Start Voting button click from AlliancePhase component
      gameRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    window.addEventListener('cardinalSelected', handleCardinalSelected);
    window.addEventListener('beginConclaveClicked', handleBeginConclaveClicked);
    window.addEventListener('startVotingClicked', handleStartVotingClicked);
    
    return () => {
      window.removeEventListener('cardinalSelected', handleCardinalSelected);
      window.removeEventListener('beginConclaveClicked', handleBeginConclaveClicked);
      window.removeEventListener('startVotingClicked', handleStartVotingClicked);
    };
  }, []);

  // Confirm selection handler
  const handleConfirmSelection = () => {
    if (selectedCardinal) {
      selectPlayerCardinal(selectedCardinal);
      setSelectedCardinal(null);
      
      // Scroll to game section
      gameRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Begin conclave handler
  const handleBeginConclave = () => {
    setPhase(GAME_PHASES.CHARACTER_SELECTION);
    
    // Scroll to game section
    gameRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Start voting handler
  const handleStartVoting = () => {
    setPhase(GAME_PHASES.VOTING_PHASE);
    
    // Scroll to game section
    gameRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Render the appropriate sticky button based on the current phase
  const renderStickyButton = () => {
    switch (phase) {
      case GAME_PHASES.INTRODUCTION:
        return (
          <Zoom in={true} timeout={500}>
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
                borderTop: `1px solid ${theme.palette.divider}`,
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleBeginConclave}
                startIcon={<PlayArrow />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 'bold',
                  fontFamily: '"IM Fell English SC", serif',
                  boxShadow: '0 4px 8px rgba(183, 28, 28, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(183, 28, 28, 0.5)',
                  }
                }}
              >
                Begin the Conclave
              </Button>
            </Box>
          </Zoom>
        );
        
      case GAME_PHASES.CHARACTER_SELECTION:
        return (
          <Zoom in={true} timeout={500}>
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
                borderTop: `1px solid ${theme.palette.divider}`,
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Tooltip 
                title={selectedCardinal 
                  ? `Confirm selection of ${selectedCardinal.name}` 
                  : "Select a cardinal first"
                } 
                placement="top"
                arrow
              >
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={!selectedCardinal}
                    onClick={handleConfirmSelection}
                    startIcon={<CheckCircle />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 'bold',
                      fontFamily: '"IM Fell English SC", serif',
                      boxShadow: '0 4px 8px rgba(183, 28, 28, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 12px rgba(183, 28, 28, 0.5)',
                      }
                    }}
                  >
                    {selectedCardinal 
                      ? `Confirm: ${selectedCardinal.name}` 
                      : "Select a Cardinal First"
                    }
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Zoom>
        );
        
      case GAME_PHASES.ALLIANCE_PHASE:
        return (
          <Zoom in={true} timeout={500}>
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
                borderTop: `1px solid ${theme.palette.divider}`,
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleStartVoting}
                startIcon={<Gavel />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 'bold',
                  fontFamily: '"IM Fell English SC", serif',
                  boxShadow: '0 4px 8px rgba(183, 28, 28, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(183, 28, 28, 0.5)',
                  }
                }}
              >
                Proceed to Voting
              </Button>
            </Box>
          </Zoom>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section with Vatican Background */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 6,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/vatican.jpg)`,
          height: '60vh',
          minHeight: '400px',
          overflow: 'hidden',
          animation: 'slowZoom 30s infinite alternate',
          '@keyframes slowZoom': {
            '0%': {
              backgroundSize: '100%',
            },
            '100%': {
              backgroundSize: '110%',
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for better text readability
            zIndex: 1
          }
        }}
      >
        <Container
          sx={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <Typography
            component="h1"
            variant="h2"
            color="inherit"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontFamily: '"IM Fell English SC", serif',
            }}
          >
            Conclave: The Papal Election
          </Typography>
          <Typography 
            variant="h5" 
            color="inherit" 
            paragraph
            sx={{
              maxWidth: '800px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              fontFamily: '"Gentium Book Basic", serif',
            }}
          >
            Participate in the sacred tradition of electing a new Pope. 
            Form alliances, cast your votes, and navigate the politics of the Vatican.
          </Typography>
        </Container>
      </Paper>

      {/* Render sticky button based on current phase */}
      {renderStickyButton()}

      {/* Game Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Experience the Sacred Election
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Immerse yourself in the politics, tradition, and intrigue of the papal election
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: 6
              }
            }}>
              <HowToVote color="primary" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Strategic Voting
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cast your vote for the next Pope, or even campaign to become Pope yourself.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: 6
              }
            }}>
              <Groups color="primary" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Form Alliances
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Build relationships with other cardinals to increase your influence in the conclave.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: 6
              }
            }}>
              <EventNote color="primary" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Dynamic Events
              </Typography>
              <Typography variant="body2" color="text.secondary">
                React to unexpected events that may shift alliances or change the direction of the conclave.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: 6
              }
            }}>
              <EmojiEvents color="primary" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Multiple Victories
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Win by becoming Pope yourself or by supporting the successful candidate from the beginning.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Game Section */}
      <Container maxWidth="lg" sx={{ 
        my: 8, 
        pb: [GAME_PHASES.INTRODUCTION, GAME_PHASES.CHARACTER_SELECTION, GAME_PHASES.ALLIANCE_PHASE].includes(phase) ? 16 : 0 
      }} id="game-section">
        <Typography variant="h3" align="center" gutterBottom>
          Enter the Conclave
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Experience the strategy and intrigue of a papal election
        </Typography>
        <Divider sx={{ mb: 6 }} />

        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}>
          <Game />
        </Suspense>
      </Container>

      {/* Historical Context */}
      <Box sx={{ bgcolor: 'grey.100', py: 8, mt: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            <Church color="primary" sx={{ mr: 1, verticalAlign: 'bottom' }} />
            The History of the Conclave
          </Typography>
          <Typography variant="body1" paragraph>
            The papal conclave is the meeting of the College of Cardinals convened to elect a new Bishop of Rome, 
            who becomes the Pope. The word "conclave" comes from the Latin cum clave, meaning "with a key," 
            referring to the tradition of locking the cardinals within the Sistine Chapel until they 
            reach a decision.
          </Typography>
          <Typography variant="body1" paragraph>
            The tradition dates back to the 13th century when, after a papal election in Viterbo, Italy 
            had gone on for nearly three years, the local population removed the roof from the building 
            where the cardinals were meeting and restricted their food to bread and water to encourage 
            a faster decision.
          </Typography>
          <Typography variant="body1">
            Today, the conclave is a highly secretive and ceremonial process, with cardinals taking an 
            oath of secrecy and being completely sequestered from the outside world. The famous white 
            smoke rising from the Sistine Chapel chimney signals to the world that a new Pope has been elected.
          </Typography>
        </Container>
      </Box>

      {/* Add animation keyframes */}
      <Box
        sx={{
          '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
          },
          '@keyframes slideUp': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          },
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }}
      />
    </Box>
  );
}

export default HomeWrapper; 