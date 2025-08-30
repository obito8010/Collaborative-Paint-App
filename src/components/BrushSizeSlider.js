import React from 'react';

const BrushSizeSlider = ({ brushSize, setBrushSize }) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">Brush Size</h2>
      <div className="flex items-center">
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="ml-3 text-gray-700 min-w-[2rem]">{brushSize}px</span>
      </div>
    </div>
  );
};

export default BrushSizeSlider;