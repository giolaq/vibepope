import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  useMediaQuery,
  Fade,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  HowToVote,
  Group,
  Gavel,
  ForwardOutlined,
  EventOutlined,
  Announcement,
  CheckCircleOutline,
  Person,
} from '@mui/icons-material';
import { useGame, GAME_PHASES } from '../GameState';

// Default image if cardinal photo is missing
const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image+Available';

function VotingPhase() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    cardinals, 
    player, 
    alliances, 
    votes, 
    castVote, 
    setPhase, 
    round, 
    addToGameLog,
    voteResults,
    declareWinner,
  } = useGame();
  
  const [playerVoted, setPlayerVoted] = useState(false);
  const [allVotesCast, setAllVotesCast] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [voteTargetId, setVoteTargetId] = useState(null);
  const [winnerDetermined, setWinnerDetermined] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [votingProgress, setVotingProgress] = useState(0);
  
  // Track which cardinals are voting for whom
  const [cardinalVotes, setCardinalVotes] = useState({});
  
  // Required votes to win (2/3 majority)
  const requiredVotes = Math.ceil((cardinals.length * 2) / 3);
  
  // Handle player casting a vote
  const handleCastVote = (targetCardinalId) => {
    // Show loading state
    setIsVoting(true);
    
    // Small delay to show the loading state
    setTimeout(() => {
      // Record the player's vote
      castVote(player.id, targetCardinalId);
      setPlayerVoted(true);
      setVoteTargetId(targetCardinalId);
      
      addToGameLog({
        type: 'vote',
        message: `You cast your vote for ${
          cardinals.find(c => c.id === targetCardinalId)?.name || 'Unknown Cardinal'
        }.`
      });
      
      // Start the AI cardinal voting simulation
      simulateCardinalVoting();
      setIsVoting(false);
    }, 800);
  };
  
  // Simulate other cardinals voting based on alliances and preferences
  const simulateCardinalVoting = async () => {
    const newCardinalVotes = { ...cardinalVotes };
    const aiCardinals = cardinals.filter(c => c.id !== player.id);
    
    // Calculate total cardinals for progress bar
    const totalCardinals = aiCardinals.length;
    let cardinalsVoted = 0;
    
    // Simulate each AI cardinal voting with a slight delay for effect
    for (const cardinal of aiCardinals) {
      // Skip if this cardinal already voted
      if (newCardinalVotes[cardinal.id]) continue;
      
      // Determine vote target based on alliances and other factors
      const voteTarget = determineCardinalVoteTarget(cardinal);
      
      // Cast the vote
      castVote(cardinal.id, voteTarget);
      newCardinalVotes[cardinal.id] = voteTarget;
      
      // Update state to show the voting progress
      cardinalsVoted++;
      setVotingProgress((cardinalsVoted / totalCardinals) * 100);
      setCardinalVotes({ ...newCardinalVotes });
      
      // Add a small delay between votes for dramatic effect
      // Use smaller delay on mobile for better UX
      await new Promise(resolve => setTimeout(resolve, isMobile ? 200 : 300));
    }
    
    setAllVotesCast(true);
    setSimulationComplete(true);
    
    // Add a small delay before showing results dialog on mobile
    setTimeout(() => {
      setShowResultsDialog(true);
      
      // Check if any cardinal has reached the required votes
      const winner = voteResults.find(result => result.count >= requiredVotes);
      
      if (winner) {
        setWinnerDetermined(true);
        // Add a small delay before showing the winner
        setTimeout(() => {
          declareWinner(winner.cardinal);
          addToGameLog({
            type: 'winner',
            message: `${winner.cardinal.name} has been elected as the new Pope with ${winner.count} votes.`
          });
        }, 1500);
      }
    }, isMobile ? 500 : 0);
  };
  
  // Determine which cardinal an AI cardinal will vote for
  const determineCardinalVoteTarget = (voter) => {
    // Cardinals in strong alliances with the voter get priority
    const voterAlliances = alliances.filter(alliance => 
      alliance.members.includes(voter.id) && alliance.strength > 5
    );
    
    if (voterAlliances.length > 0) {
      // Sort alliances by strength (strongest first)
      const sortedAlliances = [...voterAlliances].sort((a, b) => b.strength - a.strength);
      
      // Get allied cardinal IDs
      const alliedCardinalIds = sortedAlliances.map(alliance => 
        alliance.members.find(id => id !== voter.id)
      );
      
      // There's a good chance they'll vote for their strongest ally
      if (Math.random() < 0.7) {
        return alliedCardinalIds[0];
      }
    }
    
    // If not voting for an ally, pick based on cardinal stats
    // Cardinals might vote for themselves if they're ambitious
    if ((voter.traits && voter.traits.includes('Ambitious')) || voter.influence > 7) {
      if (Math.random() < 0.5) {
        return voter.id; // Vote for self
      }
    }
    
    // Otherwise, vote based on ideology and other factors
    const ideologicallyAligned = cardinals.filter(c => 
      c.id !== voter.id && 
      c.conservative === voter.conservative
    );
    
    if (ideologicallyAligned.length > 0) {
      // Sort by influence and popularity
      const sortedCandidates = [...ideologicallyAligned].sort((a, b) => 
        (b.influence + b.popularity) - (a.influence + a.popularity)
      );
      
      // Vote for the most influential ideologically aligned cardinal
      return sortedCandidates[0].id;
    }
    
    // Fallback - pick a random cardinal (other than self)
    const otherCardinals = cardinals.filter(c => c.id !== voter.id);
    const randomIndex = Math.floor(Math.random() * otherCardinals.length);
    return otherCardinals[randomIndex].id;
  };
  
  // Handle moving to next phase
  const handleContinue = () => {
    if (winnerDetermined) {
      setPhase(GAME_PHASES.GAME_OVER);
    } else {
      setPhase(GAME_PHASES.EVENT_PHASE);
    }
    setShowResultsDialog(false);
  };
  
  // Get voting results sorted by vote count
  const sortedResults = voteResults;

  // If voting is in progress, show a loading overlay
  if (isVoting) {
    return (
      <Fade in={true}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '50vh' 
        }}>
          <CircularProgress size={80} sx={{ mb: 4 }} />
          <Typography variant="h6" align="center" gutterBottom>
            Casting Your Vote...
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary">
            Your choice is being submitted to the conclave
          </Typography>
        </Box>
      </Fade>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        Voting Round {round}
      </Typography>
      
      <Typography variant="body1" paragraph align="center">
        Cast your vote for the cardinal you believe should become the next Pope.
        A candidate needs a two-thirds majority ({requiredVotes} votes) to be elected.
      </Typography>
      
      {!playerVoted ? (
        <>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 4 }, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HowToVote sx={{ fontSize: { xs: 32, md: 40 }, mr: { xs: 1, md: 2 } }} />
              <Typography variant="h6">
                Cast Your Vote
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Select a cardinal below to cast your vote. Choose wisely - your vote is crucial for forming alliances
              and determining the next Pope.
            </Typography>
          </Paper>
          
          <Grid container spacing={isMobile ? 2 : 3}>
            {cardinals.map((cardinal, index) => (
              <Grid item key={index} xs={6} sm={6} md={4}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: { xs: 1, md: 2 }, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => cardinal.id !== player.id && handleCastVote(cardinal.id)}
                >
                  <Avatar 
                    src={cardinal.photo_url || defaultImage}
                    alt={cardinal.name}
                    sx={{ 
                      width: { xs: 60, md: 80 }, 
                      height: { xs: 60, md: 80 }, 
                      mb: { xs: 1, md: 2 } 
                    }}
                  />
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    align="center" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                      lineHeight: 1.2,
                      mb: 1
                    }}
                  >
                    {cardinal.name}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    align="center" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                      mb: 1,
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    {cardinal.country}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', mb: 1 }}>
                    {/* Show alliance indicator if player has an alliance with this cardinal */}
                    {alliances.some(alliance => 
                      alliance.members.includes(player.id) && 
                      alliance.members.includes(cardinal.id)
                    ) && (
                      <Chip 
                        icon={!isMobile && <Group />} 
                        label={isMobile ? "Ally" : "Alliance"} 
                        color="success" 
                        size="small" 
                        sx={{ 
                          fontSize: { xs: '0.65rem', md: '0.75rem' },
                          height: { xs: 24, md: 32 }
                        }} 
                      />
                    )}
                    
                    {/* Self indicator if this is the player */}
                    {cardinal.id === player.id && (
                      <Chip 
                        icon={!isMobile && <Person />}
                        label="You" 
                        color="primary" 
                        size="small" 
                        sx={{ 
                          fontSize: { xs: '0.65rem', md: '0.75rem' },
                          height: { xs: 24, md: 32 }
                        }} 
                      />
                    )}
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    color="primary"
                    startIcon={!isMobile && <HowToVote />}
                    sx={{ 
                      mt: 'auto', 
                      width: '100%',
                      py: { xs: 0.5, md: 1 },
                      fontSize: { xs: '0.75rem', md: '0.875rem' }
                    }}
                    disabled={cardinal.id === player.id} // Can't vote for yourself
                  >
                    {isMobile ? "Vote" : "Cast Vote"}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 4 }, maxWidth: 600, mx: 'auto' }}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
              <CheckCircleOutline color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
              You have cast your vote
            </Typography>
            <Typography variant="body1">
              You voted for {cardinals.find(c => c.id === voteTargetId)?.name}.
              {!allVotesCast ? ' Other cardinals are now casting their votes...' : ''}
            </Typography>
          </Paper>
          
          {!allVotesCast ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress size={isMobile ? 40 : 60} sx={{ mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                Simulating cardinal votes...
              </Typography>
              
              {/* Progress bar for voting simulation */}
              <Box sx={{ width: '100%', maxWidth: 400, my: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={votingProgress} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 0.5 }}>
                  {Math.round(votingProgress)}% complete
                </Typography>
              </Box>
              
              {/* Scrollable area for vote results */}
              <Box 
                sx={{ 
                  width: '100%', 
                  maxWidth: 400, 
                  mt: 2,
                  maxHeight: { xs: 150, md: 200 },
                  overflowY: 'auto',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}
              >
                {Object.entries(cardinalVotes).length > 0 ? (
                  Object.entries(cardinalVotes).map(([voterId, targetId], index) => {
                    const voter = cardinals.find(c => c.id === parseInt(voterId));
                    const target = cardinals.find(c => c.id === parseInt(targetId));
                    
                    return (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                        <Chip 
                          size="small" 
                          label={index + 1} 
                          sx={{ mr: 1, height: 20, width: 20, fontSize: '0.6rem' }} 
                        />
                        {voter?.name} voted for {target?.name}
                      </Typography>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Waiting for first vote...
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setShowResultsDialog(true)}
              startIcon={<Announcement />}
              size={isMobile ? "medium" : "large"}
              sx={{ mt: 2 }}
            >
              View Vote Results
            </Button>
          )}
        </Box>
      )}
      
      {/* Voting results dialog */}
      <Dialog 
        open={showResultsDialog} 
        onClose={() => !simulationComplete && setShowResultsDialog(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 1, sm: 2, md: 3 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' },
            borderRadius: { xs: 1, md: 2 }
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Gavel sx={{ mr: { xs: 1, md: 2 }, fontSize: { xs: 20, md: 24 } }} />
            <Typography variant={isMobile ? "h6" : "h5"}>
              Voting Results - Round {round}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            The votes have been counted. A cardinal needs {requiredVotes} votes to be elected Pope.
          </Typography>
          
          <List sx={{ mb: 3 }}>
            {sortedResults.map((result, index) => (
              <ListItem 
                key={index}
                divider={index < sortedResults.length - 1}
                sx={{ 
                  bgcolor: result.count >= requiredVotes ? 'success.light' : 'transparent',
                  borderRadius: 1,
                  p: { xs: 1, md: 2 }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={result.cardinal?.photo_url || defaultImage}
                    alt={result.cardinal?.name}
                    sx={{ width: { xs: 40, md: 50 }, height: { xs: 40, md: 50 } }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant={isMobile ? "body1" : "h6"} sx={{ mr: 1 }}>
                      {result.cardinal?.name}
                    </Typography>
                  }
                  secondary={`From ${result.cardinal?.country}`}
                  primaryTypographyProps={{ 
                    fontSize: { xs: '0.9rem', md: '1rem' } 
                  }}
                  secondaryTypographyProps={{ 
                    fontSize: { xs: '0.75rem', md: '0.875rem' } 
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 0, md: 2 } }}>
                  <Chip 
                    label={`${result.count} votes`} 
                    color={result.count >= requiredVotes ? "success" : "primary"}
                    variant={result.count >= requiredVotes ? "filled" : "outlined"}
                    size={isMobile ? "small" : "medium"}
                    sx={{ 
                      mr: { xs: 0.5, md: 1 },
                      fontSize: { xs: '0.7rem', md: '0.875rem' }
                    }}
                  />
                  {result.count >= requiredVotes && (
                    <CheckCircleOutline 
                      color="success" 
                      sx={{ 
                        display: { xs: 'none', sm: 'block' },
                        fontSize: { sm: 20, md: 24 }
                      }} 
                    />
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
          
          {winnerDetermined ? (
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, md: 3 }, 
                bgcolor: 'success.light', 
                color: 'success.contrastText',
                borderRadius: { xs: 1, md: 2 }
              }}
            >
              <Typography variant={isMobile ? "h6" : "h5"} gutterBottom align="center">
                Habemus Papam!
              </Typography>
              <Typography variant={isMobile ? "body1" : "h6"} align="center">
                {sortedResults[0].cardinal?.name} has been elected as the new Pope!
              </Typography>
            </Paper>
          ) : (
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, md: 3 }, 
                bgcolor: 'info.light', 
                color: 'info.contrastText',
                borderRadius: { xs: 1, md: 2 }
              }}
            >
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom align="center">
                No Cardinal Has Reached The Required Majority
              </Typography>
              <Typography align="center">
                The conclave will continue to the next round.
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          <Button 
            onClick={handleContinue} 
            variant="contained" 
            color="primary"
            endIcon={winnerDetermined ? <Gavel /> : <EventOutlined />}
            fullWidth={isMobile}
            size={isMobile ? "medium" : "large"}
          >
            {winnerDetermined ? 'Proceed to Final Results' : 'Continue to Event Phase'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VotingPhase; 