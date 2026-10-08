"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Container, Stack, Grid } from '@mui/material';
import { AccountTree, EditDocument, Settings, OpenInNew } from '@mui/icons-material';
import CalculatorView from './CalculatorView';

export default function Scope3View({ user, onLogout }: { user: any, onLogout: () => void }) {
  const trialExpired = user.trialStatus === 'expired';
  
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!user.trialExpiresAt || trialExpired) return;
    
    const calculateTimeLeft = () => {
      const difference = new Date(user.trialExpiresAt).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        let parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);
        
        setTimeLeft(parts.join(' '));
      } else {
        setTimeLeft('Expired');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [user.trialExpiresAt, trialExpired]);
  
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Header */}
      <Box className='border border-black p-6 rounded-3xl' sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
        <Box>
          <Typography variant="h4" className='text-black' sx={{ fontWeight: 800 }}>SustainOS Workspace</Typography>
          <Typography variant="body1" className='text-black'>Organization: {user.organization}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user.name}</Typography>
            <Typography variant="caption" className='text-black'>{user.email}</Typography>
          </Box>
          <Button variant="outlined" color="error" onClick={onLogout} sx={{ borderRadius: 2 }}>
            Log Out
          </Button>
        </Box>
      </Box>

      {trialExpired ? (
        <Card sx={{ borderRadius: 4, p: { xs: 4, md: 8 }, textAlign: 'center', borderColor: 'primary.main', borderWidth: 2, borderStyle: 'solid' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>
            Your SustainOS trial has ended.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 5, maxWidth: 700, mx: 'auto' }}>
            Your data and calculations are saved safely. Continue using SustainOS to manage your organization's complete carbon footprint, including full Scope 3 tracking, reports, and more.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
            <Button variant="contained" size="large">Continue with SustainOS</Button>
            <Button variant="outlined" color="inherit" size="large">Talk to Sales</Button>
          </Stack>
        </Card>
      ) : (
        <Stack spacing={4}>
          <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)' }}>
            <CardContent sx={{ p: { xs: 4, md: 6 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ mb: { xs: 3, md: 0 } }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                  Welcome to SustainOS
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                  <span>Your 3-day trial is active until {new Date(user.trialExpiresAt).toLocaleDateString()}.</span>
                  {timeLeft && (
                    <Box component="span" sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1.5, color: 'white', fontWeight: 600, fontSize: '0.85em', letterSpacing: 0.5 }}>
                      EXPIRES IN: {timeLeft}
                    </Box>
                  )}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Box sx={{ px: 2, py: 1, borderRadius: 2, border: 1, borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  Scope 1
                </Box>
                <Box sx={{ px: 2, py: 1, borderRadius: 2, border: 1, borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  Scope 2
                </Box>
                <Box sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>
                  Scope 3
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 4, height: '100%', '&:hover': { borderColor: 'primary.main', cursor: 'pointer' } }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ width: 56, height: 56, bgcolor: 'rgba(217, 119, 50, 0.1)', color: 'primary.main', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <AccountTree fontSize="large" />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Scope 3 Calculator</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Calculate supply chain, business travel, and value chain emissions.
                  </Typography>
                  <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                    Start calculating →
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 4, height: '100%', '&:hover': { borderColor: 'primary.main', cursor: 'pointer' } }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ width: 56, height: 56, bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'text.primary', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <EditDocument fontSize="large" />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Data Collection</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Send questionnaires to suppliers and collect primary data directly.
                  </Typography>
                  <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700 }}>
                    View forms →
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 4, height: '100%', '&:hover': { borderColor: 'primary.main', cursor: 'pointer' } }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ width: 56, height: 56, bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'text.primary', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <Settings fontSize="large" />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Facility Setup</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Configure your organizational boundaries and map facilities.
                  </Typography>
                  <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700 }}>
                    Configure →
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
              Your Pro Calculator
            </Typography>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper' }}>
              <CalculatorView isPro={true} />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderRadius: 4, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Need to calculate Scope 1 and 2 quickly?
            </Typography>
            <Button href="/" color="primary" endIcon={<OpenInNew />}>
              Home Page
            </Button>
          </Box>
        </Stack>
      )}
    </Container>
  );
}
