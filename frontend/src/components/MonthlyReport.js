import React, { useState, useMemo } from 'react';
import { getMonthlyReport } from '../api';

// MUI Components
import {
  Box, Typography, TextField, Button, Grid, Card, CardContent,
  CircularProgress, Alert, Accordion, AccordionSummary,
  AccordionDetails, List, ListItem, ListItemText, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssessmentIcon from '@mui/icons-material/Assessment';

// A helper component for the circular progress with a label
function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress variant="determinate" {...props} size={90} thickness={4} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" component="div" color="text.secondary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}


function MonthlyReport() {
  const [reportData, setReportData] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Memoize month options for performance
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const monthValue = i + 1;
    const monthName = new Date(0, i).toLocaleString('default', { month: 'long' });
    return { value: monthValue, label: monthName };
  }), []);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);
    try {
      const result = await getMonthlyReport(month, year, userId);
      if (result.error) {
        setError(result.error);
      } else {
        setReportData(result);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Monthly Attendance Report
      </Typography>

      {/* Input Controls */}
      <Card sx={{ p: 2, mb: 4, background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
            <TextField
              label="Year"
              type="number"
              fullWidth
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="User ID (Optional)"
              fullWidth
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <button
              className="modern-button"
              onClick={fetchReport}
              disabled={loading}
            >
              Generate
            </button>
          </Grid>
        </Grid>
      </Card>

      {/* Loading and Error States */}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

      {/* Report Data Display */}
      {reportData && (
        <Grid container spacing={3}>
          {reportData.map(userReport => (
            <Grid item xs={12} sm={6} md={4} key={userReport.user_id}>
              <Card sx={{ borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: '600' }} noWrap>
                    {userReport.user_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ID: {userReport.user_id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Email: {userReport.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Mobile: {userReport.mobile_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Gender: {userReport.gender}
                  </Typography>
                  
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={5}>
                      <CircularProgressWithLabel value={userReport.monthly_attendance_percentage} />
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="h6" component="p">
                        {userReport.total_days_present} / {userReport.total_working_days}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Days Present
                      </Typography>
                    </Grid>
                  </Grid>

                  <Accordion sx={{ mt: 3, boxShadow: 'none', '&:before': { display: 'none' }, background: '#f5f5f5' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: '500' }}>Daily Log</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <List dense sx={{ maxHeight: 180, overflow: 'auto', width: '100%', bgcolor: 'background.paper' }}>
                        {userReport.daily_log.length > 0 ? userReport.daily_log.map((log, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={new Date(log).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                              secondary={new Date(log).toLocaleTimeString()}
                            />
                          </ListItem>
                        )) : (
                          <ListItem>
                            <ListItemText primary="No records for this month." />
                          </ListItem>
                        )}
                      </List>
                    </AccordionDetails>
                  </Accordion>

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default MonthlyReport;