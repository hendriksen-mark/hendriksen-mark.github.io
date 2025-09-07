import DxfWriter from 'dxf-writer';

/**
 * Generate a DXF file containing the thread profile and dimensions
 * @param {Object} results - The calculated thread results
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
  dxf.drawText(
    baseX,
    baseY + triangleHeight + 5,
    2,
    0,
    `METRIC THREAD ${results.threadDesignation} - ISO PROFILE`
  );
  
  // Add basic dimensions table
  const tableX = baseX + triangleBase + 10;
  const tableY = baseY + triangleHeight;
  const lineSpacing = 3;
  let currentY = tableY;
  
  const dimensions = [
    `${results.threadDesignation}`,
    `Ø${results.nominalDiameter} x ${results.pitch}`,
    `H: ${H.toFixed(4)}mm`,
    `h: ${h.toFixed(4)}mm`,
    `h/8: ${h3.toFixed(4)}mm`,
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
 * @param {string} filename - Optional filename (defaults to thread designation)
 */
export const downloadThreadDXF = (results, filename) => {
  const blob = generateThreadDXF(results);
  const defaultFilename = `thread_${results.threadDesignation.replace('x', '_x_')}.dxf`;
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
