import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { Wind } from '../utils/weatherService';

// Create a custom wind arrow icon
const createWindArrow = (direction: number, speed: number) => {
  // Create a canvas element to draw the arrow
  const canvas = document.createElement('canvas');
  canvas.width = 40;  // Increased size
  canvas.height = 40; // Increased size
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Draw white circular background
  ctx.beginPath();
  ctx.arc(20, 20, 19, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();
  ctx.strokeStyle = '#1976d2';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Add speed text first (before rotation)
  ctx.fillStyle = '#000';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${speed}`, 20, 17); // Restored original text position

  // Set up the arrow style
  ctx.strokeStyle = '#1976d2';
  ctx.fillStyle = '#1976d2';
  ctx.lineWidth = 2;

  // Move to center of canvas
  ctx.translate(20, 20);
  // Rotate the canvas (subtract 90 to align with true north, and convert to radians)
  ctx.rotate(((direction - 90) * Math.PI) / 180);

  // Draw the arrow (starting from center)
  ctx.beginPath();
  // Arrow shaft
  ctx.moveTo(0, 0);     // Start from center
  ctx.lineTo(12, 0);    // Draw to the right
  // Arrow head
  ctx.lineTo(8, -4);    // Top of arrow head
  ctx.moveTo(12, 0);
  ctx.lineTo(8, 4);     // Bottom of arrow head
  ctx.stroke();

  return L.divIcon({
    html: `<img src="${canvas.toDataURL()}" style="width:40px; height:40px;">`,
    className: 'wind-arrow',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

interface WindArrowProps {
  position: [number, number];
  windDirection: Wind;
  windSpeed: Wind;
}

const WindArrow = ({ position, windDirection, windSpeed }: WindArrowProps) => {
  const windArrowIcon = createWindArrow(windDirection.value, windSpeed.value);
  if (!windArrowIcon) return null;

  return (
    <Marker
      position={position}
      icon={windArrowIcon}
      zIndexOffset={1000}
    />
  );
};

export default WindArrow; 