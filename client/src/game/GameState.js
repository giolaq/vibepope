import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getCardinals } from '../services/api';

// Game phases
export const GAME_PHASES = {
  INTRODUCTION: 'introduction',
  CHARACTER_SELECTION: 'character_selection',
  ALLIANCE_PHASE: 'alliance_phase',
  VOTING_PHASE: 'voting_phase',
  EVENT_PHASE: 'event_phase',
  GAME_OVER: 'game_over'
};

// Initial game state
const initialState = {
  player: null, // Player's selected cardinal
  cardinals: [], // All available cardinals
  phase: GAME_PHASES.INTRODUCTION,
  round: 1,
  maxRounds: 5,
  votes: {}, // Track votes: { cardinalId: count }
  alliances: [], // Alliances between cardinals: [{ members: [cardinalId1, cardinalId2], strength: number }]
  events: [], // Game events that have occurred
  gameLog: [], // Log of game actions
  loading: true,
  error: null,
  winner: null, // Winner of the conclave
};

// Action types
const ACTION_TYPES = {
  SET_CARDINALS: 'SET_CARDINALS',
  SELECT_PLAYER_CARDINAL: 'SELECT_PLAYER_CARDINAL',
  SET_PHASE: 'SET_PHASE',
  ADD_ALLIANCE: 'ADD_ALLIANCE',
  REMOVE_ALLIANCE: 'REMOVE_ALLIANCE',
  CAST_VOTE: 'CAST_VOTE',
  TRIGGER_EVENT: 'TRIGGER_EVENT',
  ADD_LOG: 'ADD_LOG',
  NEXT_ROUND: 'NEXT_ROUND',
  SET_WINNER: 'SET_WINNER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET_GAME: 'RESET_GAME',
};

// Game state reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_CARDINALS:
      return {
        ...state,
        cardinals: action.payload,
        loading: false,
      };
    
    case ACTION_TYPES.SELECT_PLAYER_CARDINAL:
      return {
        ...state,
        player: action.payload,
        gameLog: [
          ...state.gameLog,
          { 
            type: 'selection', 
            message: `You have chosen to play as ${action.payload.name}.` 
          }
        ],
        phase: GAME_PHASES.ALLIANCE_PHASE,
      };
    
    case ACTION_TYPES.SET_PHASE:
      return {
        ...state,
        phase: action.payload,
        gameLog: [
          ...state.gameLog,
          { 
            type: 'phase', 
            message: `Phase changed to: ${action.payload}` 
          }
        ],
      };
    
    case ACTION_TYPES.ADD_ALLIANCE:
      return {
        ...state,
        alliances: [...state.alliances, action.payload],
        gameLog: [
          ...state.gameLog,
          { 
            type: 'alliance', 
            message: `New alliance formed between ${action.payload.members.map(id => {
              const cardinal = state.cardinals.find(c => c.id === id);
              return cardinal ? cardinal.name : 'Unknown Cardinal';
            }).join(' and ')}` 
          }
        ],
      };
    
    case ACTION_TYPES.REMOVE_ALLIANCE:
      return {
        ...state,
        alliances: state.alliances.filter(alliance => 
          !alliance.members.includes(action.payload.cardinal1Id) || 
          !alliance.members.includes(action.payload.cardinal2Id)
        ),
        gameLog: [
          ...state.gameLog,
          { 
            type: 'alliance', 
            message: `Alliance broken between cardinals.` 
          }
        ],
      };
    
    case ACTION_TYPES.CAST_VOTE:
      const newVotes = { ...state.votes };
      newVotes[action.payload.targetId] = (newVotes[action.payload.targetId] || 0) + 1;
      
      // Find cardinal names for log message
      const voter = state.cardinals.find(c => c.id === action.payload.voterId);
      const target = state.cardinals.find(c => c.id === action.payload.targetId);
      
      return {
        ...state,
        votes: newVotes,
        gameLog: [
          ...state.gameLog,
          { 
            type: 'vote', 
            message: `${voter ? voter.name : 'A cardinal'} voted for ${target ? target.name : 'another cardinal'}.` 
          }
        ],
      };
    
    case ACTION_TYPES.TRIGGER_EVENT:
      return {
        ...state,
        events: [...state.events, action.payload],
        gameLog: [
          ...state.gameLog,
          { 
            type: 'event', 
            message: `Event: ${action.payload.title} - ${action.payload.description}` 
          }
        ],
      };
    
    case ACTION_TYPES.ADD_LOG:
      return {
        ...state,
        gameLog: [...state.gameLog, action.payload],
      };
    
    case ACTION_TYPES.NEXT_ROUND:
      const newRound = state.round + 1;
      // Check if we've reached max rounds
      const newPhase = newRound > state.maxRounds 
        ? GAME_PHASES.GAME_OVER 
        : GAME_PHASES.ALLIANCE_PHASE;
      
      return {
        ...state,
        round: newRound,
        phase: newPhase,
        gameLog: [
          ...state.gameLog,
          { 
            type: 'round', 
            message: `Round ${newRound} has begun.` 
          }
        ],
      };
    
    case ACTION_TYPES.SET_WINNER:
      return {
        ...state,
        winner: action.payload,
        phase: GAME_PHASES.GAME_OVER,
        gameLog: [
          ...state.gameLog,
          { 
            type: 'winner', 
            message: `${action.payload.name} has been elected as the new Pope!` 
          }
        ],
      };
    
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case ACTION_TYPES.RESET_GAME:
      return {
        ...initialState,
        cardinals: state.cardinals, // Keep loaded cardinals
        loading: false,
      };
    
    default:
      return state;
  }
}

