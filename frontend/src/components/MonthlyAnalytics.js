import React, { useState, useMemo } from 'react';
import { getMonthlyAnalytics } from '../api';

// MUI Components
import {
  Box, Typography, TextField, Button, Card, CardContent, Grid,
  List, ListItem, ListItemText, Chip, CircularProgress, Alert,
  Select, MenuItem, FormControl, InputLabel, ListItemIcon, useTheme
} from '@mui/material';

// Charting Library
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Icons
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

function MonthlyAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme(); // Access the MUI theme for consistent colors

  // Memoize month options to avoid re-calculating on every render
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const monthValue = i + 1;
    const monthName = new Date(0, i).toLocaleString('default', { month: 'long' });
    return { value: monthValue, label: monthName };
  }), []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    setAnalyticsData(null);
    try {
      const result = await getMonthlyAnalytics(month, year);
      if (result.error) {
        setError(result.error);
      } else {
        setAnalyticsData(result);
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching analytics.');
    } finally {
      setLoading(false);
    }
  };

  // Custom Tooltip for the chart for better styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ p: 1.5, background: 'rgba(255, 255, 255, 0.9)', borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{label}</Typography>
          <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
            {`Average: ${payload[0].value.toFixed(2)}%`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Monthly Analytics
      </Typography>

      {/* Input Controls */}
      <Card sx={{ p: 2, mb: 4, background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="month-select-label">Month</InputLabel>
              <Select
                labelId="month-select-label"
                value={month}
                label="Month"
                onChange={(e) => setMonth(e.target.value)}
              >
                {monthOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Year" type="number" fullWidth value={year} onChange={(e) => setYear(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <button
              className="modern-button"
              onClick={fetchAnalytics}
              disabled={loading}
            >
              Fetch Analytics
            </button>
          </Grid>
        </Grid>
      </Card>

      {/* Loading and Error States */}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress size={50} /></Box>}
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

      {/* Analytics Data Display */}
      {analyticsData && (
        <Grid container spacing={3}>
          {/* Average Attendance Chart */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Average Attendance (Last 6 Months)</Typography>
                <Box sx={{ height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.average_attendance_last_6_months} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} unit="%" />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                      <Legend />
                      <Bar dataKey="average_attendance" fill={theme.palette.primary.main} name="Average Attendance" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 100% Attendance List */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Perfect Attendance</Typography>
                <List dense sx={{ maxHeight: 250, overflow: 'auto' }}>
                  {analyticsData.full_attendance_users.length > 0 ? (
                    analyticsData.full_attendance_users.map((user, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: 40 }}><CheckCircleOutlineIcon color="success" /></ListItemIcon>
                        <ListItemText primary={user} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem><ListItemText primary="No students with 100% attendance." /></ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Defaulters List */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Attendance Below 75%</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, maxHeight: 250, overflow: 'auto' }}>
                  {analyticsData.defaulters_list.length > 0 ? (
                    analyticsData.defaulters_list.map((user, index) => (
                      <Chip
                        key={index}
                        icon={<WarningAmberIcon />}
                        label={`${user.name} (${user.attendance_percentage.toFixed(1)}%)`}
                        color="error"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>No defaulters for this month.</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default MonthlyAnalytics;