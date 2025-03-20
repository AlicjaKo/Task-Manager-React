import React from 'react';
import '../styles/Filter.css';

function Filter({ tags, selectedTags, onSelectTag, onClear, onClose }) {
  return (
    <div className="filter-container">
      {/* This button closes the filter options */}
      <button onClick={onClose} className="close-button">X</button>
      
      <h2>Filter by Tags</h2>
      
      <div className="filter-options">
        {/* Looping through all tags to create a checkbox for each */}
        {tags.map((tag) => (
            <label key={tag.id} className="tag-checkbox">
                <input
                    type="checkbox"
                    value={tag.id}
                    checked={selectedTags.includes(tag.id)} // Checks if the tag is selected based on selectedTags
                    onChange={() => onSelectTag(tag.id)} // When checkbox is clicked, it triggers onSelectTag to add/remove the tag
                />
                {tag.name} {/* Display the name of the tag next to the checkbox */}
            </label>
        ))}
      </div>
      
      <div className="filter-end">
        {/* Clear all selected filters when this button is clicked */}
        <button onClick={onClear} className="clear-button">Clear All Filters</button>
        
        {/* Save button to save the selected filters and close the filter */}
        <button onClick={onClose} className="save-button">Save</button>
      </div>
    </div>
  );
}

export default Filter;
