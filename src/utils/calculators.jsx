const calculateThreadDimensions = (nominalDiameter, pitch = NaN, tpi = NaN, angle = 60) => {
    let convertRate = 1; // Default no conversion
    let designation = '';
    if (!isNaN(pitch)) {
        designation = `M${nominalDiameter}x${pitch}`;
    } else if (!isNaN(tpi)) {
        designation = `${nominalDiameter}"-${tpi} UNC`;
        convertRate = 25.4; // Convert inches to mm
        // Convert TPI to pitch in mm
        pitch = convertRate / tpi;
    } else {
        throw new Error('Either pitch or TPI must be provided for metric threads.');
    }
    // Fundamental triangle calculations
    // General formula that works for any thread angle (60° ISO, 55° BSW, etc.)
    const angleRad = (angle * Math.PI) / 180;
    const H = pitch / (2 * Math.tan(angleRad / 2)); // General formula for any angle

    // Thread heights
    const h3 = H / 8; // 1/8 of basic triangle height
    const h = (5 * H) / 8; // 5/8 of basic triangle height (0.61343 * pitch)

    // External thread (bolt) dimensions with 6g tolerance
    const d = nominalDiameter; // Major diameter
    const d2 = d - (3 * H) / 4; // Pitch diameter: d - 0.64952 * pitch
    const d1_basic = d - (5 * H) / 4; // Basic minor diameter: d - 1.08253 * pitch
    
    // Apply 6g tolerance to external thread (small allowance for tight fit)
    // ISO 965 tolerance calculation for 6g class external threads
    // Tolerance proportional to pitch and adjusted for thread angle
    const angleRatio = Math.sin(angleRad / 2) / Math.sin(Math.PI / 6); // Normalize to 60° reference
    const d1_tolerance = Math.max(0.1, pitch * 0.144 * angleRatio); // Angle-adjusted tolerance
    const d1 = d1_basic - d1_tolerance; // External minor diameter with tolerance
    const d3 = d1 - (H / 4); // Core diameter: d1 - 0.21651 * pitch

    // Internal thread (nut) dimensions with 6H tolerance
    // Based on ISO 965 tolerance standards for H/g fits
    const D = nominalDiameter; // Major diameter (outer material of nut)
    const D2 = nominalDiameter - (3 * H) / 4; // Pitch diameter (same as external for engagement)
    // D1 for internal threads uses the basic minor diameter (6H has no allowance)
    const D1 = d1_basic; // Internal minor diameter = basic minor diameter for 6H class

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
        externalEffectiveDiameter: d1 + 2 * h, // Actual effective outside diameter with tolerances

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
