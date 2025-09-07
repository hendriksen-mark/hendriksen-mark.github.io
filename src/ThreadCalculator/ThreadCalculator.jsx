import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector/LanguageSelector';
import ThreadDiagram from '../components/ThreadDiagram/ThreadDiagram';
import translations from '../Translation/Translations';
import { downloadThreadDXF } from '../utils/dwgGenerator';
import './ThreadCalculator.scss';

function ThreadCalculator() {
  const { language } = useLanguage();
  const [nominalDiameter, setNominalDiameter] = useState(10);
  const [pitch, setPitch] = useState(1.5);
  const [results, setResults] = useState(null);

  // Metric thread calculation function (converted from Python)
  const calculateMetricThreadDimensions = (nominalDiameter, pitch) => {
    // Fundamental triangle calculations
    const H = (Math.sqrt(3) / 2) * pitch; // 0.866025 * pitch
    
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
    const nutWidthAcrossFlats = 1.5 * d; // Width across flats (standard)
    const nutWidthAcrossCorners = nutWidthAcrossFlats / Math.cos(Math.PI / 6); // 30 degrees
    const nutHeight = 0.8 * d; // Standard nut height
    
    // Washer dimensions
    const washerInnerDiameter = d + 0.3; // Slight clearance
    const washerOuterDiameter = 2.2 * d; // Standard washer outer diameter
    const washerThickness = 0.15 * d; // Standard washer thickness
    
    // Thread tolerance calculations (6H/6g standard)
    // External thread (bolt) tolerances
    const d_max = d;
    const d_min = d;
    const d2_max = d2 - 0.038; // Approximate for 6g
    const d2_min = d2 - 0.038 - 0.125;
    const d1_max = d1;
    const d1_min = d1 - 0.25;
    
    // Internal thread (nut) tolerances  
    const D_min = D;
    const D_max = D + 0.5;
    const D2_min = D2;
    const D2_max = D2 + 0.125;
    const D1_min = D1;
    const D1_max = D1 + 0.25;

    return {
      // Basic thread parameters
      nominalDiameter,
      pitch,
      threadDesignation: `M${nominalDiameter}x${pitch}`,
      
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
      
      // Tolerances (6H/6g standard)
      externalTolerances: {
        d_max, d_min,
        d2_max, d2_min,
        d1_max, d1_min
      },
      internalTolerances: {
        D_min, D_max,
        D2_min, D2_max,
        D1_min, D1_max
      }
    };
  };

  const handleCalculate = () => {
    const calculated = calculateMetricThreadDimensions(nominalDiameter, pitch);
    setResults(calculated);
  };

  const handleDownloadDXF = () => {
    if (results) {
      downloadThreadDXF(results);
    }
  };

  const formatNumber = (num, precision = 4) => {
    return typeof num === 'number' ? num.toFixed(precision) : num;
  };

  return (
    <div className="thread-calculator">
      <div className="thread-calculator__container">
        <div className="thread-calculator__header">
          <div className="thread-calculator__header-content">
            <div className="thread-calculator__title-section">
              <h1>{translations[language].threadCalculatorTitle}</h1>
              <p>{translations[language].threadCalculatorDescription}</p>
            </div>
            
            <div className="thread-calculator__language-selector">
              <LanguageSelector variant="thread-calculator" />
            </div>
          </div>
        </div>

        <div className="thread-calculator__section">
          <h2 className="thread-calculator__section-title">{translations[language].inputParameters}</h2>
          <div className="thread-calculator__inputs">
            <div className="input-group">
              <label>
                {translations[language].nominalDiameter} (mm)
              </label>
              <input
                type="number"
                value={nominalDiameter}
                onChange={(e) => setNominalDiameter(parseFloat(e.target.value) || 0)}
                step="0.1"
                min="1"
                max="100"
              />
            </div>
            <div className="input-group">
              <label>
                {translations[language].threadPitch} (mm)
              </label>
              <input
                type="number"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0.1"
                max="10"
              />
            </div>
            <div className="button-group">
              <button onClick={handleCalculate} className="calculate-btn">
                {translations[language].calculate}
              </button>
              {results && (
                <button 
                  onClick={handleDownloadDXF} 
                  className="download-dxf-btn"
                  title={translations[language].downloadDxfTooltip}
                >
                  📐 {translations[language].downloadDxf}
                </button>
              )}
            </div>
          </div>
        </div>

        {results && (
          <div className="thread-calculator__results">
            <ThreadDiagram results={results} />
            <div className="thread-calculator__section">
              <h2 className="thread-calculator__section-title">
                {translations[language].results}: {results.threadDesignation}
              </h2>

              <div className="results-grid">
                <div className="result-card">
                  <h3>{translations[language].fundamentalTriangle}</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{translations[language].basicTriangleHeight} (H):</span>
                      <span className="value">{formatNumber(results.basicTriangleHeight)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].threadHeight} (5H/8):</span>
                      <span className="value">{formatNumber(results.threadHeight)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">H/4:</span>
                      <span className="value">{formatNumber(results.basicTriangleHeight / 4, 10)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">H/8:</span>
                      <span className="value">{formatNumber(results.threadHeight3, 10)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">3H/8:</span>
                      <span className="value">{formatNumber(3 * results.basicTriangleHeight / 8)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].threadEngagement}:</span>
                      <span className="value">{formatNumber(results.threadEngagement)} mm</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{translations[language].externalThread} ({translations[language].bolt})</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{translations[language].majorDiameter} (d):</span>
                      <span className="value">{formatNumber(results.externalMajorDiameter)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].pitchDiameter} (d₂):</span>
                      <span className="value">{formatNumber(results.externalPitchDiameter)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].minorDiameter} (d₁):</span>
                      <span className="value">{formatNumber(results.externalMinorDiameter)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].coreDiameter} (d₃):</span>
                      <span className="value">{formatNumber(results.externalCoreDiameter)} mm</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{translations[language].internalThread} ({translations[language].nut})</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{translations[language].majorDiameter} (D):</span>
                      <span className="value">{formatNumber(results.internalMajorDiameter)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].pitchDiameter} (D₂):</span>
                      <span className="value">{formatNumber(results.internalPitchDiameter)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].minorDiameter} (D₁):</span>
                      <span className="value">{formatNumber(results.internalMinorDiameter)} mm</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{translations[language].boltHead}</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{translations[language].headDiameter}:</span>
                      <span className="value">{formatNumber(results.boltHeadDiameter)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].headHeight}:</span>
                      <span className="value">{formatNumber(results.boltHeadHeight)} mm</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{translations[language].nutDimensions}</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{translations[language].widthAcrossFlats}:</span>
                      <span className="value">{formatNumber(results.nutWidthAcrossFlats)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].widthAcrossCorners}:</span>
                      <span className="value">{formatNumber(results.nutWidthAcrossCorners)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].nutHeight}:</span>
                      <span className="value">{formatNumber(results.nutHeight)} mm</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{translations[language].washerDimensions}</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{translations[language].innerDiameter}:</span>
                      <span className="value">{formatNumber(results.washerInnerDiameter)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].outerDiameter}:</span>
                      <span className="value">{formatNumber(results.washerOuterDiameter)} mm</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].thickness}:</span>
                      <span className="value">{formatNumber(results.washerThickness)} mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThreadCalculator;
