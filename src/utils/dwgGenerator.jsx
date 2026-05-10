import DxfWriterPackage from "@markhhh/dxf-writer";
import { formatValue } from './converters';

const { BrowserFriendlyDrawing, StringWritableStream } = DxfWriterPackage;

const DEG_90 = Math.PI / 2;

const rotateY90 = ([x, y, z]) => {
  const cos = Math.cos(DEG_90);
  const sin = Math.sin(DEG_90);
  return [x * cos + z * sin, y, -x * sin + z * cos];
};

const rotateZ90 = ([x, y, z]) => {
  const cos = Math.cos(-DEG_90);
  const sin = Math.sin(-DEG_90);
  return [x * cos - y * sin, x * sin + y * cos, z];
};

const rotateProfilePoint = (point2d) => {
  const point3d = [point2d[0], point2d[1], 0];
  return rotateZ90(rotateY90(point3d));
};

const translatePoints = (points, offset) => {
  return points.map(([x, y, z]) => [x + offset[0], y + offset[1], z + offset[2]]);
};

const alignProfileStartToPoint = (profilePoints, startPoint) => {
  const first = profilePoints[0];
  const delta = [
    startPoint[0] - first[0],
    startPoint[1] - first[1],
    startPoint[2] - first[2]
  ];
  return translatePoints(profilePoints, delta);
};

/**
 * Generate a DXF file containing the thread profile and dimensions
 * @param {Object} results - The calculated thread results
 * @param {number} threadAngle - Thread angle (60° for ISO/UTS, 55° for British)
 * @returns {Blob} - DXF file as a blob
 */
export const generateThreadDXF = async (results) => {
  // Fallback for packages that expect process.nextTick in browser environments.
  if (!globalThis.process) {
    globalThis.process = {
      nextTick: (callback) => queueMicrotask(callback)
    };
  } else if (!globalThis.process.nextTick) {
    globalThis.process.nextTick = (callback) => queueMicrotask(callback);
  }

  const stream = new StringWritableStream();
  const dxf = new BrowserFriendlyDrawing(stream);

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
  // await dxf.drawPolyline(trianglePoints, true);

  // Draw the actual thread profile (truncated triangle)
  // Correct ISO metric thread standard:
  // - Bottom of thread: H/4 from base
  // - Thread height: 5H/8
  // - Top of thread: H/8 below triangle peak
  // - The thread profile must follow the triangle's sloped sides

  // Bottom points at H/4 height from base
  const bottomHeight = baseY + H / 4;
  const bottomLeft = [baseX + triangleBase / 8, bottomHeight];
  const bottomRight = [baseX + triangleBase * 7 / 8, bottomHeight];

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
  await dxf.drawPolyline(threadPoints, true);

  // ---------------------------------------------------------------------------
  // 3D helpers for manufacturing reference (bolt + nut)
  // Requested orientation: profile rotated 90 degrees on Y then 90 degrees on Z.
  // Profile start point is aligned to each helix start point.
  // ---------------------------------------------------------------------------

  // Ensure dedicated layers exist for easier CAD visibility toggles.
  dxf.addLayer('BOLT_3D', BrowserFriendlyDrawing.ACI.CYAN, 'CONTINUOUS');
  dxf.addLayer('NUT_3D', BrowserFriendlyDrawing.ACI.YELLOW, 'CONTINUOUS');

  const turns = 6;

  // --------------------
  // Bolt geometry
  // --------------------
  const boltD1 = results.externalMinorDiameter; // Requested: bolt helix/circle diameter = d1
  const boltRadius = boltD1 / 2;
  const boltAxisBase = [0, 0, 0];
  const boltAxisVector = [0, 0, 1];
  const boltHelixStart = [boltRadius, 0, 0];

  dxf.setActiveLayer('BOLT_3D');
  await dxf.drawHelixLean(
    boltAxisBase,
    boltHelixStart,
    boltAxisVector,
    turns,
    pitch,
    1,
    0,
    29,
    63
  );
  await dxf.drawCircle(boltAxisBase[0], boltAxisBase[1], boltRadius);

  const rotatedBoltProfile = threadPoints.map(rotateProfilePoint);
  const boltProfileAtHelixStart = alignProfileStartToPoint(rotatedBoltProfile, boltHelixStart);
  await dxf.drawPolyline3d([...boltProfileAtHelixStart, boltProfileAtHelixStart[0]]);

  // --------------------
  // Nut geometry
  // --------------------
  // For nut reference, use internal minor diameter as matching inner thread reference.
  const nutD1 = results.internalMinorDiameter;
  const nutRadius = nutD1 / 2;
  const nutOffsetX = results.externalMajorDiameter * 3;
  const nutAxisBase = [nutOffsetX, 0, 0];
  const nutAxisVector = [0, 0, 1];
  const nutHelixStart = [nutOffsetX + nutRadius, 0, 0];

  dxf.setActiveLayer('NUT_3D');
  await dxf.drawHelixLean(
    nutAxisBase,
    nutHelixStart,
    nutAxisVector,
    turns,
    pitch,
    1,
    0,
    29,
    63
  );
  await dxf.drawCircle(nutAxisBase[0], nutAxisBase[1], nutRadius);

  const rotatedNutProfile = threadPoints.map(rotateProfilePoint);
  const nutProfileAtHelixStart = alignProfileStartToPoint(rotatedNutProfile, nutHelixStart);
  await dxf.drawPolyline3d([...nutProfileAtHelixStart, nutProfileAtHelixStart[0]]);

  // Reset to default annotation layer before writing text/table.
  dxf.setActiveLayer('0');

  // Add thread designation as title
  const threadType = results.threadAngle === 55 ? 'BRITISH STANDARD' : (results.threadDesignation.includes('M') ? 'METRIC ISO' : 'IMPERIAL UTS');
  await dxf.drawText(
    baseX,
    baseY + triangleHeight + 5,
    2,
    0,
    `${threadType} THREAD ${results.threadDesignation} - ${results.threadAngle}° PROFILE + 3D BOLT/NUT HELPERS`
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

  for (let index = 0; index < dimensions.length; index += 1) {
    const dim = dimensions[index];
    await dxf.drawText(
      tableX,
      currentY - (index * lineSpacing),
      1.5,
      0,
      dim
    );
  }

  // Generate the DXF content
  await dxf.end();
  stream.end();
  const dxfContent = stream.toString();

  // Create and return blob
  return new Blob([dxfContent], { type: 'application/dxf' });
};

/**
 * Download the generated DXF file
 * @param {Object} results - The calculated thread results
 * @param {number} threadAngle - Thread angle (60° for ISO/UTS, 55° for British)
 * @param {string} filename - Optional filename (defaults to thread designation)
 */
export const downloadThreadDXF = async (results, filename) => {
  const blob = await generateThreadDXF(results);
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
