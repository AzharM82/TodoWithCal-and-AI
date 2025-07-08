import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Button, Paper, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import ToDoList from './components/ToDoList';
import CalendarView from './components/CalendarView';
import TimelineView from './components/TimelineView';
import MotivationSection from './components/MotivationSection';
import TradingQuotesSection from './components/TradingQuotesSection';
import SummaryDialog from './components/SummaryDialog';
import { fetchTasks } from './api';

function App() {
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const loadTasks = async () => {
    setTasksLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch {
      setTasks([]);
    }
    setTasksLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.background.default,
        paddingTop: 32,
        paddingBottom: 32,
        width: '100vw',
        maxWidth: '100vw',
        overflow: 'auto',
      }}>
        <Grid container spacing={3} style={{ flex: 1, width: '100%' }}>
          <Grid item xs={12} md={3} lg={3} style={{ height: '100%' }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <ToDoList tasks={tasks} reloadTasks={loadTasks} tasksLoading={tasksLoading} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={6} style={{ height: '100%' }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <CalendarView tasks={tasks} reloadTasks={loadTasks} />
              <Box mt={4} />
              <TimelineView tasks={tasks} selectedDate={new Date()} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={3} lg={3} style={{ height: '100%' }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <MotivationSection />
              <TradingQuotesSection
                apiKey={process.env.REACT_APP_OPENAI_API_KEY || ***REMOVED***}
                prompt={`**"Create a personalized trading psychology catalyst for me right now. I want a powerful, lesser-known quote from a legendary trader or market philosopher that cuts through the noise and addresses real trading psychology challenges, paired with a specific mental strategy I can implement in my next 30 minutes of market analysis or trading.
Format your response EXACTLY like this:
📈 TRADING QUOTE:
[Your powerful trading psychology quote here - include who said it]
🧠 WHY THIS MATTERS IN TODAY'S MARKETS:
[2-3 sentences explaining why this psychological insight is crucial for current trading conditions]
⚡ YOUR 30-MINUTE MENTAL TRAINING:
[Specific psychological exercise, mindset shift, or mental preparation technique I can practice right now]
🎯 TRADING SUCCESS MARKER:
[How I'll recognize this mental shift is working in my actual trading]
Make it feel like you're my personal trading coach who understands the psychological warfare of the markets. Keep each section concise but impactful - I want to read this and immediately feel mentally sharper and more disciplined for my next trade."**
Key trading-specific improvements:

Market relevance: "current trading conditions" keeps it timely
Credible sources: "legendary trader or market philosopher" ensures quality
Practical application: "market analysis or trading" makes it actionable
Psychology focus: "mental training" and "psychological warfare" language
Trading-specific outcomes: Success markers tied to actual trading performance
Professional tone: "trading coach" vs generic "personal coach"`}
              />
            </Paper>
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <Button variant="contained" color="primary" size="large" onClick={() => setSummaryOpen(true)} sx={{ borderRadius: 8, px: 4, fontWeight: 600 }}>
            Day Summary
          </Button>
        </Box>
        <SummaryDialog open={summaryOpen} onClose={() => setSummaryOpen(false)} tasks={tasks} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
