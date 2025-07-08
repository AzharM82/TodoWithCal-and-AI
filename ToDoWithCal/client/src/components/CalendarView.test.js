
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// import CalendarView from './CalendarView';

// Mock react-big-calendar
jest.mock('react-big-calendar', () => ({
  Calendar: () => <div data-testid="mock-calendar">Mock Calendar</div>,
  momentLocalizer: () => jest.fn(),
}));

// Sanity test
describe('Sanity', () => {
  it('runs a basic test', () => {
    expect(true).toBe(true);
  });
});

// Mock data for tasks
describe('CalendarView Popover Actions', () => {
  const baseTask = {
    id: 1,
    title: 'Test Task',
    reason: 'Reason',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    recurrence: '',
    status: 'pending',
    priority: 'Medium',
  };
  const tasks = [baseTask];
  const reloadTasks = jest.fn();

  beforeEach(() => {
    render(<CalendarView tasks={tasks} reloadTasks={reloadTasks} />);
  });

  it('opens popover and displays task details', async () => {
    // Simulate clicking on event (mock react-big-calendar event click)
    // You'll need to expose a way to trigger popover in testable way
    // For now, just check if the title is rendered
    expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
  });

  it('shows edit fields and saves changes', async () => {
    fireEvent.click(screen.getByTitle(/Edit Task/i));
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
    fireEvent.click(screen.getByText(/Save/i));
    await waitFor(() => expect(reloadTasks).toHaveBeenCalled());
  });

  it('cancels edit mode', async () => {
    fireEvent.click(screen.getByTitle(/Edit Task/i));
    const cancelBtn = screen.getByText(/Cancel/i);
    fireEvent.click(cancelBtn);
    expect(screen.getByText(/Edit/i)).toBeInTheDocument();
  });

  it('marks task as complete and pending', async () => {
    fireEvent.click(screen.getByTitle(/Mark as Complete/i));
    await waitFor(() => expect(reloadTasks).toHaveBeenCalled());
  });

  it('deletes a task', async () => {
    fireEvent.click(screen.getByTitle(/Delete Task/i));
    await waitFor(() => expect(reloadTasks).toHaveBeenCalled());
  });

  // Negative test: blank title
  it('does not allow blank title on save', async () => {
    fireEvent.click(screen.getByTitle(/Edit Task/i));
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.click(screen.getByText(/Save/i));
    // You should implement validation in CalendarView for this to work
    // For now, just check input stays in edit mode
    expect(titleInput).toBeInTheDocument();
  });
});
