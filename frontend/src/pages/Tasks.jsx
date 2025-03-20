import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import ThreeDotsIcon from '../assets/three-dots-vertical.svg';
import AddTask from '../components/AddTask';
import Filter from '../components/Filter';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [buttonStatus, setButtonStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  // Fetching tasks, tags, and timestamps when the component loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksResponse = await fetch('http://127.0.0.1:3010/tasks');
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);

        const tagsResponse = await fetch('http://127.0.0.1:3010/tags');
        const tagsData = await tagsResponse.json();
        setTags(tagsData);

        const timestampsResponse = await fetch('http://127.0.0.1:3010/timestamps');
        const timestamps = await timestampsResponse.json();
        const initialStatus = {};
        tasksData.forEach(task => {
          const taskTimestamps = timestamps.filter(ts => ts.task === task.id);
          initialStatus[task.id] = taskTimestamps.length > 0 && taskTimestamps[taskTimestamps.length - 1].type === 0 ? 'Stop' : 'Start';
        });
        setButtonStatus(initialStatus);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Capitalizes the first letter of a string
  const capitalizeFirstLetter = (string) => {
    if (!string) return ''; 
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Converts tag IDs to tag names
  const getTagNames = (tagIds) => {
    const tagIdArray = tagIds.split(','); 
    const tagNames = tagIdArray.map((id) => {
      const tag = tags.find((tag) => tag.id === parseInt(id)); 
      return tag ? tag.name : ''; 
    });
    return tagNames.join(', '); 
  };

  // Handles the start/stop button click to add timestamps
  const handleButtonClick = async (taskId) => {
    const isActive = buttonStatus[taskId] === 'Stop';
    const timestampType = isActive ? 1 : 0;

    // Add 2 hours to the current date
    const date = new Date();
    date.setHours(date.getHours() + 2); // Adding 2 hours
    const timestampWithOffset = date.toISOString().slice(0, 19).replace('T', ' ');

    try {
      const response = await fetch('http://127.0.0.1:3010/timestamps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: timestampWithOffset, // Use the adjusted timestamp
          task: taskId,
          type: timestampType,
        }),
      });

      if (response.ok) {
        setButtonStatus((prevStatus) => ({
          ...prevStatus,
          [taskId]: isActive ? 'Start' : 'Stop',
        }));
      } else {
        console.log('Failed to update timestamp');
      }
    } catch (error) {
      console.log('Error updating timestamp:', error);
    }
  };

  // Opens the modal to add a new task
  const handleAddTaskClick = () => {
    setCurrentTask(null);      
    setShowModal(true);        
  };

  // Closes the modal
  const handleCloseModal = () => setShowModal(false); 

  // Saves a new task, including tags
  const handleSaveTask = async (newTask) => {
    try {
      const tagIds = await getTagIds(newTask.tags);
      const taskWithTags = { ...newTask, tags: tagIds }; 

      // Add 2 hours to the current date
      const date = new Date();
      date.setHours(date.getHours() + 2); // Adding 2 hours
      const timestampWithOffset = date.toISOString().slice(0, 19).replace('T', ' ');

      const response = await fetch('http://127.0.0.1:3010/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskWithTags,
          timestamp: timestampWithOffset, // Use the adjusted timestamp
        }),
      });
      if (response.ok) {
        const savedTask = await response.json();
        setTasks((prevTasks) => [...prevTasks, savedTask]);
        handleCloseModal(); // Close modal after saving
        window.location.reload(); 
      } else {
        console.log('Failed to add task');
      }
    } catch (error) {
      console.log('Error submitting task:', error);
    }
  };

  // Get tag IDs from the task input
  const getTagIds = async (tagsInput) => {
    const tagNames = tagsInput.split(',').map(tag => tag.trim());
    const tagIds = await Promise.all(tagNames.map(async (tag) => {
      const existingTag = tags.find(t => t.name.toLowerCase() === tag.toLowerCase());
      if (existingTag) {
        return existingTag.id;
      } else {
        const response = await fetch('http://127.0.0.1:3010/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: tag }),
        });
        if (response.ok) {
          const newTag = await response.json();
          setTags(prevTags => [...prevTags, newTag]);
          return newTag.id;
        } else {
          console.error(`Failed to create tag: ${tag}`);
          return null;
        }
      }
    }));
    return tagIds.filter(id => id !== null).join(',');
  };

  // Deletes a task by ID
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://127.0.0.1:3010/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId)); 
      } else {
        console.log('Failed to delete task');
      }
    } catch (error) {
      console.log('Error deleting task:', error);
    }
  };

  // Updates an existing task
  const handleChangeTask = async (task) => {
    if (task) {
      const tagId = await getTagIds(task.tags);
      const taskWithTags = { ...task, tags: tagId };

      const response = await fetch(`http://127.0.0.1:3010/tasks/${currentTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskWithTags),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prevTasks) => prevTasks.map(t => (t.id === currentTask.id ? updatedTask : t)));
        handleCloseModal(); // Close modal after updating
        window.location.reload(); 
      } else {
        console.log('Failed to update task');
      }
    }
  };

  // Opens the modal to edit an existing task
  const handleEditTaskClick = (task) => {
    setCurrentTask(task);      
    setShowModal(true);        
  };

  // Filters tasks based on selected tags
  const filteredTasks = tasks.filter((task) => {
    if (selectedTags.length === 0) return true; 
    const taskTagIds = task.tags.split(',').map(Number);
    return selectedTags.every((tagId) => taskTagIds.includes(tagId));
  });

  // Select or deselect tags for filtering
  const handleSelectTag = (tagId) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId]
    );
  };

  // Clears all selected filters
  const handleClearFilters = () => setSelectedTags([]);

  // Opens the filter menu
  const handleOpenFilter = () => setShowFilter(true);

  // Closes the filter menu
  const handleCloseFilter = () => setShowFilter(false);

  // Starts the drag-and-drop action
  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  // Prevents default behavior when dragging over an element
  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  // Handles the drop of a dragged task onto another task
  const handleDrop = (e, targetTask) => {
    e.preventDefault(); 
    if (!draggedTask) return;

    const updatedTasks = [...tasks];
    const draggedTaskIndex = updatedTasks.findIndex(t => t.id === draggedTask.id);
    const targetTaskIndex = updatedTasks.findIndex(t => t.id === targetTask.id);

    if (draggedTaskIndex === targetTaskIndex) return;

    const [removedTask] = updatedTasks.splice(draggedTaskIndex, 1);
    updatedTasks.splice(targetTaskIndex, 0, removedTask);

    setTasks(updatedTasks);
    setDraggedTask(null); 
  };

  return (
    <div className="app-container">
      <h1>Tasks</h1>
      
      <button onClick={handleOpenFilter} className="filter-button">Filter by Tags</button>

      {showFilter && (
        <Filter
          tags={tags}
          selectedTags={selectedTags}
          onSelectTag={handleSelectTag}
          onClear={handleClearFilters}
          onClose={handleCloseFilter}
        />
      )}

      <div className="task-container">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            className={`task-item ${buttonStatus[task.id] === 'Stop' ? 'active-task' : ''}`}
            draggable
            onDragStart={() => handleDragStart(task)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, task)}
          >
            <div className="task-buttons">
              <button className="close" onClick={() => handleDeleteTask(task.id)}>X</button>
              <button className="close" onClick={() => handleEditTaskClick(task)}>
                <img src={ThreeDotsIcon} alt="Options" style={{ width: '1em', height: '1em' }} />
              </button>
            </div>
            <h2 className="task-name">{capitalizeFirstLetter(task.name)}</h2>
            <button
              onClick={() => handleButtonClick(task.id)}
              className={buttonStatus[task.id] === 'Start' ? 'start-button' : ''}
            >
              {buttonStatus[task.id]}
            </button>
            {buttonStatus[task.id] === 'Stop' && (
              <p className="task-active-text">Task is active! Press "stop" when you finish the activity.</p>
            )}
            <p className="task-tags">Tags: {getTagNames(task.tags)}</p>
          </div>
        ))}

        <div className="task-item add-item">
          <button onClick={handleAddTaskClick}>+</button>
          <p>Add task</p>
        </div>

        {showModal && (
          <AddTask
            onClose={handleCloseModal}
            onSave={currentTask ? handleChangeTask : handleSaveTask}
            initialData={currentTask}
            availableTags={tags}
            setAvailableTags={setTags}
          />
        )}
      </div>
    </div>
  );
}

export default Tasks;
