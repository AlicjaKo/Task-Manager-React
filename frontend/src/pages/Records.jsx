import React, { useState, useEffect } from 'react';
import '../styles/Records.css';

function Records() {
  const [startTime, setStartTime] = useState(new Date().setHours(0, 0, 0, 0)); // Start of current day
  const [endTime, setEndTime] = useState(new Date()); // Current time
  const [tasks, setTasks] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskIntervals, setTaskIntervals] = useState([]);

  // Fetch tasks from the API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3010/tasks');
        const tasksData = await response.json();
        setTasks(tasksData); // Storing the tasks data in state
      } catch (error) {
        console.error('Error fetching tasks:', error); // Error handling if something goes wrong
      }
    };
    fetchTasks();
  }, []); // Runs only once on component mount

  // Fetch timestamps from the API
  useEffect(() => {
    const fetchTimestamps = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3010/timestamps');
        const timestampsData = await response.json();
        setTimestamps(timestampsData); // Storing timestamp data in state
      } catch (error) {
        console.error('Error fetching timestamps:', error); // Error handling if something goes wrong
      }
    };
    fetchTimestamps();
  }, []); // Runs once on component mount

  // Filter intervals based on selected task and time range (startTime and endTime)
  useEffect(() => {
    if (selectedTask && timestamps.length > 0) {
      const filteredIntervals = timestamps
        .filter(({ task, timestamp }) => {
          const time = new Date(timestamp).getTime();
          return (
            task === selectedTask && // Matches the selected task
            time >= new Date(startTime).getTime() && // Matches the start time range
            time <= new Date(endTime).getTime() // Matches the end time range
          );
        })
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sorts intervals by timestamp

      const intervals = [];
      let start = null;
      filteredIntervals.forEach(({ type, timestamp }) => {
        const time = new Date(timestamp);
        if (type === 0) {
          start = time; // Mark start of interval
        } else if (type === 1 && start) {
          intervals.push({ start, end: time }); // Push interval when it's complete
          start = null; // Reset start for next interval
        }
      });
      setTaskIntervals(intervals); // Set the filtered intervals
    } else {
      setTaskIntervals([]); // Reset intervals if no task is selected
    }
  }, [selectedTask, startTime, endTime, timestamps]); // Re-run when any of these states change

  // Formats a date object for display (like in a readable string)
  const formatDate = (date) => date.toLocaleString(); // Converts date to a user-friendly string format

  // Formats the duration between two dates into hours, minutes, and seconds
  const formatDuration = (start, end) => {
    const duration = (end - start) / 1000; // Duration in seconds
    const hours = Math.floor(duration / 3600); // Extract hours
    const minutes = Math.floor((duration % 3600) / 60); // Extract minutes
    const seconds = Math.floor(duration % 60); // Extract seconds
    return `${hours}h ${minutes}m ${seconds}s`; // Return formatted string
  };

  // Formats date for use in datetime-local input (e.g. for date pickers)
  const formatDateTimeLocal = (date) => {
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`; // Return datetime-local compatible format
  };

  return (
    <div className="records-container">
      <h2>Records</h2>

      {/* Interval selector - lets the user choose the start and end time */}
      <div className="input-group">
        <label>
          Start Time:
          <input
            type="datetime-local"
            value={formatDateTimeLocal(startTime)} // Display start time in input
            onChange={(e) => setStartTime(new Date(e.target.value).getTime())} // Update start time
          />
        </label>
        <label>
          End Time:
          <input
            type="datetime-local"
            value={formatDateTimeLocal(endTime)} // Display end time in input
            onChange={(e) => setEndTime(new Date(e.target.value).getTime())} // Update end time
          />
        </label>
      </div>

      {/* Task selector - lets the user choose a task to view its intervals */}
      <div className="input-group">
        <label>
          Select Task:
          <select
            value={selectedTask || ''} // Show selected task or empty if none
            onChange={(e) => setSelectedTask(parseInt(e.target.value) || null)} // Update selected task
          >
            <option value="">-- Select a Task --</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name} {/* Display task name */}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Task intervals display - shows the start, end, and duration of task intervals */}
      <div className="task-intervals-display">
        <h3>Activity Intervals for Selected Task</h3>
        {taskIntervals.length > 0 ? (
          <ul>
            {taskIntervals.map(({ start, end }, index) => (
              <li key={index}>
                <strong>Start:</strong> {formatDate(start)}, <strong>End:</strong> {formatDate(end)}, <strong>Duration:</strong> {formatDuration(start, end)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No activity intervals found for the selected task and time range.</p>
        )}
      </div>
    </div>
  );
}

export default Records;
