import React, { useState, useEffect } from 'react';
import '../styles/Summary.css';

function Summary() {
  // Helper function to get the local date and time in the format needed for input fields
  const getLocalDateTime = (date) => {
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`; // Converts to string format for datetime-local input
  };

  // State to manage the start and end time (initially set to today)
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to midnight (00:00)
    return getLocalDateTime(now); // Convert to local timezone string
  });

  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    return getLocalDateTime(now); // Set to current time
  });

  // State to hold the fetched data
  const [tasksSummary, setTasksSummary] = useState([]); // Summary of tasks
  const [tagsSummary, setTagsSummary] = useState([]); // Summary of tags
  const [tasks, setTasks] = useState([]); // List of tasks
  const [tags, setTags] = useState([]); // List of tags
  const [timestamps, setTimestamps] = useState([]); // List of timestamps

  // Fetch tasks from the server
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3010/tasks');
        const tasksData = await response.json();
        setTasks(tasksData); // Store the fetched tasks in state
      } catch (error) {
        console.error('Error fetching tasks:', error); // Log any errors
      }
    };
    fetchTasks();
  }, []); // Only run once when the component mounts

  // Fetch tags from the server
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3010/tags');
        const tagsData = await response.json();
        setTags(tagsData); // Store the fetched tags in state
      } catch (error) {
        console.error('Error fetching tags:', error); // Log any errors
      }
    };
    fetchTags();
  }, []); // Only run once when the component mounts

  // Fetch timestamps and filter them based on the selected time range
  useEffect(() => {
    const fetchTimestamps = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3010/timestamps');
        const timestampsData = await response.json();

        // Filter timestamps to match the selected date range
        const filteredTimestamps = timestampsData.filter(({ timestamp }) => {
          const time = new Date(timestamp).getTime();
          return time >= new Date(startTime).getTime() && time <= new Date(endTime).getTime();
        });

        setTimestamps(filteredTimestamps); // Store filtered timestamps
      } catch (error) {
        console.error('Error fetching records:', error); // Log any errors
      }
    };
    if (tasks.length > 0) {
      fetchTimestamps(); // Only fetch timestamps if tasks are available
    }
  }, [tasks, startTime, endTime]); // Fetch timestamps whenever tasks, startTime, or endTime change

  // Calculate task and tag summaries based on timestamps
  useEffect(() => {
    if (tasks.length > 0 && timestamps.length > 0) {
      calculateSummary(); // Recalculate summary whenever tasks or timestamps change
    }
  }, [tasks, timestamps]);

  // Function to calculate the summary of active time for each task and tag
  const calculateSummary = () => {
    const taskDurations = {}; // Object to store task durations
    const tagDurations = {}; // Object to store tag durations

    // Loop through all timestamps to calculate durations for tasks and tags
    timestamps.forEach(({ task, type, timestamp }) => {
      const taskId = task;
      const time = new Date(timestamp).getTime();

      if (type === 0) { // Type 0 means task has started
        if (!taskDurations[taskId]) {
          taskDurations[taskId] = { activeTime: 0, lastStart: time };
        } else {
          taskDurations[taskId].lastStart = time; // Update start time if task is already active
        }
      } else if (type === 1 && taskDurations[taskId]?.lastStart) { // Type 1 means task has ended
        const duration = time - taskDurations[taskId].lastStart;
        taskDurations[taskId].activeTime += duration; // Add the duration to the task's active time
        taskDurations[taskId].lastStart = null; // Reset the start time after the task ends
      }
    });

    // Generate the task summary based on active time
    const taskSummary = [];
    for (const [taskId, { activeTime }] of Object.entries(taskDurations)) {
      const taskDurationInSeconds = Math.floor(activeTime / 1000); // Convert active time to seconds
      const task = tasks.find(task => task.id === parseInt(taskId));
      const taskName = task ? task.name : 'Unknown Task';

      if (taskName !== 'Unknown Task') {
        taskSummary.push({ taskId: taskName, activeTime: taskDurationInSeconds });
      }

      // Find and update the tag durations associated with the task
      const associatedTags = getTagsForTask(task);
      associatedTags.forEach(tagId => {
        const tagName = getTagName(tagId);
        if (!tagDurations[tagName]) {
          tagDurations[tagName] = taskDurationInSeconds; // First time this tag appears, set the active time
        } else {
          tagDurations[tagName] += taskDurationInSeconds; // Add to the existing active time for the tag
        }
      });
    }

    // Set the task and tag summaries in state
    setTasksSummary(taskSummary);
    setTagsSummary(Object.entries(tagDurations).map(([tag, time]) => ({ tag, activeTime: time })));
  };

  // Get the list of tag IDs associated with a task
  const getTagsForTask = (task) => {
    if (!task || !task.tags) return []; // If no tags, return an empty array
    const tagIds = task.tags.split(',').map(tagId => tagId.trim());
    return tagIds;
  };

  // Get the tag name for a given tag ID
  const getTagName = (tagId) => {
    const tag = tags.find(tag => tag.id === parseInt(tagId));
    return tag ? tag.name : 'Unknown Tag'; // Return the tag name or 'Unknown Tag' if not found
  };

  // Format the active time in a human-readable format (hours, minutes, seconds)
  const formatActiveTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`; // Return the formatted active time
  };

  return (
    <div className="summary-container">
      <h2>Summary</h2>

      <div className="input-group">
        <label>
          Start Time:
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)} // Update start time when input changes
          />
        </label>
        <label>
          End Time:
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)} // Update end time when input changes
          />
        </label>
      </div>

      <div className="summary-display">
        <h3>Task Summary</h3>
        <ul>
          {tasksSummary.map(({ taskId, activeTime }, index) => (
            <li key={`${taskId}-${index}`}>
              Task {taskId}: {formatActiveTime(activeTime)} active
            </li>
          ))}
        </ul>

        <h3>Tag Summary</h3>
        <ul>
          {tagsSummary.map(({ tag, activeTime }, index) => (
            <li key={`${tag}-${index}`}>Tag {tag}: {formatActiveTime(activeTime)} active</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Summary;
