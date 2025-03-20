import React, { useState, useEffect } from 'react';
import '../styles/AddTask.css';

function AddTask({ onClose, onSave, initialData, availableTags, setAvailableTags }) {
  const [taskData, setTaskData] = useState({ name: '', tags: [] });  // Initial state for task name and tags
  const [newTag, setNewTag] = useState('');  // Holds the value of the new tag input field
  const [selectedTags, setSelectedTags] = useState([]);  // Keeps track of tags selected by the user

  // This useEffect runs when the component is loaded or when initialData changes.
  // If we're editing an existing task, it will pre-fill the form fields.
  useEffect(() => {
    if (initialData) {
      setTaskData({
        name: initialData.name,  // Set the task name to the initial data's name
        tags: initialData.tags ? initialData.tags.split(',') : [],  // Set tags as an array from a comma-separated string
      });
      setSelectedTags(initialData.tags ? initialData.tags.split(',').map(Number) : []); // Convert tag IDs to numbers
    } else {
      setTaskData({ name: '', tags: [] }); // Reset fields for new task
      setSelectedTags([]); // Clear selected tags
    }
  }, [initialData]);  // Only re-run when initialData changes

  // This function is for adding a new tag to the list.
  // If the tag already exists, it adds it to the selected tags list. If not, it creates a new tag.
  const handleAddNewTag = async () => {
    if (newTag.trim()) {  // Only proceed if the input is not empty
        const existingTag = availableTags.find(tag => tag && tag.name && tag.name.toLowerCase() === newTag.toLowerCase());

        if (!existingTag) {  // If tag doesn't already exist, create it
            try {
                // Create the new tag in the backend
                const response = await fetch('http://127.0.0.1:3010/tags', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newTag.trim() }),
                });

                if (response.ok) {  // If tag creation is successful
                    // Fetch the updated list of available tags
                    const tagsResponse = await fetch('http://127.0.0.1:3010/tags');
                    if (tagsResponse.ok) {
                        const tagsData = await tagsResponse.json();
                        setAvailableTags(tagsData);  // Update the list of available tags in the parent component
                    }

                    const newTagObj = await response.json();

                    // If the new tag object is valid, add it to the selected tags list
                    if (newTagObj && newTagObj.id) {
                        setSelectedTags(prevTags => [...prevTags, newTagObj.id]);
                        setTaskData(prevData => ({
                            ...prevData,
                            tags: [...prevData.tags, newTagObj.id],  // Add the new tag ID to the task's tags
                        }));
                        setNewTag('');  // Clear the input field after adding the tag
                    }
                }
            } catch (error) {
                console.error('Error creating tag:', error);  // Handle any errors during the tag creation process
            }
        } else {
            // If the tag already exists, just add its ID to the selected tags
            setSelectedTags(prevTags => [...prevTags, existingTag.id]);
        }
    }
  };

  // This function handles when a user clicks a checkbox to select or unselect an existing tag
  const handleTagSelection = (tagId) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tagId)  // If the tag is already selected, remove it
        ? prevTags.filter(id => id !== tagId)
        : [...prevTags, tagId]  // Otherwise, add the tag to the selected list
    );
  };

  // Updates the task's name or other field when the user types in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;  // Get the name and value of the field being edited
    setTaskData((prevData) => ({ ...prevData, [name]: value }));  // Update the corresponding field
  };

  // This function is called when the user submits the form to save the task
  const handleSubmit = (e) => {
    e.preventDefault();  // Prevent the default form submission
    const selectedTagNames = selectedTags.map(id => {
      // Convert the tag IDs back to tag names
      const tag = availableTags.find(tag => tag.id === id);
      return tag ? tag.name : '';
    }).filter(name => name !== '');  // Filter out any empty names

    onSave({
      ...taskData,
      tags: selectedTagNames.join(','),  // Store the tags as a comma-separated string
    });
    onClose();  // Close the modal after saving the task
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialData ? 'Edit Task' : 'Add New Task'}</h2>  {/* Show different title based on editing or adding */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Task Name"
            value={taskData.name}  // Bind the input field to the task's name
            onChange={handleInputChange}  // Update the task's name as the user types
            required  // Make this field mandatory
          />
          
          <div className="tag-selection">
            <h3>Select Existing Tags</h3>
            <div className="tag-list">
              {availableTags.map(tag => (
                <label key={tag.id} className="tag-option">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}  // Mark the checkbox as checked if the tag is selected
                    onChange={() => handleTagSelection(tag.id)}  // Handle checkbox click to select/unselect the tag
                  />
                  <span className="tag-name">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="new-tag">
            <input
              type="text"
              placeholder="Add new tag"
              value={newTag}  // Bind the input field to the newTag state
              onChange={(e) => setNewTag(e.target.value)}  // Update the new tag value as the user types
            />
            <button
              type="button"
              onClick={handleAddNewTag}  // Trigger adding the new tag when clicked
            >
              Add Tag
            </button>
          </div>

          <div className="submit-buttons">
            <button type="button" onClick={onClose}>Cancel</button>  {/* Close the modal without saving */}
            <button type="submit">Save Task</button>  {/* Save the task when the form is submitted */}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTask;
