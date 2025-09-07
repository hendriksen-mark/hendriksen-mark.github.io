const formatNumber = (num, precision = 4) => {
    return typeof num === 'number' ? num.toFixed(precision) : num;
};

const inchesToMm = (inches) => inches * 25.4;
const mmToInches = (mm) => mm / 25.4;

const formatInches = (num, precision = 3) => {
    return typeof num === 'number' ? num.toFixed(precision) + '"' : num;
};

const formatMM = (num, precision = 4) => {
    return typeof num === 'number' ? num.toFixed(precision) + ' mm' : num;
};

const formatWithConverter = (num, showMm = false, precision = 3) => {
    if (typeof num !== 'number') return num;
    if (showMm) {
        return formatMM(inchesToMm(num), 4); // Use 4 decimals for metric conversion
    }
    return formatInches(num, precision);
};

// Basic formatValue for ThreadDiagram (imperial vs metric)
const formatValue = (value, isImperial, precision) => {
    if (isImperial) {
        return formatInches(value, precision || 3);
    }
    return formatMM(value, precision || 4);
};

// Advanced formatValue for ThreadCalculator (supports conversion toggle)
const formatValueWithConversion = (value, unitSystem, showMetricConversion = false, precision) => {
    if (typeof value !== 'number') return value;
    
    if (unitSystem === 'imperial') {
        return formatWithConverter(value, showMetricConversion, precision || 3);
    } else {
        return formatMM(value, precision || 4);
    }
};

export { 
    formatNumber, 
    inchesToMm, 
    mmToInches, 
    formatInches, 
    formatMM, 
    formatWithConverter, 
    formatValue,
    formatValueWithConversion
};