// Create context
const GameContext = createContext();

// Game provider component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load cardinals on initial render
  useEffect(() => {
    async function loadCardinals() {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        const data = await getCardinals(1, 50); // Get more cardinals for the game
        
        // Add game-specific attributes to cardinals
        const cardinalsWithGameStats = data.cardinals.map((cardinal, index) => ({
          ...cardinal,
          id: index, // Use index as ID for simplicity
          influence: Math.floor(Math.random() * 10) + 1, // 1-10
          piety: Math.floor(Math.random() * 10) + 1, // 1-10
          diplomacy: Math.floor(Math.random() * 10) + 1, // 1-10
          conservative: Math.random() > 0.5, // Random ideology
          popularity: Math.floor(Math.random() * 10) + 1, // 1-10
          traits: getRandomTraits(),
        }));
        
        dispatch({ type: ACTION_TYPES.SET_CARDINALS, payload: cardinalsWithGameStats });
      } catch (error) {
        console.error('Error loading cardinals for game:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: 'Failed to load cardinals for the game' });
      }
    }
    
    loadCardinals();
  }, []);

  // Helper function to generate random cardinal traits
  function getRandomTraits() {
    const allTraits = [
      'Charismatic', 'Scholarly', 'Conservative', 'Progressive', 'Diplomatic',
      'Devout', 'Political', 'Humble', 'Ambitious', 'Elderly', 'Traditionalist',
      'Reformer', 'Multilingual', 'Persuasive', 'Well-connected'
    ];
    
    // Randomly select 2-4 traits
    const numTraits = Math.floor(Math.random() * 3) + 2;
    const traits = [];
    
    for (let i = 0; i < numTraits; i++) {
      const randomIndex = Math.floor(Math.random() * allTraits.length);
      traits.push(allTraits[randomIndex]);
      allTraits.splice(randomIndex, 1); // Remove to avoid duplicates
    }
    
    return traits;
  }

  // Game action creators
  const selectPlayerCardinal = (cardinal) => {
    dispatch({ type: ACTION_TYPES.SELECT_PLAYER_CARDINAL, payload: cardinal });
  };

  const setPhase = (phase) => {
    dispatch({ type: ACTION_TYPES.SET_PHASE, payload: phase });
  };

  const formAlliance = (cardinal1Id, cardinal2Id, strength) => {
    dispatch({ 
      type: ACTION_TYPES.ADD_ALLIANCE, 
      payload: { 
        members: [cardinal1Id, cardinal2Id], 
        strength 
      } 
    });
  };

  const breakAlliance = (cardinal1Id, cardinal2Id) => {
    dispatch({ 
      type: ACTION_TYPES.REMOVE_ALLIANCE, 
      payload: { cardinal1Id, cardinal2Id } 
    });
  };

  const castVote = (voterId, targetId) => {
    dispatch({ 
      type: ACTION_TYPES.CAST_VOTE, 
      payload: { voterId, targetId } 
    });
  };

  const triggerEvent = (event) => {
    dispatch({ type: ACTION_TYPES.TRIGGER_EVENT, payload: event });
  };

  const nextRound = () => {
    dispatch({ type: ACTION_TYPES.NEXT_ROUND });
  };

  const declareWinner = (cardinal) => {
    dispatch({ type: ACTION_TYPES.SET_WINNER, payload: cardinal });
  };

  const resetGame = () => {
    dispatch({ type: ACTION_TYPES.RESET_GAME });
  };

  const addToGameLog = (entry) => {
    dispatch({ type: ACTION_TYPES.ADD_LOG, payload: entry });
  };

  // Computed values
  const voteResults = Object.entries(state.votes)
    .map(([cardinalId, count]) => ({
      cardinal: state.cardinals.find(c => c.id === parseInt(cardinalId)),
      count
    }))
    .sort((a, b) => b.count - a.count);

  // Combine state and actions to provide context value
  const value = {
    ...state,
    voteResults,
    selectPlayerCardinal,
    setPhase,
    formAlliance,
    breakAlliance,
    castVote,
    triggerEvent,
    nextRound,
    declareWinner,
    resetGame,
    addToGameLog,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 