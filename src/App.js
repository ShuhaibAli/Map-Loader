import React, { useState } from 'react';
import './App.css';
import MapView from './MapView';
import logo from './images/logo-chakra.jpg'; // Import the logo image

function App() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [editGeoJsonData, setEditGeoJsonData] = useState(null);
  const [currentMode, setCurrentMode] = useState('view');
  const [unsavedFeature, setUnsavedFeature] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const data = JSON.parse(reader.result);
          setGeoJsonData(data);
          setEditGeoJsonData(data);
        } catch (error) {
          console.error('Error parsing GeoJSON file', error);
          alert('Error parsing GeoJSON file. Please ensure it is valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAddIcon = (coordinates) => {
    if (currentMode === 'edit' && editGeoJsonData) {
      const newIcon = {
        type: 'Feature',
        properties: { icon: 'red-circle', info: 'New Icon' },
        geometry: {
          type: 'Point',
          coordinates,
        },
      };
      const updatedGeoJsonData = {
        ...editGeoJsonData,
        features: [...(editGeoJsonData.features || []), newIcon],
      };
      setEditGeoJsonData(updatedGeoJsonData);
      setUnsavedFeature(newIcon);
      return newIcon;
    }
    return null;
  };

  const handleEdit = () => {
    setCurrentMode('edit');
  };

  const handleSave = () => {
    if (editGeoJsonData) {
      setGeoJsonData(editGeoJsonData);
      setCurrentMode('view');
      setUnsavedFeature(null);
    }
  };

  const handleView = () => {
    setCurrentMode('view');
    setEditGeoJsonData(geoJsonData); // Revert to the last saved state
    setUnsavedFeature(null);
  };

  const clearUnsavedFeature = () => {
    setUnsavedFeature(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="heading-container">
          <img src={logo} alt="Logo" className="logo" />
          <h1 className="heading">Map Viewer & Editor</h1>
        </div>
      </header>
      <MapView
        geoJsonData={geoJsonData}
        editGeoJsonData={editGeoJsonData}
        currentMode={currentMode}
        onAddIcon={handleAddIcon}
        clearUnsavedFeature={clearUnsavedFeature}
      />
      <div className="upload-container">
        <input
          type="file"
          id="loadfile"
          accept=".geojson"
          onChange={handleFileChange}
        />
        <label htmlFor="loadfile">Upload GeoJSON File</label>
      </div>
      <div>
        <button
          className={currentMode === 'edit' ? 'edit-mode' : ''}
          onClick={handleEdit}
        >
          Edit
        </button>
        <button
          className={currentMode === 'view' && !unsavedFeature ? 'save-mode' : ''}
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className={currentMode === 'view' ? 'view-mode' : ''}
          onClick={handleView}
        >
          View
        </button>
      </div>
    </div>
  );
}

export default App;




