import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';

const Canvas = forwardRef(({ tool, color, brushSize, socket }, ref) => {
  const canvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setContext(ctx);
    
    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth - 40;
      canvas.height = container.clientHeight - 40;
      
      // Redraw history after resize
      if (history.length > 0) {
        redrawCanvas(history.slice(0, historyIndex + 1));
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Handle WebSocket events
  useEffect(() => {
    if (!socket) return;

    // Receive drawing history when connecting
    socket.on('drawing-history', (historyData) => {
      redrawCanvas(historyData);
      setHistory(historyData);
      setHistoryIndex(historyData.length - 1);
    });

    // Receive drawing events from other users
    socket.on('drawing', (data) => {
      drawOnCanvas(data, false);
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
  const drawOnCanvas = (data, isLocal = true) => {
    if (!context) return;
    
    const { tool, points, color, brushSize } = data;
    
    context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    if (tool === 'pencil' || tool === 'eraser') {
      if (tool === 'eraser') {
        context.save();
        context.globalCompositeOperation = 'destination-out';
      }
      
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i].x, points[i].y);
      }
      
      context.stroke();
      
      if (tool === 'eraser') {
        context.restore();
      }
    } else if (tool === 'line') {
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      context.lineTo(points[1].x, points[1].y);
      context.stroke();
    } else if (tool === 'rectangle') {
      context.beginPath();
      context.rect(points[0].x, points[0].y, points[1].x - points[0].x, points[1].y - points[0].y);
      context.stroke();
    } else if (tool === 'oval') {
      context.beginPath();
      const radiusX = Math.abs(points[1].x - points[0].x) / 2;
      const radiusY = Math.abs(points[1].y - points[0].y) / 2;
      const centerX = points[0].x + (points[1].x - points[0].x) / 2;
      const centerY = points[0].y + (points[1].y - points[0].y) / 2;
      context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      context.stroke();
    }
  };

  // Redraw entire canvas from history
  const redrawCanvas = (historyData) => {
    if (!context) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Redraw all history items
    historyData.forEach(data => {
      drawOnCanvas(data, false);
    });
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!context) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Handle mouse events
  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPath([{ x, y }]);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add point to current path
    setCurrentPath(prev => [...prev, { x, y }]);
    
    // For immediate feedback - clear and redraw everything
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    redrawCanvas(history.slice(0, historyIndex + 1));
    
    // Draw current temporary shape
    context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    if (tool === 'pencil' || tool === 'eraser') {
      if (tool === 'eraser') {
        context.save();
        context.globalCompositeOperation = 'destination-out';
      }
      
      context.beginPath();
      context.moveTo(currentPath[0].x, currentPath[0].y);
      
      for (let i = 1; i < currentPath.length; i++) {
        context.lineTo(currentPath[i].x, currentPath[i].y);
      }
      
      context.stroke();
      
      if (tool === 'eraser') {
        context.restore();
      }
    } else if (tool === 'line') {
      context.beginPath();
      context.moveTo(startPos.x, startPos.y);
      context.lineTo(x, y);
      context.stroke();
    } else if (tool === 'rectangle') {
      context.beginPath();
      context.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      context.stroke();
    } else if (tool === 'oval') {
      context.beginPath();
      const radiusX = Math.abs(x - startPos.x) / 2;
      const radiusY = Math.abs(y - startPos.y) / 2;
      const centerX = startPos.x + (x - startPos.x) / 2;
      const centerY = startPos.y + (y - startPos.y) / 2;
      context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      context.stroke();
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add final point
    const finalPath = tool === 'pencil' || tool === 'eraser' 
      ? [...currentPath, { x, y }] 
      : [startPos, { x, y }];
    
    // Create drawing data
    const drawingData = {
      tool,
      points: finalPath,
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
    setCurrentPath([]);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    undo: () => {
      if (historyIndex >= 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        redrawCanvas(history.slice(0, newIndex + 1));
      }
    },
    redo: () => {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        redrawCanvas(history.slice(0, newIndex + 1));
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
      className="border border-gray-300 rounded-lg cursor-crosshair w-full h-full"
    />
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;