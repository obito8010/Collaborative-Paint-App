import React from 'react';

const Toolbar = ({ tool, setTool }) => {
  const tools = [
    { id: 'pencil', icon: '✏️', label: 'Pencil' },
    { id: 'eraser', icon: '🧽', label: 'Eraser' },
    { id: 'line', icon: '📏', label: 'Line' },
    { id: 'rectangle', icon: '□', label: 'Rectangle' },
    { id: 'oval', icon: '○', label: 'Oval' },
    { id: 'triangle', icon: '△', label: 'Triangle' },
    { id: 'paint-bucket', icon: '🎨', label: 'Paint Bucket' },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">Tools</h2>
      <div className="grid grid-cols-4 gap-2">
        {tools.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setTool(id)}
            className={`p-3 rounded-lg transition-all duration-200 ${
              tool === id
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={label}
          >
            <span className="text-xl">{icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;