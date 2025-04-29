// src/App.jsx
import { useState, useRef, useCallback } from 'react';
import MCTSTreeVisualizer from './components/MCTSTreeVisualizer';
import './App.css';

function App() {
  const [treeData, setTreeData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  // Handle file input change
  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  // Process the file
  const handleFile = (file) => {
    if (file.type !== 'application/json') {
      alert('Please upload a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setTreeData(data);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Error parsing JSON file: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  // Trigger file input click
  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="app-container">
      <h1>MCTS Tree Visualizer</h1>
      
      {!treeData ? (
        <div 
          className={`drag-drop-area ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            ref={inputRef}
            type="file" 
            accept=".json"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          <div className="drag-drop-content">
            <p>Drag and drop your MCTS tree data JSON file here</p>
            <p>or</p>
            <button className="upload-button" onClick={onButtonClick}>
              Select File
            </button>
          </div>
        </div>
      ) : (
        <div className="visualization-container">
          <button 
            className="back-button"
            onClick={() => setTreeData(null)}
          >
            ← Upload Another File
          </button>
          <MCTSTreeVisualizer treeData={treeData} />
        </div>
      )}
    </div>
  );
}

export default App;