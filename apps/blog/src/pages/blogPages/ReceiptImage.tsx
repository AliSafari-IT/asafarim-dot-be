import React, { useState } from "react";

const ReceiptImage = () => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[imgWidth, imgHeight], setImgSize] = useState([0, 0]);
  const [[x, y], setXY] = useState([0, 0]);
  
  // Calculate zoom level
  const magnifierSize = 120;
  const zoomLevel = 3;
  
  // Load image dimensions on mount
  const getImgSize = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setImgSize([width, height]);
  };
  
  // Handle mouse movements
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();
    
    // Calculate cursor position relative to the image
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    setXY([x, y]);
  };
  
  return (
    <div 
      className="img-wrapper" 
      style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%', 
        minHeight: '500px'
      }}
    >
      <div 
        className="img-container"
        style={{ 
          position: 'relative', 
          maxWidth: '800px', 
          width: '100%', 
          margin: '0 auto' 
        }}
        onMouseEnter={() => setShowMagnifier(true)}
        onMouseLeave={() => setShowMagnifier(false)}
        onMouseMove={handleMouseMove}
      >
        <img 
          src="/img/blog/codeium-pro-ultimate.png" 
          alt="Codeium Pro Ultimate Subscription Receipt" 
          className="receipt-image"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            margin: '0 auto'
          }}
          onLoad={getImgSize}
        />
        
        {showMagnifier && imgWidth > 0 && imgHeight > 0 && (
          <div
            style={{
              position: 'absolute',
              // Position the magnifier
              left: `${x}px`,
              top: `${y}px`,
              // Size of the magnifier
              width: `${magnifierSize}px`,
              height: `${magnifierSize}px`,
              // Move it center to cursor
              transform: 'translate(-50%, -50%)',
              border: '2px solid white',
              borderRadius: '50%',
              // Background settings
              backgroundImage: `url(/img/blog/codeium-pro-ultimate.png)`,
              backgroundRepeat: 'no-repeat',
              // Calculate the background position
              backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
              backgroundPosition: `
                ${-x * zoomLevel + magnifierSize / 2}px 
                ${-y * zoomLevel + magnifierSize / 2}px
              `,
              pointerEvents: 'none',
              opacity: 1,
              backgroundColor: 'white',
              boxShadow: '0 5px 10px rgba(0,0,0,0.3)',
              zIndex: 1000
            }}
          />
        )}
      </div>
      <div 
        className="img-caption" 
        style={{ 
          textAlign: 'center', 
          marginTop: '10px', 
          width: '100%' 
        }}
      >
        <strong>Note:</strong> The receipt image is a personal record of the Codeium Pro Ultimate subscription purchase, included for documentation purposes.
      </div>
    </div>
  );
};

export default ReceiptImage;