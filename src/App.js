import React, { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import ColorPicker from './components/ColorPicker';
import BrushSizeSlider from './components/BrushSizeSlider';
import ExportButton from './components/ExportButton';
import UserCount from './components/UserCount';

// ✅ Add these imports
import UndoRedo from './components/UndoRedo';
import ClearButton from './components/ClearButton';

function App() {
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState(0);
  const canvasRef = useRef();

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for user count updates
    newSocket.on('users-count', (count) => {
      setUsers(count);
    });

    return () => newSocket.close();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Collaborative Paint App
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar with tools */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:w-1/5">
            <Toolbar tool={tool} setTool={setTool} />
            <ColorPicker color={color} setColor={setColor} />
            <BrushSizeSlider brushSize={brushSize} setBrushSize={setBrushSize} />
            
            {/* ✅ Added Undo/Redo and Clear buttons */}
            <UndoRedo canvasRef={canvasRef} />
            <ClearButton canvasRef={canvasRef} />
            
            <ExportButton canvasRef={canvasRef} />
            <UserCount count={users} />
          </div>
          
          {/* Canvas area */}
          <div className="bg-white rounded-xl shadow-lg p-4 flex-1">
            <Canvas
              ref={canvasRef}
              tool={tool}
              color={color}
              brushSize={brushSize}
              socket={socket}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
