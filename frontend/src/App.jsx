import React, { useState, useRef } from "react";
import CanvasDraw from "react-canvas-draw";

const App = () => {
  const [image, setImage] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [brushRadius, setBrushRadius] = useState(5);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid JPEG or PNG image.");
    }
  };

  const handleGenerateMask = () => {
    if (canvasRef.current && image) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const drawingCanvas = canvasRef.current.canvasContainer.children[1];

      canvas.width = drawingCanvas.width;
      canvas.height = drawingCanvas.height;

      // Fill the background with black
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the white mask from the drawing canvas
      ctx.drawImage(drawingCanvas, 0, 0);
      const maskDataUrl = canvas.toDataURL();
      setMaskImage(maskDataUrl);

      // Create a masked part of the image
      const imageCanvas = document.createElement("canvas");
      const imageCtx = imageCanvas.getContext("2d");

      imageCanvas.width = canvas.width;
      imageCanvas.height = canvas.height;

      const baseImage = new Image();
      baseImage.src = image;
      baseImage.onload = () => {
        imageCtx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        // Apply mask
        const maskImage = new Image();
        maskImage.src = maskDataUrl;
        maskImage.onload = () => {
          imageCtx.globalCompositeOperation = "destination-in";
          imageCtx.drawImage(maskImage, 0, 0);
        };
      };
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  const handleBrushRadiusChange = (increment) => {
    setBrushRadius((prevRadius) => Math.max(1, prevRadius + increment));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Image Inpainting Widget</h1>

      {/* Image Upload */}
      <div className="mb-4">
        <input
          type="file"
          accept="image/jpeg, image/png"
          onChange={handleImageUpload}
          className="block cursor-pointer w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Canvas */}
      {image && (
        <div className="relative">
          <img
            src={image}
            alt="Uploaded"
            className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
          />
          <CanvasDraw
            ref={canvasRef}
            canvasWidth={800}
            canvasHeight={600}
            brushColor="white"
            brushRadius={brushRadius}
            lazyRadius={0}
            enablePanAndZoom={false}

            hideGrid={true}
            allowTouchDrawing={true}
            zoomExtents={{ min: 0.5, max: 4 }}
            className="border rounded-md"
          />
        </div>
      )}

      {/* Controls */}
      {image && (
        <div className="flex flex-wrap justify-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBrushRadiusChange(-1)}
              className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600"
            >
              -
            </button>
            <span className="text-lg font-semibold">Brush: {brushRadius}px</span>
            <button
              onClick={() => handleBrushRadiusChange(1)}
              className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600"
            >
              +
            </button>
          </div>
          <button
            onClick={handleGenerateMask}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Generate Mask
          </button>
          <button
            onClick={handleClearCanvas}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Clear Canvas
          </button>
        </div>
      )}

      {/* Display Results */}
      {(maskImage) && (
        <div className="mt-6 grid grid-cols-2 gap-5">
          <div>
            <h2 className="text-lg font-bold mb-2">Original Image</h2>
            <img src={image} alt="Original" className="w-full h-auto border rounded-md" />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2">Mask Image</h2>
            <img src={maskImage} alt="Mask" className="w-full h-auto border rounded-md bg-black" />
            <a
              href={maskImage}
              download="mask.png"
              className="mt-2 inline-block text-blue-500 hover:underline"
            >
              Download Mask
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
