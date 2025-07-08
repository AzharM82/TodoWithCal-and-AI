import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';

function SummaryDialog({ open, onClose, tasks = [] }) {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status !== 'completed').length;
  const recurring = tasks.filter(t => t.recurrence).length;
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Day Summary</DialogTitle>
      <DialogContent>
        <Typography>Completed tasks: {completed}</Typography>
        <Typography>Pending tasks: {pending}</Typography>
        <Typography>Recurring tasks: {recurring}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SummaryDialog;
