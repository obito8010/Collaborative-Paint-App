import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';

const Canvas = forwardRef(({ tool, color, brushSize, socket }, ref) => {
  const canvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setContext(ctx);
    
    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth - 40; // Account for padding
      canvas.height = container.clientHeight - 40;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Handle WebSocket events
  useEffect(() => {
    if (!socket) return;

    // Receive drawing history when connecting
    socket.on('drawing-history', (history) => {
      redrawCanvas(history);
      setHistory(history);
      setHistoryIndex(history.length - 1);
    });

    // Receive drawing events from other users
    socket.on('drawing', (data) => {
      drawOnCanvas(data);
      setHistory(prev => [...prev, data]);
      setHistoryIndex(prev => prev + 1);
    });

    // Handle canvas clear
    socket.on('canvas-cleared', () => {
      clearCanvas();
      setHistory([]);
      setHistoryIndex(-1);
    });

    return () => {
      socket.off('drawing-history');
      socket.off('drawing');
      socket.off('canvas-cleared');
    };
  }, [socket, context]);

  // Draw on canvas based on received data
  const drawOnCanvas = (data) => {
    if (!context) return;
    
    const { tool, startX, startY, endX, endY, color, brushSize } = data;
    
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    
    switch (tool) {
      case 'pencil':
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        break;
      case 'eraser':
        context.save();
        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        context.restore();
        break;
      case 'line':
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        break;
      case 'rectangle':
        context.beginPath();
        context.rect(startX, startY, endX - startX, endY - startY);
        context.stroke();
        break;
      case 'oval':
        context.beginPath();
        const radiusX = Math.abs(endX - startX) / 2;
        const radiusY = Math.abs(endY - startY) / 2;
        const centerX = startX + (endX - startX) / 2;
        const centerY = startY + (endY - startY) / 2;
        context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        context.stroke();
        break;
      default:
        break;
    }
  };

  // Redraw entire canvas from history
  const redrawCanvas = (historyData) => {
    if (!context) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Redraw all history items
    historyData.forEach(data => {
      drawOnCanvas(data);
    });
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!context) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Handle mouse/touch events
  const startDrawing = (e) => {
    e.preventDefault();
    const { offsetX, offsetY } = getCoordinates(e);
    
    setIsDrawing(true);
    setStartPos({ x: offsetX, y: offsetY });
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || !context) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    
    // For immediate feedback
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    redrawCanvas(history.slice(0, historyIndex + 1));
    
    // Draw current shape
    context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    
    switch (tool) {
      case 'pencil':
        context.beginPath();
        context.moveTo(startPos.x, startPos.y);
        context.lineTo(offsetX, offsetY);
        context.stroke();
        break;
      case 'eraser':
        context.save();
        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.moveTo(startPos.x, startPos.y);
        context.lineTo(offsetX, offsetY);
        context.stroke();
        context.restore();
        break;
      case 'line':
        context.beginPath();
        context.moveTo(startPos.x, startPos.y);
        context.lineTo(offsetX, offsetY);
        context.stroke();
        break;
      case 'rectangle':
        context.beginPath();
        context.rect(startPos.x, startPos.y, offsetX - startPos.x, offsetY - startPos.y);
        context.stroke();
        break;
      case 'oval':
        context.beginPath();
        const radiusX = Math.abs(offsetX - startPos.x) / 2;
        const radiusY = Math.abs(offsetY - startPos.y) / 2;
        const centerX = startPos.x + (offsetX - startPos.x) / 2;
        const centerY = startPos.y + (offsetY - startPos.y) / 2;
        context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        context.stroke();
        break;
      default:
        break;
    }
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    
    // Create drawing data
    const drawingData = {
      tool,
      startX: startPos.x,
      startY: startPos.y,
      endX: offsetX,
      endY: offsetY,
      color: tool === 'eraser' ? '#FFFFFF' : color,
      brushSize
    };
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(drawingData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Send to server
    if (socket) {
      socket.emit('drawing', drawingData);
    }
    
    setIsDrawing(false);
  };

  // Get coordinates from mouse or touch event
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
      };
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    undo: () => {
      if (historyIndex >= 0) {
        setHistoryIndex(prev => prev - 1);
        redrawCanvas(history.slice(0, historyIndex));
      }
    },
    redo: () => {
      if (historyIndex < history.length - 1) {
        setHistoryIndex(prev => prev + 1);
        redrawCanvas(history.slice(0, historyIndex + 1));
      }
    },
    clear: () => {
      clearCanvas();
      setHistory([]);
      setHistoryIndex(-1);
      if (socket) {
        socket.emit('clear-canvas');
      }
    },
    export: () => {
      const canvas = canvasRef.current;
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'drawing.png';
      link.click();
    }
  }));

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className="border border-gray-300 rounded-lg cursor-crosshair w-full h-full"
    />
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;