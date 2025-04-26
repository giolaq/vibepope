import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Link
} from '@mui/material';
import {
  DataObject as DataIcon,
  Storage as DatabaseIcon,
  Code as CodeIcon,
  Description as ApiIcon,
  Cloud as WebIcon,
  Info as InfoIcon
} from '@mui/icons-material';

function About() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          About VibePope
        </Typography>
        
        <Typography variant="h5" paragraph align="center" color="text.secondary" sx={{ mb: 4 }}>
          Your ultimate guide to finding the next holy fashionista in the big white hat!
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
          <Typography variant="h4" gutterBottom>
            What's This All About?
          </Typography>
          
          <Typography variant="body1" paragraph>
            VibePope is your fun but respectful guide to the world of cardinals - those red-robed church VIPs 
            who might one day be promoted to the ultimate job: Pope! We wanted to make information about these 
            important church leaders more accessible and entertaining, while still honoring their significant roles.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Think of this as your holy scouting report! We've gathered data from various reputable sources, including 
            the Vatican's official website, to give you the lowdown on each cardinal's background, achievements, and 
            papal potential. Is your favorite cardinal papal material? Browse and decide for yourself!
          </Typography>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h4" gutterBottom>
            Where We Get The Holy Data
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <DataIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Vatican Official Website" 
                secondary="The most blessed source of cardinal information (no fake news here!)" 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Wikipedia" 
                secondary="For when we need a little extra holy history" 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <WebIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="News Sources" 
                secondary="Keeping up with cardinal current events (holy headlines!)" 
              />
            </ListItem>
          </List>
        </Paper>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  How We Built This Divine App
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <DatabaseIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Holy Data Collection" 
                      secondary="Web scraping with reverent care (and proper permissions!)" 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CodeIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Blessed Frontend" 
                      secondary="React.js with Material-UI for heavenly user experience" 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <ApiIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Sacred Backend" 
                      secondary="Node.js with Express providing divine data services" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Our Holy Mission
                </Typography>
                
                <Typography variant="body1" paragraph>
                  VibePope aims to:
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="• Make cardinal-watching fun and accessible (move over, bird watching!)" 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="• Help you discover your favorite potential pope before they're famous" 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="• Provide accurate information with a smile (no holy misinformation here)" 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="• Show that tech and tradition can mix (like communion wine and wafers)" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            A Holy Disclaimer
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            VibePope is for entertainment and educational purposes only. 
            While we bring the fun, we maintain deep respect for the Catholic Church and its leaders.
            This is not an official Vatican production (though we think they'd enjoy it!).
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Want to contribute to our divine mission? The source code is available on{' '}
            <Link href="https://github.com/example/vibepope" target="_blank" rel="noopener">
              GitHub
            </Link>.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default About; 