import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  HowToVote, 
  Groups, 
  Event, 
  EmojiEvents,
  ArrowForward,
} from '@mui/icons-material';
import { useGame, GAME_PHASES } from '../GameState';

function Introduction() {
  const { setPhase } = useGame();

  const handleStart = () => {
    setPhase(GAME_PHASES.CHARACTER_SELECTION);
    
    // Dispatch custom event to notify the Home component
    const customEvent = new CustomEvent('beginConclaveClicked', { 
      bubbles: true 
    });
    window.dispatchEvent(customEvent);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        Welcome to the Conclave
      </Typography>
      
      <Typography variant="body1" paragraph>
        The Pope has passed away, and the College of Cardinals has been summoned to the Vatican 
        for the sacred ritual of electing a new Pope. As a Cardinal, you will participate in this
        ancient tradition, navigating the complex politics of the Church to either secure your own
        election or support a candidate who aligns with your vision for the Church's future.
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h5" gutterBottom>
        How to Play
      </Typography>
      
      <List>
        <ListItem>
          <ListItemIcon>
            <HowToVote color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Voting" 
            secondary="Cast votes for cardinals who align with your interests. Each vote brings a candidate closer to the 2/3 majority needed to become Pope." 
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <Groups color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Alliances" 
            secondary="Form strategic alliances with other cardinals to increase your influence and gather more votes." 
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <Event color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Events" 
            secondary="Respond to unexpected events that may shift alliances, change voting patterns, or reveal new information." 
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <EmojiEvents color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Victory" 
            secondary="Win by either becoming Pope yourself or by supporting the successful candidate from the beginning." 
          />
        </ListItem>
      </List>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ textAlign: 'center' }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            bgcolor: 'primary.light', 
            color: 'primary.contrastText',
            maxWidth: '600px',
            mx: 'auto',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom align="center">
            "Habemus Papam"
          </Typography>
          <Typography variant="body1" paragraph align="center" sx={{ fontStyle: 'italic' }}>
            "We have a Pope" - The famous announcement after a successful conclave election
          </Typography>
          <Typography variant="body2" align="center">
            Your journey begins with choosing your cardinal from a randomly selected group. Each has unique strengths, 
            weaknesses, and traits that will shape your path to the papacy. Choose wisely, as your cardinal's attributes
            will greatly influence your chances of success.
          </Typography>
        </Paper>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={handleStart}
          endIcon={<ArrowForward />}
          sx={{ 
            px: 4, 
            py: 1.5,
            borderRadius: 8,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            }
          }}
        >
          Begin the Conclave
        </Button>
      </Box>
    </Box>
  );
}

export default Introduction; 