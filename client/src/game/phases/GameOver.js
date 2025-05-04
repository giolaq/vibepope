import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import {
  EmojiEvents,
  Replay,
  MoodBad,
  Star,
  Group,
  CheckCircle,
  Home
} from '@mui/icons-material';
import { useGame, GAME_PHASES } from '../GameState';
import { useNavigate } from 'react-router-dom';

// Default image if cardinal photo is missing
const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image+Available';

function GameOver() {
  const { player, winner, alliances, cardinals, resetGame, gameLog } = useGame();
  const navigate = useNavigate();
  
  // Determine if player won
  const playerWon = winner && winner.id === player.id;
  
  // Determine if player supported the winner through alliances
  const playerSupportedWinner = winner && 
    alliances.some(alliance => 
      alliance.members.includes(player.id) && 
      alliance.members.includes(winner.id)
    );
  
  // Calculate player's score
  const calculatePlayerScore = () => {
    let score = 0;
    
    // Base points for just playing
    score += 100;
    
    // Bonus for winning
    if (playerWon) {
      score += 1000;
    }
    
    // Bonus for supporting the winner
    if (playerSupportedWinner) {
      score += 500;
    }
    
    // Points for alliances formed
    const playerAllianceCount = alliances.filter(a => a.members.includes(player.id)).length;
    score += playerAllianceCount * 50;
    
    // Add player stats
    score += (player.piety + player.influence + player.diplomacy + player.popularity) * 10;
    
    return score;
  };
  
  // Player's final score
  const playerScore = calculatePlayerScore();
  
  // Handle restarting the game
  const handleRestart = () => {
    resetGame();
  };
  
  // Handle returning to home
  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <Box>
      <Typography variant="h3" gutterBottom align="center">
        <EmojiEvents color="primary" sx={{ mr: 1, verticalAlign: 'middle', fontSize: 40 }} />
        Conclave Concluded
      </Typography>
      
      <Typography variant="h5" align="center" paragraph color="text.secondary">
        {playerWon 
          ? "Congratulations! You have been elected as the new Pope!" 
          : `${winner?.name} has been elected as the new Pope.`}
      </Typography>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Results card */}
      <Card sx={{ mb: 4, overflow: 'hidden' }}>
        <Grid container>
          <Grid item xs={12} md={5}>
            <CardMedia
              component="img"
              sx={{ 
                height: { xs: 250, md: '100%' }, 
                objectFit: 'contain', 
                bgcolor: '#f5f5f5',
                objectPosition: 'center'
              }}
              image={winner?.photo_url || "https://upload.wikimedia.org/wikipedia/commons/e/e8/San_pietro_da_prati_di_castello.jpg"}
              alt={winner?.name}
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                {winner?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                From {winner?.country}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {winner?.traits?.map((trait, index) => (
                  <Chip 
                    key={index} 
                    label={trait} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              
              <Typography variant="body1" paragraph>
                With qualities of piety ({winner?.piety}/10), influence ({winner?.influence}/10), 
                and diplomacy ({winner?.diplomacy}/10), {winner?.name} has secured the necessary 
                votes to lead the Catholic Church.
              </Typography>
              
              {playerWon ? (
                <Paper elevation={3} sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText', mb: 2 }}>
                  <Typography variant="subtitle1">
                    <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                    You have been elected as Pope! Your leadership and diplomacy have earned you
                    the highest office in the Catholic Church.
                  </Typography>
                </Paper>
              ) : playerSupportedWinner ? (
                <Paper elevation={3} sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText', mb: 2 }}>
                  <Typography variant="subtitle1">
                    <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
                    You supported the winning candidate through your alliance. Your influence helped
                    shape the outcome of the conclave.
                  </Typography>
                </Paper>
              ) : (
                <Paper elevation={3} sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText', mb: 2 }}>
                  <Typography variant="subtitle1">
                    <MoodBad sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Your preferred candidate did not win this conclave. Continue to serve the Church
                    under the new leadership.
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Grid>
        </Grid>
      </Card>
      
      {/* Player stats */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Your Performance
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <Star color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Final Score: {playerScore} points
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your score is based on the outcome, alliances, and your cardinal's attributes.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <Group color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Alliances Formed: {alliances.filter(a => a.members.includes(player.id)).length}
              </Typography>
              <Typography variant="body2" paragraph>
                You formed strategic relationships with other cardinals to influence the conclave.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Game Outcome
            </Typography>
            <Box sx={{ pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
              {playerWon ? (
                <Typography variant="body1">
                  You were elected as the new Pope! Your leadership will guide the Church forward.
                </Typography>
              ) : playerSupportedWinner ? (
                <Typography variant="body1">
                  You supported {winner?.name} who became Pope. Your influence will be remembered.
                </Typography>
              ) : (
                <Typography variant="body1">
                  {winner?.name} was elected despite your efforts. There will always be another conclave.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Replay />}
          onClick={handleRestart}
          size="large"
        >
          Play Again
        </Button>
        <Button 
          variant="outlined" 
          color="primary"
          startIcon={<Home />}
          onClick={handleReturnHome}
          size="large"
        >
          Return to Home
        </Button>
      </Box>
    </Box>
  );
}

export default GameOver; 