import React from 'react';

const UndoRedo = ({ canvasRef }) => {
  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };

  const handleRedo = () => {
    if (canvasRef.current) {
      canvasRef.current.redo();
    }
  };

  return (
    <div className="mb-4 grid grid-cols-2 gap-2">
      <button
        onClick={handleUndo}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        title="Undo"
      >
        <span className="mr-2">↩️</span> Undo
      </button>
      <button
        onClick={handleRedo}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        title="Redo"
      >
        <span className="mr-2">↪️</span> Redo
      </button>
    </div>
  );
};

export default UndoRedo;