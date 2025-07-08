import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Box, Typography, Paper, Popover, Chip, Button, TextField } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { addHours } from 'date-fns';

const localizer = momentLocalizer(require('moment'));

import PropTypes from 'prop-types';

function CalendarView({ tasks, reloadTasks }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({});

  // Convert tasks to events for react-big-calendar
  const events = (tasks || []).map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(task.startTime),
    end: new Date(task.endTime),
    allDay: false,
    resource: task,
    priority: task.priority,
    status: task.status,
    recurrence: task.recurrence,
  }));

  const handleSelectEvent = (event, e) => {
    setSelectedEvent(event.resource);
    setAnchorEl(e.target);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  // --- Calendar event actions ---
  const [actionLoading, setActionLoading] = useState(false);
  const handleDelete = async (task) => {
    setActionLoading(true);
    try {
      await fetch(`/tasks/${task.id}`, { method: 'DELETE' });
      if (reloadTasks) await reloadTasks();
      handlePopoverClose();
    } catch (err) { alert('Failed to delete task: ' + err.message); }
    setActionLoading(false);
  };
  const handleToggleComplete = async (task) => {
    setActionLoading(true);
    try {
      let updatedTask;
      if (task.status === 'completed') {
        await fetch(`/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...task, status: 'pending' })
        });
        updatedTask = { ...task, status: 'pending' };
      } else {
        await fetch(`/tasks/${task.id}/complete`, { method: 'PATCH' });
        updatedTask = { ...task, status: 'completed' };
      }
      if (reloadTasks) await reloadTasks();
      setSelectedEvent(updatedTask); // update popover with new status
      handlePopoverClose();
    } catch (err) { alert('Failed to update task: ' + err.message); }
    setActionLoading(false);
  };
  const handleEdit = (task) => {
    setEditMode(true);
    setEditFields({
      title: task.title,
      reason: task.reason,
      startTime: task.startTime ? task.startTime.slice(0, 16) : '',
      endTime: task.endTime ? task.endTime.slice(0, 16) : '',
      recurrence: task.recurrence || '',
      priority: task.priority || 'Medium',
    });
  };

  const handleEditFieldChange = (field, value) => {
    setEditFields(prev => ({ ...prev, [field]: value }));
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setEditFields({});
  };

  const [editError, setEditError] = useState('');

  const handleEditSave = async () => {
    // Validation
    if (!editFields.title || editFields.title.trim() === '') {
      setEditError('Title cannot be blank.');
      return;
    }
    if (editFields.startTime && editFields.endTime && new Date(editFields.endTime) < new Date(editFields.startTime)) {
      setEditError('End time cannot be before start time.');
      return;
    }
    setEditError('');
    setActionLoading(true);
    try {
      await fetch(`/tasks/${selectedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedEvent,
          ...editFields,
          startTime: new Date(editFields.startTime).toISOString(),
          endTime: new Date(editFields.endTime).toISOString(),
        })
      });
      setEditMode(false);
      setEditFields({});
      if (reloadTasks) await reloadTasks();
      handlePopoverClose();
    } catch (err) {
      setEditError('Failed to update task: ' + (err.message || 'Unknown error'));
    }
    setActionLoading(false);
  };


  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Calendar</Typography>
      {events.length === 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6} width="100%">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom: 24}}>
            <circle cx="60" cy="60" r="58" fill="#F5F6FA" stroke="#E5E6EA" strokeWidth="3" />
            <rect x="35" y="50" width="50" height="30" rx="8" fill="#E5E6EA" />
            <rect x="45" y="60" width="30" height="8" rx="4" fill="#C7C9D9" />
            <circle cx="60" cy="75" r="3" fill="#C7C9D9" />
          </svg>
          <Typography variant="h6" color="textSecondary" sx={{fontWeight: 500}}>
            No events yet
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{mt: 1}}>
            Add tasks to see them in your calendar!
          </Typography>
        </Box>
      ) : (
        <Calendar
          localizer={localizer}
          events={events.map(ev => ({
            ...ev,
            title: (
              <span style={{
                color: ev.status === 'completed' ? '#B0B0B0' : '#1C1C1E',
                opacity: ev.status === 'completed' ? 0.5 : 1,
                display: 'flex', alignItems: 'center',
              }}>
                <span style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  marginRight: 6,
                  background: ev.priority === 'High' ? '#FF3B30' : ev.priority === 'Medium' ? '#FFCC00' : '#34C759',
                  border: '1.5px solid #e0e0e0',
                  verticalAlign: 'middle',
                }} title={ev.priority || 'Medium'} />
                {ev.status === 'completed' ? '✔ ' : ''}{ev.title} {ev.recurrence && <span style={{color:'#007AFF',marginLeft:4}}>[{ev.recurrence}]</span>}
              </span>
            )
          }))}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500, background: '#F8F9FB', borderRadius: 16, fontFamily: 'inherit' }}
          views={['day', 'week']}
          defaultView="week"
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => {
            let bgColor = '#fff';
            let color = '#222';
            if (event.status === 'completed') {
              bgColor = '#F3F3F3';
              color = '#B0B0B0';
            } else if (event.priority === 'High') {
              bgColor = 'rgba(255,59,48,0.15)';
              color = '#FF3B30';
            } else if (event.priority === 'Medium') {
              bgColor = 'rgba(255,204,0,0.15)';
              color = '#FFCC00';
            } else if (event.priority === 'Low') {
              bgColor = 'rgba(52,199,89,0.15)';
              color = '#34C759';
            }
            return {
              style: {
                backgroundColor: bgColor,
                color,
                borderRadius: 10,
                border: event.status === 'completed' ? '1.5px solid #E0E0E0' : '1.5px solid #eaeaea',
                fontWeight: 500,
                boxShadow: event.status === 'completed' ? 'none' : '0 2px 8px 0 rgba(0,0,0,0.03)',
                fontSize: 15,
                paddingLeft: 6,
                paddingRight: 6,
              }
            }
          }}
        />
      )}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.14)',
            minWidth: 270,
            maxWidth: 350,
            p: 0,
          }
        }}
      >
        {selectedEvent && (
          <Box>
            <Box sx={{
              height: 8,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              background: selectedEvent.status === 'completed'
                ? '#E5E5EA'
                : selectedEvent.priority === 'High'
                  ? '#FF3B30'
                  : selectedEvent.priority === 'Medium'
                    ? '#FFCC00'
                    : '#34C759',
              width: '100%'
            }} />
            <Box p={2}>
              {editMode ? (
                <TextField
                  label="Title"
                  value={editFields.title}
                  onChange={e => handleEditFieldChange('title', e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <span style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: selectedEvent.status === 'completed'
                      ? 'linear-gradient(90deg,#E5E5EA,#F3F3F3)'
                      : selectedEvent.priority === 'High'
                        ? 'linear-gradient(90deg,#FF3B30,#FF6F61)'
                        : selectedEvent.priority === 'Medium'
                          ? 'linear-gradient(90deg,#FFCC00,#FFD966)'
                          : 'linear-gradient(90deg,#34C759,#A7E9AF)',
                    marginRight: 10,
                    border: '1.5px solid #e0e0e0',
                  }} title={selectedEvent.priority || 'Medium'} />
                  {selectedEvent.status === 'completed' && <span style={{color:'#34C759',marginRight:8,fontSize:18}}>&#10003;</span>}
                  {selectedEvent.title}
                </Typography>
              )}

              <Box mb={1} display="flex" alignItems="center" gap={1}>
                <Chip
                  size="small"
                  label={selectedEvent.status === 'completed' ? 'Completed' : 'Pending'}
                  sx={{
                    bgcolor: selectedEvent.status === 'completed' ? '#E5FBE5' : '#FFF8E1',
                    color: selectedEvent.status === 'completed' ? '#34C759' : '#FF9500',
                    fontWeight: 600,
                  }}
                />
                {selectedEvent.recurrence && (
                  <Chip size="small" label={`Recurs: ${selectedEvent.recurrence}`} sx={{ bgcolor: '#E8F0FE', color: '#007AFF', fontWeight: 500 }} />
                )}
                <Chip size="small" label={`ID: ${selectedEvent.id}`} sx={{ bgcolor: '#F5F6FA', color: '#888', fontWeight: 500 }} />
              </Box>
              {editMode ? (
                <>
                  {editError && (
                    <Box mb={1}>
                      <Typography color="error" variant="body2">{editError}</Typography>
                    </Box>
                  )}
                  <TextField
                    label="Reason"
                    value={editFields.reason}
                    onChange={e => handleEditFieldChange('reason', e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    label="Start Time"
                    type="datetime-local"
                    value={editFields.startTime}
                    onChange={e => handleEditFieldChange('startTime', e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End Time"
                    type="datetime-local"
                    value={editFields.endTime}
                    onChange={e => handleEditFieldChange('endTime', e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Recurrence"
                    value={editFields.recurrence}
                    onChange={e => handleEditFieldChange('recurrence', e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    label="Priority"
                    select
                    value={editFields.priority}
                    onChange={e => handleEditFieldChange('priority', e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                    SelectProps={{ native: true }}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </TextField>
                  <Box mt={2} display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      disabled={actionLoading}
                      onClick={handleEditSave}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                      startIcon={<SaveIcon />}
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      disabled={actionLoading}
                      onClick={handleEditCancel}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>{selectedEvent.reason && <>Reason: <b>{selectedEvent.reason}</b></>}</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Start: <b>{selectedEvent.startTime ? new Date(selectedEvent.startTime).toLocaleString() : ''}</b></Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>End: <b>{selectedEvent.endTime ? new Date(selectedEvent.endTime).toLocaleString() : ''}</b></Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Start (ISO): <b style={{fontSize:11}}>{selectedEvent.startTime}</b></Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>End (ISO): <b style={{fontSize:11}}>{selectedEvent.endTime}</b></Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Priority: <b style={{color:selectedEvent.priority==='High'?'#FF3B30':selectedEvent.priority==='Medium'?'#FFCC00':'#34C759'}}>{selectedEvent.priority || 'Medium'}</b></Typography>
                  <Box mt={2} display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color={selectedEvent.status === 'completed' ? 'warning' : 'success'}
                      disabled={actionLoading}
                      onClick={() => handleToggleComplete(selectedEvent)}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                      title={selectedEvent.status === 'completed' ? 'Mark as Pending' : 'Mark as Complete'}
                      startIcon={selectedEvent.status === 'completed' ? <UndoIcon /> : <CheckCircleIcon />}
                    >
                      {selectedEvent.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      disabled={actionLoading}
                      onClick={() => handleEdit(selectedEvent)}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                      title="Edit Task"
                      startIcon={<EditIcon />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      disabled={actionLoading}
                      onClick={() => handleDelete(selectedEvent)}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                      title="Delete Task"
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  </Box>
                </>
              )}

            </Box>
          </Box>
        )}
      </Popover>
    </Paper>
  );
}

CalendarView.propTypes = {
  tasks: PropTypes.array
};

export default CalendarView;
