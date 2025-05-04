import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Event,
  NotificationsActive,
  ArrowForward,
  Campaign,
  Info,
} from '@mui/icons-material';
import { useGame, GAME_PHASES } from '../GameState';

// Define game events
const GAME_EVENTS = [
  {
    id: 1,
    title: "External Influence",
    description: "Foreign governments attempt to influence the conclave through diplomatic channels.",
    choices: [
      { text: "Resist outside pressure", effect: "gain_piety", value: 2 },
      { text: "Consider diplomatic implications", effect: "gain_diplomacy", value: 2 },
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cardinals_at_the_2013_conclave.jpg"
  },
  {
    id: 2,
    title: "Media Scandal",
    description: "A newspaper publishes controversial allegations about a cardinal's past.",
    choices: [
      { text: "Defend the accused cardinal", effect: "form_alliance", value: "random" },
      { text: "Distance yourself from controversy", effect: "break_random_alliance", value: null },
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/9/90/Conclave_2013_at_the_Sistine_chapel.jpg"
  },
  {
    id: 3,
    title: "Theological Debate",
    description: "A heated discussion erupts about doctrinal interpretations.",
    choices: [
      { text: "Advocate for traditional positions", effect: "appeal_to_conservative", value: null },
      { text: "Argue for progressive reforms", effect: "appeal_to_progressive", value: null },
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c3/ChemineeSignatureElectionPapale.jpg"
  },
  {
    id: 4,
    title: "Health Concerns",
    description: "An elderly cardinal falls ill during the conclave.",
    choices: [
      { text: "Suggest pausing proceedings", effect: "gain_popularity", value: 1 },
      { text: "Insist on continuing without delay", effect: "lose_popularity", value: 1 },
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e8/San_pietro_da_prati_di_castello.jpg"
  },
  {
    id: 5,
    title: "Church Crisis Discussion",
    description: "Cardinals debate how to address declining global church attendance.",
    choices: [
      { text: "Propose new evangelization efforts", effect: "gain_influence", value: 2 },
      { text: "Advocate for structural reforms", effect: "randomize_votes", value: null },
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/3/32/Basilica_di_San_Pietro_-_facciata.jpg"
  },
  {
    id: 6,
    title: "Private Meeting",
    description: "A powerful cardinal invites you to a private conversation.",
    choices: [
      { text: "Accept the invitation", effect: "random_alliance_offer", value: null },
      { text: "Politely decline", effect: "gain_piety", value: 1 },
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/5/58/RomaVaticanCityStPeterBasilica.jpg"
  },
];

function EventPhase() {
  const { 
    player, 
    cardinals, 
    round, 
    setPhase, 
    nextRound, 
    alliances, 
    formAlliance, 
    breakAlliance, 
    addToGameLog, 
    triggerEvent 
  } = useGame();
  
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventResult, setEventResult] = useState(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  
  // Select a random event on component mount
  useEffect(() => {
    // Get a random event that hasn't been seen yet if possible
    const randomIndex = Math.floor(Math.random() * GAME_EVENTS.length);
    setCurrentEvent(GAME_EVENTS[randomIndex]);
  }, []);
  
  // Handle player choice for the event
  const handleEventChoice = (choice) => {
    if (!currentEvent) return;
    
    // Process the effect of the choice
    const result = processEventEffect(choice);
    setEventResult(result);
    
    // Log the event and choice
    addToGameLog({
      type: 'event',
      message: `Event: ${currentEvent.title} - You chose to ${choice.text.toLowerCase()}.`
    });
    
    // Trigger the event in the game state
    triggerEvent({
      title: currentEvent.title,
      description: currentEvent.description,
      choice: choice.text,
      result: result.message
    });
    
    // Show the result dialog
    setShowResultDialog(true);
  };
  
  // Process the effect of an event choice
  const processEventEffect = (choice) => {
    const { effect, value } = choice;
    let resultMessage = "";
    
    switch (effect) {
      case 'gain_piety':
        resultMessage = `Your piety has increased by ${value} points.`;
        // In a real implementation, we would update the player's stats here
        break;
        
      case 'gain_diplomacy':
        resultMessage = `Your diplomacy skill has increased by ${value} points.`;
        break;
        
      case 'gain_influence':
        resultMessage = `Your influence has increased by ${value} points.`;
        break;
        
      case 'gain_popularity':
        resultMessage = `Your popularity among the cardinals has increased.`;
        break;
        
      case 'lose_popularity':
        resultMessage = `Your popularity among the cardinals has decreased.`;
        break;
        
      case 'form_alliance':
        // Find a random cardinal who is not allied with the player
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
        
        if (availableCardinals.length > 0) {
          const randomCardinal = availableCardinals[Math.floor(Math.random() * availableCardinals.length)];
          const allianceStrength = Math.floor(Math.random() * 5) + 3; // 3-7 strength
          
          formAlliance(player.id, randomCardinal.id, allianceStrength);
          resultMessage = `You've formed a new alliance with ${randomCardinal.name}.`;
        } else {
          resultMessage = "You were unable to form any new alliances at this time.";
        }
        break;
        
      case 'break_random_alliance':
        // Find a random alliance the player has
        const playerAlliances = alliances.filter(alliance => 
          alliance.members.includes(player.id)
        );
        
        if (playerAlliances.length > 0) {
          const randomAlliance = playerAlliances[Math.floor(Math.random() * playerAlliances.length)];
          const otherCardinalId = randomAlliance.members.find(id => id !== player.id);
          const otherCardinal = cardinals.find(c => c.id === otherCardinalId);
          
          breakAlliance(player.id, otherCardinalId);
          resultMessage = `Your alliance with ${otherCardinal?.name || 'another cardinal'} has been broken.`;
        } else {
          resultMessage = "You had no alliances that could be affected.";
        }
        break;
        
      case 'appeal_to_conservative':
        resultMessage = "Conservative cardinals view you more favorably now.";
        // In a complete implementation, this would affect voting patterns
        break;
        
      case 'appeal_to_progressive':
        resultMessage = "Progressive cardinals view you more favorably now.";
        break;
        
      case 'randomize_votes':
        resultMessage = "Your proposal has stirred debate, potentially changing voting dynamics.";
        break;
        
      case 'random_alliance_offer':
        // Similar to form_alliance but with a chance of rejection
        const powerfulCardinals = cardinals.filter(cardinal => 
          cardinal.id !== player.id && 
          cardinal.influence > 7 && 
          !alliances.some(alliance => 
            alliance.members.includes(player.id) && 
            alliance.members.includes(cardinal.id)
          )
        );
        
        if (powerfulCardinals.length > 0) {
          const randomCardinal = powerfulCardinals[Math.floor(Math.random() * powerfulCardinals.length)];
          const allianceStrength = Math.floor(Math.random() * 3) + 6; // 6-8 strength (strong)
          
          // 70% chance of successful alliance
          if (Math.random() < 0.7) {
            formAlliance(player.id, randomCardinal.id, allianceStrength);
            resultMessage = `You've formed a strong alliance with ${randomCardinal.name}.`;
          } else {
            resultMessage = `${randomCardinal.name} was not interested in forming an alliance with you.`;
          }
        } else {
          resultMessage = "There were no powerful cardinals available for alliance.";
        }
        break;
        
      default:
        resultMessage = "The choice had no significant effect.";
    }
    
    return {
      effect,
      message: resultMessage
    };
  };
  
  // Handle continuing to the next round
  const handleContinue = () => {
    setShowResultDialog(false);
    // Move to the next round
    nextRound();
  };
  
  // If no event is loaded yet, show loading
  if (!currentEvent) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Loading Event...
        </Typography>
        <LinearProgress sx={{ maxWidth: 400, mx: 'auto' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        Conclave Event - Round {round}
      </Typography>
      
      <Typography variant="body1" paragraph align="center">
        An event has occurred that may impact the conclave. Your response will affect alliances,
        voting patterns, and your standing among the cardinals.
      </Typography>
      
      <Card sx={{ mb: 4, overflow: 'hidden' }}>
        <Box
          sx={{
            height: '200px',
            width: '100%',
            backgroundImage: `url(${currentEvent.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <NotificationsActive color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" gutterBottom>
              {currentEvent.title}
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            {currentEvent.description}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            How will you respond to this situation?
          </Typography>
        </CardContent>
        <Divider />
        <CardActions sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
          {currentEvent.choices.map((choice, index) => (
            <Button
              key={index}
              variant={index === 0 ? "contained" : "outlined"}
              color="primary"
              size="large"
              onClick={() => handleEventChoice(choice)}
              sx={{ flex: 1, mx: 1 }}
            >
              {choice.text}
            </Button>
          ))}
        </CardActions>
      </Card>
      
      {/* Event result dialog */}
      <Dialog 
        open={showResultDialog} 
        onClose={() => setShowResultDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Campaign sx={{ mr: 2 }} />
            Event Outcome
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            {currentEvent.title}
          </Typography>
          <Typography paragraph>
            You chose to {eventResult?.choice?.text || 'respond'}.
          </Typography>
          <Paper elevation={2} sx={{ p: 2, bgcolor: 'background.paper', my: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Info color="info" sx={{ mr: 1, mt: 0.5 }} />
              <Typography>
                {eventResult?.message}
              </Typography>
            </Box>
          </Paper>
          <Typography variant="body2" color="text.secondary">
            This outcome may affect alliances, voting patterns, and your influence
            in the conclave.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleContinue} 
            variant="contained" 
            color="primary"
            endIcon={<ArrowForward />}
          >
            Continue to Next Round
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EventPhase; 