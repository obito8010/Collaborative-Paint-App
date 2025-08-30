import React from 'react';

const ColorPicker = ({ color, setColor }) => {
  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#00ffff', '#ff00ff', '#ff8800', '#8800ff'
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">Colors</h2>
      <div className="grid grid-cols-5 gap-2 mb-3">
        {colors.map((c, i) => (
          <button
            key={i}
            onClick={() => setColor(c)}
            className={`w-8 h-8 rounded-full border-2 ${
              color === c ? 'border-gray-800' : 'border-gray-300'
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
      <div className="flex items-center">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-10 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ColorPicker;