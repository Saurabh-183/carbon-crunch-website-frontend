"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Button, TextField, MenuItem, 
  Card, CardContent, IconButton, CircularProgress, 
  Container, Stack, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

type Config = {
  useTypes: string[];
  sources: Record<string, string[]>;
  units: Record<string, string[]>;
  emissionFactors?: Record<string, { factor: number; unit: string; scope: number }>;
};

type EntryRow = {
  id: string;
  useType: string;
  source: string;
  quantity: string;
  unit: string;
};

export default function CalculatorView({ onUnlockScope3, onLogin, isPro = false }: { onUnlockScope3?: () => void; onLogin?: () => void; isPro?: boolean }) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'factors'>('calculator');
  const [config, setConfig] = useState<Config | null>(null);
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const inputSx = {
    backgroundColor: '#ffffff',
    borderRadius: 1,
    '& .MuiInputBase-input': { color: '#000000' },
    '& .MuiSelect-select': { color: '#000000' },
    '& .MuiSvgIcon-root': { color: '#000000' }
  };

  useEffect(() => {
    axios.get(`${API_URL}/ghg/config`).then(res => {
      let data = res.data;
      if (!isPro) {
        const PRO_USE_TYPES = ['Upstream', 'Downstream'];
        data.useTypes = data.useTypes.filter((ut: string) => !PRO_USE_TYPES.includes(ut));
      }
      setConfig(data);
      if (data.useTypes.length > 0) addEntryRow(data);
    }).catch(err => {
      console.error(err);
      setError('Failed to load configuration.');
    });
  }, []);

  const addEntryRow = (cfg: Config = config!) => {
    if (!cfg) return;
    const defaultUseType = cfg.useTypes[0];
    const defaultSource = cfg.sources[defaultUseType]?.[0] || '';
    const defaultUnit = cfg.units[defaultSource]?.[0] || '';

    setEntries([...entries, {
      id: Math.random().toString(36).substring(7),
      useType: defaultUseType,
      source: defaultSource,
      quantity: '',
      unit: defaultUnit
    }]);
  };

  const updateEntry = (id: string, field: keyof EntryRow, value: string) => {
    setEntries(entries.map(entry => {
      if (entry.id !== id) return entry;
      const updated = { ...entry, [field]: value };
      if (field === 'useType' && config) {
        updated.source = config.sources[value]?.[0] || '';
        updated.unit = config.units[updated.source]?.[0] || '';
      }
      if (field === 'source' && config) {
        updated.unit = config.units[value]?.[0] || '';
      }
      return updated;
    }));
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) setEntries(entries.filter(e => e.id !== id));
  };

  const calculate = async () => {
    setError('');
    const validEntries = entries.filter(e => Number(e.quantity) > 0);
    
    if (validEntries.length === 0) {
      setError('Please enter a valid quantity greater than 0.');
      return;
    }

    setLoading(true);
    try {
      const payload = validEntries.map(e => ({
        useType: e.useType,
        source: e.source,
        quantity: Number(e.quantity),
        unit: e.unit
      }));
      const res = await axios.post(`${API_URL}/ghg/calculate`, { entries: payload });
      setResults(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!config) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }}>
          GHG CALCULATOR
        </Typography>
        <Typography variant="h3" className='text-black' sx={{ fontWeight: 800, mt: 1, mb: 2 }}>
          Carbon Footprint Calculator
        </Typography>
        <Typography variant="body1" color="text.secondary" className='text-black'>
          Estimate your organization's Scope 1 & Scope 2 emissions in minutes.
        </Typography>
      </Box>

      {/* Main Container Card */}
      <Card elevation={0} sx={{ borderRadius: 4, mb: 6 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2, display: 'flex' }}>
          <Box 
            onClick={() => setActiveTab('calculator')}
            className='text-black'
            sx={{ px: 3, py: 1.5, borderBottom: activeTab === 'calculator' ? '2px solid #d97732' : '2px solid transparent', color: activeTab === 'calculator' ? 'text.primary' : 'text.secondary', fontWeight: activeTab === 'calculator' ? 'bold' : 'medium', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Typography color={activeTab === 'calculator' ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: 'inherit' }}>Calculator</Typography>
          </Box>
          <Box 
            onClick={() => setActiveTab('factors')}
            className='text-black'
            sx={{ px: 3, py: 1.5, borderBottom: activeTab === 'factors' ? '2px solid #d97732' : '2px solid transparent', color: activeTab === 'factors' ? 'text.primary' : 'text.secondary', fontWeight: activeTab === 'factors' ? 'bold' : 'medium', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Typography color={activeTab === 'factors' ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: 'inherit' }}>Emission Factors</Typography>
          </Box>
        </Box>
        
        <CardContent sx={{ p: { xs: 2, md: 5 } }}>
          {activeTab === 'calculator' ? (
            <>
              {error && (
                <Box sx={{ mb: 4, p: 2, bgcolor: 'error.dark', borderRadius: 2, color: 'white' }}>
                  {error}
                </Box>
              )}


                  {/* This is just for changing the repo..*/}
                  {/*Added package.log.json*/}
              <Stack spacing={4}>
            <AnimatePresence>
              {entries.map((entry, index) => (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  key={entry.id} 
                >
                  <Card variant="outlined" sx={{ borderRadius: 3, position: 'relative', overflow: 'visible' }}>
                    {entries.length > 1 && (
                      <IconButton 
                        onClick={() => removeEntry(entry.id)}
                        sx={{ position: 'absolute', top: 12, right: 12 }}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                        SOURCE {String(index + 1).padStart(2, '0')}
                      </Typography>
                      
                      <Stack spacing={3} sx={{ mt: 3 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, mb: 1, display: 'block' }}>
                            ACTIVITY TYPE
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            value={entry.useType}
                            onChange={(e) => updateEntry(entry.id, 'useType', e.target.value)}
                            sx={inputSx}
                          >
                            {config.useTypes.map(ut => <MenuItem key={ut} value={ut}>{ut}</MenuItem>)}
                          </TextField>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, mb: 1, display: 'block' }}>
                            EMISSION SOURCE
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            value={entry.source}
                            onChange={(e) => updateEntry(entry.id, 'source', e.target.value)}
                            sx={inputSx}
                          >
                            {(config.sources[entry.useType] || []).map(src => <MenuItem key={src} value={src}>{src}</MenuItem>)}
                          </TextField>
                        </Box>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, mb: 1, display: 'block' }}>
                              QUANTITY
                            </Typography>
                            <TextField
                              fullWidth
                              type="number"
                              placeholder="Enter quantity"
                              value={entry.quantity}
                              onChange={(e) => updateEntry(entry.id, 'quantity', e.target.value)}
                              sx={inputSx}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, mb: 1, display: 'block' }}>
                              UNIT
                            </Typography>
                            <TextField
                              select
                              fullWidth
                              value={entry.unit}
                              onChange={(e) => updateEntry(entry.id, 'unit', e.target.value)}
                              sx={inputSx}
                            >
                              {(config.units[entry.source] || []).map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                            </TextField>
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button 
              variant="outlined" 
              color="inherit" 
              startIcon={<AddIcon />} 
              onClick={() => addEntryRow()}
              sx={{ py: 2, borderStyle: 'dashed', borderColor: 'divider', color: 'primary.main', fontWeight: 'bold' }}
            >
              Add Another Source
            </Button>

            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={calculate}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon style={{ transform: 'rotate(-45deg)' }} />}
              sx={{ py: 2, fontSize: '1.1rem' }}
            >
              Calculate Emissions
            </Button>
          </Stack>
        </>
        ) : (
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>Current Emission Factors</Typography>
            <Box sx={{ maxHeight: '600px', overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' } }}>
              <Stack spacing={2}>
                {config.emissionFactors ? Object.entries(config.emissionFactors).map(([source, data]) => (
                  <Box key={source} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(255,255,255,0.02)' }, transition: 'all 0.2s' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{source}</Typography>
                      <Typography variant="body2" color="text.secondary">Scope {data.scope} Emission Source</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary.main">{data.factor}</Typography>
                      <Typography variant="caption" color="text.secondary">{data.unit}</Typography>
                    </Box>
                  </Box>
                )) : (
                  <Typography color="text.secondary">No emission factors available.</Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && activeTab === 'calculator' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Stack spacing={4}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Card sx={{ flex: 1, borderRadius: 4 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Total Emissions
                  </Typography>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800, mt: 1, wordBreak: 'break-word' }}>
                    {results.totals.total.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">kgCO₂e</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, borderRadius: 4 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Scope 1 (Direct)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, wordBreak: 'break-word' }}>
                    {results.totals.scope1.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">kgCO₂e</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, borderRadius: 4 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Scope 2 (Indirect)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, wordBreak: 'break-word' }}>
                    {results.totals.scope2.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">kgCO₂e</Typography>
                </CardContent>
              </Card>
              {isPro && (
                <Card sx={{ flex: 1, borderRadius: 4 }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Scope 3 (Value Chain)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, wordBreak: 'break-word' }}>
                      {(results.totals.scope3 || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">kgCO₂e</Typography>
                  </CardContent>
                </Card>
              )}
            </Stack>

            {!isPro && (
              <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)' }}>
                <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: "center", justifyContent: "space-between" }} spacing={4}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: 'white' }}>
                        Unlock Scope 3 Emissions
                      </Typography>
                      <Typography variant="body1" sx={{ maxWidth: 500, color: 'rgba(255,255,255,0.7)' }}>
                        You've mapped your direct emissions. Sign up to start a 3-day full access trial and track your entire supply chain and value chain emissions.
                      </Typography>
                    </Box>
                    <Stack spacing={2} sx={{ minWidth: 250 }}>
                      <Button variant="contained" color="primary" size="large" onClick={onUnlockScope3}>
                        Unlock Scope 3
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="large" 
                        onClick={onLogin || onUnlockScope3}
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                      >
                        Already have an account?
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </motion.div>
      )}

      {/* Login Prompt Dialog */}
      <Dialog open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Authentication Required</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            You must be logged in to view the complete Emission Factors database. Please log in or sign up to continue.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button onClick={() => setLoginPromptOpen(false)} color="inherit">Cancel</Button>
          <Button 
            variant="outlined" 
            onClick={() => { setLoginPromptOpen(false); if(onLogin) onLogin(); }}
          >
            Log In
          </Button>
          <Button 
            variant="contained" 
            onClick={() => { setLoginPromptOpen(false); if(onUnlockScope3) onUnlockScope3(); }}
          >
            Sign Up
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}
