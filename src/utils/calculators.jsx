const calculateThreadDimensions = (nominalDiameter, pitch = NaN, tpi = NaN, angle = 60) => {
    let convertRate = 1; // Default no conversion
    let designation = '';
    if (!isNaN(pitch)) {
        designation = `M${nominalDiameter}x${pitch}`;
    } else if (!isNaN(tpi)) {
        designation = `${nominalDiameter}"-${tpi} UNC`;
        convertRate = 25.4; // Convert inches to mm
        // Convert TPI to pitch in mm
        pitch = 1 / tpi;
    } else {
        throw new Error('Either pitch or TPI must be provided for metric threads.');
    }
    // Fundamental triangle calculations
    const angleRad = (angle * Math.PI) / 180;
    const H = pitch / (2 * Math.tan(angleRad / 2)); // Height for given angle 60 = 1,29903811

    // Thread heights
    const h3 = H / 8; // 1/8 of basic triangle height
    const h = (5 * H) / 8; // 5/8 of basic triangle height (0.61343 * pitch)

    // Major diameter (nominal diameter)
    const d = nominalDiameter;
    const D = nominalDiameter; // Same for internal thread (nut)

    // Pitch diameter
    const d2 = d - (3 * H) / 4; // d - 0.64952 * pitch
    const D2 = D - (3 * H) / 4; // Same calculation for nut

    // Minor diameter
    const d1 = d - (5 * H) / 4; // d - 1.08253 * pitch
    const D1 = D - H; // D - 0.86603 * pitch (for nut)

    // Core diameter (actual minor diameter for bolt)
    const d3 = d1 - (H / 4); // d1 - 0.21651 * pitch

    // Thread engagement calculations
    const threadEngagement = 0.75 * H; // Minimum thread engagement

    // Bolt head dimensions (hex head)
    const headDiameter = 1.5 * d; // Approximate head diameter
    const headHeight = 0.7 * d; // Approximate head height

    // Nut dimensions
    const nutWidthAcrossFlats = 1.5 * d * convertRate; // Width across flats (standard)
    const nutWidthAcrossCorners = nutWidthAcrossFlats / Math.cos(Math.PI / 6); // 30 degrees
    const nutHeight = 0.8 * d * convertRate; // Standard nut height

    // Washer dimensions
    const washerInnerDiameter = (d + 0.3) * convertRate; // Slight clearance
    const washerOuterDiameter = 2.2 * d * convertRate; // Standard washer outer diameter
    const washerThickness = 0.15 * d * convertRate; // Standard washer thickness

    return {
        // Basic thread parameters
        nominalDiameter,
        pitch,
        threadDesignation: designation,
        threadAngle: angle,

        // Fundamental triangle
        basicTriangleHeight: H,
        threadHeight: h,
        threadHeight3: h3,
        threadEngagement,

        // External thread (bolt) dimensions
        externalMajorDiameter: d,
        externalPitchDiameter: d2,
        externalMinorDiameter: d1,
        externalCoreDiameter: d3,

        // Internal thread (nut) dimensions
        internalMajorDiameter: D,
        internalPitchDiameter: D2,
        internalMinorDiameter: D1,

        // Bolt head dimensions
        boltHeadDiameter: headDiameter,
        boltHeadHeight: headHeight,

        // Nut dimensions
        nutWidthAcrossFlats,
        nutWidthAcrossCorners,
        nutHeight,

        // Washer dimensions
        washerInnerDiameter,
        washerOuterDiameter,
        washerThickness,
    };
};

export default calculateThreadDimensions;
