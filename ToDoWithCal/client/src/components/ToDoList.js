import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Checkbox, CircularProgress, Snackbar, Alert, Collapse } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import { Add, Delete, Edit, CheckCircle, Undo } from '@mui/icons-material';

import { createTask, updateTask, deleteTask } from '../api';

// Patch completion API
async function completeTask(id) {
  return fetch(`/tasks/${id}/complete`, { method: 'PATCH' })
    .then(res => {
      if (!res.ok) throw new Error('Failed to mark complete');
      return res.json();
    });
}


function ToDoList({ tasks, reloadTasks, tasksLoading }) {
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success', action: null });
  // Undo state
  const [lastDeleted, setLastDeleted] = useState(null);

  // ...existing state

  const handleToggleComplete = async (task) => {
    setLoading(true);
    try {
      if (task.status === 'completed') {
        await updateTask(task.id, { ...task, status: 'pending' });
        setSnackbar({ open: true, message: 'Marked as pending', severity: 'info', action: null });
      } else {
        await completeTask(task.id);
        setSnackbar({ open: true, message: 'Marked as completed!', severity: 'success', action: null });
      }
      await reloadTasks();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to toggle completion: ' + (err?.response?.data?.error || err.message), severity: 'error', action: null });
    }
    setLoading(false);
  };

  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (!title || isNaN(start) || isNaN(end)) {
      setSnackbar({ open: true, message: 'Please enter a valid task and date/time.', severity: 'warning', action: null });
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await updateTask(editId, {
          title,
          reason,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          recurrence,
          priority,
        });
        setSnackbar({ open: true, message: 'Task updated!', severity: 'success', action: null });
      } else {
        await createTask({
          title,
          reason,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          recurrence,
          priority,
        });
        setSnackbar({ open: true, message: 'Task added!', severity: 'success', action: null });
      }
      setTitle('');
      setReason('');
      setStartTime('');
      setEndTime('');
      setRecurrence('');
      setEditId(null);
      setPriority('Medium');
      await reloadTasks();
    } catch (err) {
      setSnackbar({ open: true, message: (editId ? 'Failed to update task: ' : 'Failed to add task: ') + (err?.response?.data?.error || err.message), severity: 'error', action: null });
    }
    setLoading(false);
  };

  const handleEdit = (task) => {
    setEditId(task.id);
    setTitle(task.title);
    setReason(task.reason);
    setStartTime(task.startTime ? new Date(task.startTime).toISOString().slice(0,16) : '');
    setEndTime(task.endTime ? new Date(task.endTime).toISOString().slice(0,16) : '');
    setRecurrence(task.recurrence || '');
    setPriority(task.priority || 'Medium');
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setTitle('');
    setReason('');
    setStartTime('');
    setEndTime('');
  };

  const handleDelete = async (id) => {
    // Find and store the deleted task for undo
    const deletedTask = tasks.find(t => t.id === id);
    setLoading(true);
    try {
      await deleteTask(id);
      await reloadTasks();
      setLastDeleted(deletedTask);
      setSnackbar({
        open: true,
        message: 'Task deleted',
        severity: 'info',
        action: (
          <Button color="inherit" size="small" startIcon={<Undo />} onClick={handleUndoDelete}>
            UNDO
          </Button>
        )
      });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete task: ' + (err?.response?.data?.error || err.message), severity: 'error', action: null });
    }
    setLoading(false);
  };

  // Undo delete handler
  const handleUndoDelete = async () => {
    if (!lastDeleted) return;
    setLoading(true);
    try {
      // Recreate the deleted task
      await createTask({
        title: lastDeleted.title,
        reason: lastDeleted.reason,
        startTime: lastDeleted.startTime,
        endTime: lastDeleted.endTime,
        recurrence: lastDeleted.recurrence,
        priority: lastDeleted.priority || 'Medium',
        status: lastDeleted.status
      });
      await reloadTasks();
      setSnackbar({ open: true, message: 'Task restored', severity: 'success', action: null });
      setLastDeleted(null);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to restore task: ' + (err?.response?.data?.error || err.message), severity: 'error', action: null });
    }
    setLoading(false);
  };

  return (
    <Box p={2}>
      <Typography variant="h6">To-Do List</Typography>
      <Box component="form" mb={2} onSubmit={handleSubmit}>
        <TextField label="What is the task?" fullWidth margin="dense" value={title} onChange={e => setTitle(e.target.value)} />
        <TextField label="Why are you doing it?" fullWidth margin="dense" value={reason} onChange={e => setReason(e.target.value)} />
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Start Time"
            type="datetime-local"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={startTime ? startTime : ''}
            onChange={e => setStartTime(e.target.value)}
          />
          <TextField
            label="End Time"
            type="datetime-local"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={endTime ? endTime : ''}
            onChange={e => setEndTime(e.target.value)}
          />
          <TextField
            label="Recurrence"
            fullWidth
            margin="dense"
            value={recurrence || ''}
            onChange={e => setRecurrence(e.target.value)}
            placeholder="e.g. daily, weekly, none"
          />
          <TextField
            label="Priority"
            select
            fullWidth
            margin="dense"
            value={priority}
            onChange={e => setPriority(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </TextField>
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<Add />}
          disabled={loading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {editId ? 'Update Task' : 'Add Task'}
        </Button>
        {editId && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancelEdit}
            disabled={loading}
            fullWidth
            sx={{ mt: 1 }}
          >
            Cancel
          </Button>
        )}
      </Box>
      <List>
        {tasksLoading ? (
          <ListItem>
            <ListItemText primary="Loading..." />
          </ListItem>
        ) : tasks.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6} width="100%">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom: 24}}>
              <circle cx="60" cy="60" r="58" fill="#F5F6FA" stroke="#E5E6EA" strokeWidth="3" />
              <rect x="35" y="50" width="50" height="30" rx="8" fill="#E5E6EA" />
              <rect x="45" y="60" width="30" height="8" rx="4" fill="#C7C9D9" />
              <circle cx="60" cy="75" r="3" fill="#C7C9D9" />
            </svg>
            <Typography variant="h6" color="textSecondary" sx={{fontWeight: 500}}>
              No tasks yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{mt: 1}}>
              Add your first task and start getting things done!
            </Typography>
          </Box>
        ) : (
          <TransitionGroup>
            {tasks.map(task => (
              <Collapse key={task.id}>
                <ListItem divider sx={{ transition: 'background 0.3s' }}>
                  <Checkbox
                    edge="start"
                    checked={task.status === 'completed'}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': `checkbox-list-label-${task.id}` }}
                    icon={<CheckCircle sx={{ transition: 'transform 0.2s', transform: task.status === 'completed' ? 'scale(1.2)' : 'scale(1)' }} />}
                    checkedIcon={<CheckCircle color="success" sx={{ transition: 'transform 0.2s', transform: task.status === 'completed' ? 'scale(1.4)' : 'scale(1)' }} />}
                    onChange={() => handleToggleComplete(task)}
                  />
                  <ListItemText
                    primary={
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          marginRight: 8,
                          background: task.priority === 'High' ? '#FF3B30' : task.priority === 'Medium' ? '#FFCC00' : '#34C759',
                          border: '1.5px solid #e0e0e0',
                          verticalAlign: 'middle'
                        }} title={task.priority || 'Medium'} />
                        {task.title} {task.status === 'completed' && <span style={{color:'green',fontWeight:'bold',marginLeft:8}}>[Completed]</span>}
                        {task.recurrence && <span style={{color:'blue',marginLeft:8}}>[Recurring: {task.recurrence}]</span>}
                      </span>
                    }
                    secondary={<>
                      Priority: <span style={{color:task.priority==='High'?'#FF3B30':task.priority==='Medium'?'#FFCC00':'#34C759',fontWeight:'bold'}}>{task.priority || 'Medium'}</span><br/>
                      Reason: {task.reason || '—'}<br/>
                      Start: {task.startTime ? new Date(task.startTime).toLocaleString() : ''} ({task.startTime ? new Date(task.startTime).toISOString() : ''})<br/>
                      End: {task.endTime ? new Date(task.endTime).toLocaleString() : ''} ({task.endTime ? new Date(task.endTime).toISOString() : ''})<br/>
                      {task.recurrence && <>Recurrence: <span style={{color:'blue'}}>{task.recurrence}</span><br/></>}
                      Status: <span style={{color:task.status==='completed'?'green':'orange'}}>{task.status || 'pending'}</span>
                    </>}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleEdit(task)}><Edit /></IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(task.id)}><Delete /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Collapse>
            ))}
          </TransitionGroup>
        )}
      </List>
      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          action={snackbar.action}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ToDoList;
