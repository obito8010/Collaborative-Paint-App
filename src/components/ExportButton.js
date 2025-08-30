import React from 'react';

const ExportButton = ({ canvasRef }) => {
  const handleExport = () => {
    if (canvasRef.current) {
      canvasRef.current.export();
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleExport}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        title="Export as PNG"
      >
        <span className="mr-2">💾</span> Export PNG
      </button>
    </div>
  );
};

export default ExportButton;