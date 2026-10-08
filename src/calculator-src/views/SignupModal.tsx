"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, Stack, IconButton, InputAdornment 
} from '@mui/material';
import { Close as CloseIcon, ArrowForward as ArrowForwardIcon, Visibility, VisibilityOff } from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export default function SignupModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialStep = 'details'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: (user: any, token: string) => void;
  initialStep?: 'details' | 'login';
}) {
  const [step, setStep] = useState<'details' | 'login'>(initialStep);

  useEffect(() => {
    if (isOpen) setStep(initialStep);
  }, [isOpen, initialStep]);

  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', city: '', email: '', password: '', organization: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        username: formData.email, // using email as username
        password: formData.password,
        role: 'ENERGY_MANAGER', // Default role for users signing up from the calculator
        organizationId: null
      };
      const res = await axios.post(`${API_URL}/v2/auth/register`, payload);
      const user = res.data?.data?.user;
      const token = res.data?.data?.accessToken;
      if (user && token) {
        onSuccess(user, token);
      } else {
        // Fallback if structure is different
        onSuccess(res.data.user || res.data, res.data.token || res.data.accessToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/v2/auth/login`, { email: formData.email, password: formData.password });
      const user = res.data?.data?.user;
      const token = res.data?.data?.accessToken;
      if (user && token) {
        onSuccess(user, token);
      } else {
        onSuccess(res.data.user || res.data, res.data.token || res.data.accessToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (step === 'login') return 'Welcome Back';
    return 'Unlock Scope 3';
  };

  const getSubtitle = () => {
    if (step === 'login') return 'Sign in to access your SustainOS workspace.';
    return 'Start your 3-day free trial of SustainOS today.';
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: 2,
            maxWidth: 450,
            width: '100%',
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{getTitle()}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{getSubtitle()}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ alignSelf: 'flex-start' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'error.dark', borderRadius: 2, color: 'white' }}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        {step === 'details' && (
          <form id="signup-form" onSubmit={handleRegister}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField 
                  required fullWidth label="First Name" 
                  value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
                <TextField 
                  required fullWidth label="Last Name" 
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                />
              </Stack>
              <TextField 
                required fullWidth label="Phone Number" 
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              <TextField 
                required fullWidth type="email" label="Work Email" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField 
                  fullWidth label="Organization (Optional)" 
                  value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})}
                />
                <TextField 
                  fullWidth label="City (Optional)" 
                  value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                />
              </Stack>
              <TextField 
                required fullWidth type={showPassword ? 'text' : 'password'} label="Password" 
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />
            </Stack>
          </form>
        )}


        {step === 'login' && (
          <form id="login-form" onSubmit={handleLogin}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField 
                required fullWidth type="email" label="Work Email" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <TextField 
                required fullWidth type={showPassword ? 'text' : 'password'} label="Password" 
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />
            </Stack>
          </form>
        )}
      </DialogContent>

      <DialogActions sx={{ flexDirection: 'column', px: 3, pb: 3 }}>
        {step === 'details' && (
          <Stack sx={{ width: '100%' }} spacing={2}>
            <Button 
              type="submit" form="signup-form" 
              variant="contained" size="large" fullWidth disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up & Start Trial'}
            </Button>
            <Button color="inherit" onClick={() => setStep('login')}>
              Already have an account? Log in
            </Button>
          </Stack>
        )}

        {step === 'login' && (
          <Stack sx={{ width: '100%' }} spacing={2}>
            <Button 
              type="submit" form="login-form" 
              variant="contained" size="large" fullWidth disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
            <Button color="inherit" onClick={() => setStep('details')}>
              Don't have an account? Start Trial
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}
