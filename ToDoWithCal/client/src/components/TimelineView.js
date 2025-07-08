import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { Paper, Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Helper for priority color
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return '#FF3B30';
    case 'Medium': return '#FFCC00';
    case 'Low': return '#34C759';
    default: return '#BDBDBD';
  }
};

export default function TimelineView({ tasks, selectedDate }) {
  // Filter tasks for the selected day (if provided)
  const dayTasks = React.useMemo(() => {
    if (!selectedDate) return tasks;
    return tasks.filter(task => {
      const d = new Date(task.startTime);
      return d.toDateString() === new Date(selectedDate).toDateString();
    });
  }, [tasks, selectedDate]);

  // Sort by start time
  const sortedTasks = [...(dayTasks || [])].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  if (!sortedTasks.length) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">No tasks for this day</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Day Timeline
      </Typography>
      <Timeline position="alternate">
        {sortedTasks.map((task, idx) => (
          <TimelineItem key={task.id}>
            <TimelineOppositeContent sx={{ flex: 0.15 }}>
              <Typography variant="body2" color="text.secondary">
                {task.startTime ? new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot style={{ background: getPriorityColor(task.priority), boxShadow: '0 0 0 2px #fff' }}>
                {task.status === 'completed' ? <CheckCircleIcon style={{ color: '#fff' }} /> : null}
              </TimelineDot>
              {idx < sortedTasks.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={1} sx={{ p: 1.5, minWidth: 180, background: task.status === 'completed' ? '#f3f3f3' : '#fff' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {task.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {task.reason}
                </Typography>
                <Typography variant="caption" color={getPriorityColor(task.priority)}>
                  {task.priority}
                </Typography>
                <Typography variant="caption" color={task.status === 'completed' ? 'success.main' : 'warning.main'} sx={{ ml: 1 }}>
                  {task.status}
                </Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
}
