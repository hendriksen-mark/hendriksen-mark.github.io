import DxfWriter from 'dxf-writer';
import { formatValue } from './converters';

/**
 * Generate a DXF file containing the thread profile and dimensions
 * @param {Object} results - The calculated thread results
 * @param {number} threadAngle - Thread angle (60° for ISO/UTS, 55° for British)
 * @returns {Blob} - DXF file as a blob
 */
export const generateThreadDXF = (results) => {
  const dxf = new DxfWriter();
  
  // Set up the drawing units (millimeters)
  dxf.setUnits('Millimeters');
  
  // No scaling - use actual dimensions
  const baseX = 0;
  const baseY = 0;
  
  // Calculate triangle dimensions (actual size)
  const H = results.basicTriangleHeight;
  const pitch = results.pitch;
  const h = results.threadHeight;
  const h3 = results.threadHeight3;
  
  // Thread profile coordinates (actual size)
  const triangleHeight = H;
  const triangleBase = pitch;
  
  // Draw single triangle outline
  const trianglePoints = [
    [baseX, baseY],
    [baseX + triangleBase, baseY],
    [baseX + triangleBase / 2, baseY + triangleHeight],
  ];
  
  // Add basic triangle as a polyline (closed)
  dxf.setActiveLayer("0");
  dxf.drawPolyline(trianglePoints, true);
  
  // Draw the actual thread profile (truncated triangle)
  // Correct ISO metric thread standard:
  // - Bottom of thread: H/4 from base
  // - Thread height: 5H/8
  // - Top of thread: H/8 below triangle peak
  // - The thread profile must follow the triangle's sloped sides
  
  // Bottom points at H/4 height from base
  const bottomHeight = baseY + H / 4;
  const bottomLeft = [baseX + triangleBase / 8, bottomHeight];
  const bottomRight = [baseX + triangleBase * 7/8, bottomHeight];
  
  // Top points at H/8 below triangle peak
  const topHeight = baseY + triangleHeight - H / 8;
  
  // Find where the triangle's sloped sides intersect the top height
  // The triangle slopes inward, so we need to find the intersection points
  // Left side slope: from (baseX, baseY) to (baseX + triangleBase/2, baseY + triangleHeight)
  // Right side slope: from (baseX + triangleBase, baseY) to (baseX + triangleBase/2, baseY + triangleHeight)
  
  // Left intersection: where the left triangle side meets the horizontal line at topHeight
  const leftSideRatio = (topHeight - baseY) / triangleHeight;
  const leftIntersectX = baseX + (triangleBase / 2) * leftSideRatio;
  
  // Right intersection: where the right triangle side meets the horizontal line at topHeight  
  const rightIntersectX = baseX + triangleBase - (triangleBase / 2) * leftSideRatio;
  
  // Apply 1/8 pitch truncation from these intersection points
  const topLeft = [leftIntersectX + triangleBase / 8, topHeight];
  const topRight = [rightIntersectX - triangleBase / 8, topHeight];
  
  // Connect the points correctly: left to left, right to right
  const threadPoints = [
    bottomLeft,   // Start at bottom left
    topRight,     // Go to top right
    topLeft,      // Go to top left (parallel to triangle's left side)
    bottomRight,  // Go to bottom right (parallel to triangle's right side)
  ];
  
  // Add thread profile as a polyline (closed)
  dxf.drawPolyline(threadPoints, true);
  
  // Add thread designation as title
  const threadType = results.threadAngle === 55 ? 'BRITISH STANDARD' : (results.threadDesignation.includes('M') ? 'METRIC ISO' : 'IMPERIAL UTS');
  dxf.drawText(
    baseX,
    baseY + triangleHeight + 5,
    2,
    0,
    `${threadType} THREAD ${results.threadDesignation} - ${results.threadAngle}° PROFILE`
  );
  
  // Add basic dimensions table
  const tableX = baseX + triangleBase + 10;
  const tableY = baseY + triangleHeight;
  const lineSpacing = 3;
  let currentY = tableY;
  
  // Determine if this is imperial thread (based on thread designation)
  const isImperial = !results.threadDesignation.includes('M');
  
  const dimensions = [
    `${results.threadDesignation}`,
    `${results.nominalDiameter ? `Ø${results.nominalDiameter}` : ''} ${results.pitch ? `x ${results.pitch}` : `${results.tpi} TPI`}`,
    `Angle: ${results.threadAngle}°`,
    `H: ${formatValue(H, isImperial)}`,
    `h: ${formatValue(h, isImperial)}`,
    `h/8: ${formatValue(h3, isImperial)}`,
  ];
  
  dimensions.forEach((dim, index) => {
    dxf.drawText(
      tableX,
      currentY - (index * lineSpacing),
      1.5,
      0,
      dim
    );
  });
  
  // Generate the DXF content
  const dxfContent = dxf.toDxfString();
  
  // Create and return blob
  return new Blob([dxfContent], { type: 'application/dxf' });
};

/**
 * Download the generated DXF file
 * @param {Object} results - The calculated thread results
 * @param {number} threadAngle - Thread angle (60° for ISO/UTS, 55° for British)
 * @param {string} filename - Optional filename (defaults to thread designation)
 */
export const downloadThreadDXF = (results, filename) => {
  const blob = generateThreadDXF(results);
  const angleSuffix = results.threadAngle === 55 ? '_55deg' : '_60deg';
  const defaultFilename = `thread_${results.threadDesignation.replace(/[x"]/g, '_')}${angleSuffix}.dxf`;
  const finalFilename = filename || defaultFilename;
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
