import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Handshake,
  Close,
  Check,
  Psychology,
  Public,
  ForwardOutlined,
} from '@mui/icons-material';
import { useGame, GAME_PHASES } from '../GameState';

// Default image if cardinal photo is missing
const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image+Available';

function AlliancePhase() {
  const { 
    cardinals, 
    player, 
    alliances, 
    formAlliance, 
    setPhase, 
    round, 
    addToGameLog 
  } = useGame();
  
  const [selectedCardinal, setSelectedCardinal] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [allianceSuccess, setAllianceSuccess] = useState(null);
  
  // Filter out player's cardinal and already allied cardinals
  const availableCardinals = cardinals.filter(cardinal => {
    // Skip player's own cardinal
    if (cardinal.id === player.id) return false;
    
    // Skip cardinals already in alliance with player
    const alreadyAllied = alliances.some(alliance => 
      alliance.members.includes(player.id) && 
      alliance.members.includes(cardinal.id)
    );
    return !alreadyAllied;
  });

  // Handle selecting a cardinal for potential alliance
  const handleSelectCardinal = (cardinal) => {
    setSelectedCardinal(cardinal);
    setDialogOpen(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setAllianceSuccess(null);
  };

  // Attempt to form an alliance
  const handleAttemptAlliance = () => {
    if (!selectedCardinal) return;
    
    // Calculate success chance based on player's diplomacy and cardinal's traits
    const playerDiplomacy = player.diplomacy;
    const targetReceptiveness = calculateReceptiveness(selectedCardinal, player);
    
    // Success probability (between 0.3 and 0.9 depending on factors)
    const successProbability = Math.min(0.9, 0.3 + (playerDiplomacy / 20) + (targetReceptiveness / 10));
    
    // Roll for success
    const roll = Math.random();
    const success = roll <= successProbability;
    
    if (success) {
      // Create alliance with a strength based on combined stats
      const allianceStrength = Math.floor((playerDiplomacy + selectedCardinal.influence) / 2);
      formAlliance(player.id, selectedCardinal.id, allianceStrength);
      
      addToGameLog({
        type: 'success',
        message: `You successfully formed an alliance with ${selectedCardinal.name}.`
      });
    } else {
      addToGameLog({
        type: 'failure',
        message: `${selectedCardinal.name} rejected your alliance proposal.`
      });
    }
    
    setAllianceSuccess(success);
  };

  // Calculate how receptive a cardinal would be to an alliance
  const calculateReceptiveness = (target, player) => {
    let score = 5; // Base score
    
    // Similar ideology bonus
    if (target.conservative === player.conservative) {
      score += 2;
    }
    
    // Regional bonus (same country)
    if (target.country === player.country) {
      score += 3;
    }
    
    // Trait-based modifiers
    if (target.traits) {
      if (target.traits.includes('Diplomatic')) score += 2;
      if (target.traits.includes('Ambitious')) score -= 1;
      if (target.traits.includes('Well-connected')) score += 1;
    }
    
    return Math.min(10, Math.max(1, score)); // Ensure score is between 1-10
  };

  // Proceed to voting phase
  const handleProceedToVoting = () => {
    setPhase(GAME_PHASES.VOTING_PHASE);
    
    // Dispatch custom event to notify the Home component
    const customEvent = new CustomEvent('startVotingClicked', { 
      bubbles: true 
    });
    window.dispatchEvent(customEvent);
  };

  // Get player's current alliances
  const playerAlliances = alliances.filter(alliance => 
    alliance.members.includes(player.id)
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        Alliance Formation - Round {round}
      </Typography>
      
      <Typography variant="body1" paragraph align="center">
        Form strategic alliances with other cardinals to increase your influence in the conclave.
        Strong alliances will provide voting support in later rounds.
      </Typography>
      
      {/* Current alliances section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <Handshake color="primary" sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Your Current Alliances
        </Typography>
        
        {playerAlliances.length > 0 ? (
          <List>
            {playerAlliances.map((alliance, index) => {
              // Find the other cardinal in this alliance
              const alliedCardinalId = alliance.members.find(id => id !== player.id);
              const alliedCardinal = cardinals.find(c => c.id === alliedCardinalId);
              
              return (
                <ListItem key={index} divider={index < playerAlliances.length - 1}>
                  <ListItemAvatar>
                    <Avatar 
                      src={alliedCardinal?.photo_url || defaultImage}
                      alt={alliedCardinal?.name}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={alliedCardinal?.name}
                    secondary={`Alliance strength: ${alliance.strength}/10 | Country: ${alliedCardinal?.country}`}
                  />
                  <Chip 
                    label={`Strength: ${alliance.strength}`} 
                    color={alliance.strength > 5 ? "success" : "primary"}
                    variant="outlined"
                    size="small"
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            You haven't formed any alliances yet.
          </Typography>
        )}
      </Paper>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Available cardinals for alliance */}
      <Typography variant="h6" gutterBottom>
        Potential Allies
      </Typography>
      
      <Grid container spacing={3}>
        {availableCardinals.map((cardinal, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={cardinal.photo_url || defaultImage}
                    alt={cardinal.name}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6" component="h2">
                      {cardinal.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <Public fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      {cardinal.country}
                    </Typography>
                  </Box>
                </Box>
                
                {cardinal.traits && (
                  <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {cardinal.traits.map((trait, i) => (
                      <Chip 
                        key={i}
                        label={trait}
                        size="small"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" component="span" sx={{ minWidth: 120 }}>
                    <Psychology fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Receptiveness:
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculateReceptiveness(cardinal, player) * 10} 
                    sx={{ flex: 1, height: 8, borderRadius: 4 }} 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Ideology: {cardinal.conservative ? 'Conservative' : 'Progressive'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  startIcon={<Handshake />}
                  onClick={() => handleSelectCardinal(cardinal)}
                >
                  Propose Alliance
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={handleProceedToVoting}
          endIcon={<ForwardOutlined />}
          sx={{ px: 4 }}
        >
          Proceed to Voting
        </Button>
      </Box>
      
      {/* Alliance attempt dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Alliance Proposal
        </DialogTitle>
        <DialogContent>
          {!allianceSuccess ? (
            <>
              <Typography variant="h6" gutterBottom>
                Propose an alliance with {selectedCardinal?.name}?
              </Typography>
              <Typography paragraph>
                You are about to approach {selectedCardinal?.name} from {selectedCardinal?.country} 
                to form an alliance.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your Diplomacy: {player.diplomacy}/10
                <br />
                Cardinal's Receptiveness: {selectedCardinal ? calculateReceptiveness(selectedCardinal, player) : 0}/10
                <br />
                {selectedCardinal?.traits && `Cardinal's Traits: ${selectedCardinal.traits.join(', ')}`}
              </Typography>
              <Typography>
                Are you sure you want to propose this alliance?
              </Typography>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {allianceSuccess === true ? (
                <>
                  <Check sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" color="success.main" gutterBottom>
                    Alliance Formed!
                  </Typography>
                  <Typography>
                    {selectedCardinal?.name} has agreed to form an alliance with you.
                    This will provide support in the upcoming voting phases.
                  </Typography>
                </>
              ) : (
                <>
                  <Close sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                  <Typography variant="h5" color="error.main" gutterBottom>
                    Alliance Rejected
                  </Typography>
                  <Typography>
                    {selectedCardinal?.name} has declined your alliance proposal.
                    Perhaps try again in a future round or seek other allies.
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!allianceSuccess ? (
            <>
              <Button onClick={handleCloseDialog} color="inherit">
                Cancel
              </Button>
              <Button 
                onClick={handleAttemptAlliance} 
                variant="contained" 
                color="primary"
                startIcon={<Handshake />}
              >
                Propose Alliance
              </Button>
            </>
          ) : (
            <Button onClick={handleCloseDialog} variant="contained" color="primary">
              Continue
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AlliancePhase; 