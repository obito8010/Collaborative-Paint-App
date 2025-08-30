import React from 'react';

const ClearButton = ({ canvasRef }) => {
  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleClear}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        title="Clear Canvas"
      >
        <span className="mr-2">🗑️</span> Clear Canvas
      </button>
    </div>
  );
};

export default ClearButton;