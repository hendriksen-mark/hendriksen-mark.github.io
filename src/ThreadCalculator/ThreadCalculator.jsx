import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector/LanguageSelector';
import AnimatedButton from '../components/AnimatedButton/AnimatedButton';
import ThreadDiagram from '../components/ThreadDiagram/ThreadDiagram';
import StyledSelect from '../components/StyledSelect/StyledSelect';
import translations from '../Translation/Translations';
import { downloadThreadDXF } from '../utils/dwgGenerator';
import './ThreadCalculator.scss';
import { formatMM, formatValueWithConversion } from '../utils/converters';
import calculateThreadDimensions from '../utils/calculators';
import { FaCog, FaHome } from 'react-icons/fa';
import { TbAngle } from "react-icons/tb";

function ThreadCalculator({ onBackToHome }) {
  const { language } = useLanguage();
  const [unitSystem, setUnitSystem] = useState('metric'); // 'metric' or 'imperial'
  const [threadAngle, setThreadAngle] = useState(60); // 60° or 55°
  
  // Metric inputs
  const [nominalDiameter, setNominalDiameter] = useState(10);
  const [pitch, setPitch] = useState(1.5);
  
  // Imperial inputs
  const [imperialDiameter, setImperialDiameter] = useState(0.25);
  const [tpi, setTpi] = useState(20);
  
  const [results, setResults] = useState(null);
  const [showMetricConversion, setShowMetricConversion] = useState(true);

  const handleCalculate = () => {
    let calculated;
    if (unitSystem === 'metric') {
      calculated = calculateThreadDimensions(nominalDiameter, pitch, NaN, threadAngle);
    } else {
      calculated = calculateThreadDimensions(imperialDiameter, NaN, tpi, threadAngle);
    }
    setResults(calculated);
  };

  const handleDownloadDXF = () => {
    if (results) {
      downloadThreadDXF(results);
    }
  };

  return (
    <div className="thread-calculator">
      <div className="thread-calculator__container">
        <div className="thread-calculator__header">
          <div className="thread-calculator__header-content">
            <div className="thread-calculator__back-button">
              <AnimatedButton 
                color="gray"
                onClick={onBackToHome}
              >
                <FaHome />
                {" " + translations[language].backToHome}
              </AnimatedButton>
            </div>
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
            <div className="select-group">
              <StyledSelect
                label={translations[language].unitSystem || 'Unit System'}
                value={{ value: unitSystem, label: unitSystem === 'metric' ? 'Metric (mm)' : 'Imperial (inches)' }}
                onChange={(selectedOption) => { setUnitSystem(selectedOption.value); setResults(null); }}
                icon={FaCog}
                variant="thread-calculator"
                options={[
                  { value: 'metric', label: 'Metric (mm)' },
                  { value: 'imperial', label: 'Imperial (inches)' }
                ]}
              />
            </div>
            <div className="select-group">
              <StyledSelect
                label={translations[language].threadAngle}
                value={{ value: threadAngle, label: threadAngle === 60 ? '60° (ISO/UTS Standard)' : '55° (British Standard)' }}
                onChange={(selectedOption) => { setThreadAngle(parseInt(selectedOption.value)); setResults(null); }}
                icon={TbAngle}
                variant="thread-calculator"
                options={[
                  { value: 60, label: '60° (ISO/UTS Standard)' },
                  { value: 55, label: '55° (British Standard)' }
                ]}
              />
            </div>

            {unitSystem === 'metric' ? (
              <>
                <div className="input-group">
                  <label>
                    {translations[language].nominalDiameter} (mm)
                  </label>
                  <input
                    type="number"
                    value={nominalDiameter}
                    onChange={(e) => { setNominalDiameter(parseFloat(e.target.value)); setResults(null); }}
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
                    onChange={(e) => { setPitch(parseFloat(e.target.value)); setResults(null); }}
                    step="0.1"
                    min="0.1"
                    max="10"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="input-group">
                  <label>
                    {translations[language].nominalDiameter} (inches)
                  </label>
                  <input
                    type="number"
                    value={imperialDiameter}
                    onChange={(e) => { setImperialDiameter(parseFloat(e.target.value)); setResults(null); }}
                    step="0.0625"
                    min="0.0625"
                    max="4"
                  />
                </div>
                <div className="input-group">
                  <label>
                    {translations[language].threadsPerInch} (TPI)
                  </label>
                  <input
                    type="number"
                    value={tpi}
                    onChange={(e) => { setTpi(parseFloat(e.target.value)); setResults(null); }}
                    step="1"
                    min="1"
                    max="80"
                  />
                </div>
              </>
            )}
          </div>

          <div className="thread-calculator-actions">
            <div className="button-group">
              <AnimatedButton onClick={handleCalculate} color="green">
                {translations[language].calculate}
              </AnimatedButton>
              {unitSystem === 'imperial' && (
                <AnimatedButton 
                  onClick={() => setShowMetricConversion(!showMetricConversion)}
                  color="orange"
                  title="Toggle inch/mm conversion"
                >
                  {showMetricConversion ? translations[language].showInch : translations[language].showMm}
                </AnimatedButton>
              )}
              {results && (
                <AnimatedButton onClick={handleDownloadDXF} color="purple">
                  📐 {translations[language].downloadDxf}
                </AnimatedButton>
              )}
            </div>
          </div>
        </div>

        {results && (
          <div className="thread-calculator__results">
            <ThreadDiagram 
              results={results} 
              isImperial={unitSystem === 'imperial' && !showMetricConversion}
              originalUnitSystem={unitSystem}
            />
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
                      <span className="value">{formatValueWithConversion(results.basicTriangleHeight, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].threadHeight} (5H/8)(h):</span>
                      <span className="value">{formatValueWithConversion(results.threadHeight, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">H/4:</span>
                      <span className="value">{formatValueWithConversion(results.basicTriangleHeight / 4, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">H/8:</span>
                      <span className="value">{formatValueWithConversion(results.threadHeight3, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">3H/8:</span>
                      <span className="value">{formatValueWithConversion(3 * results.basicTriangleHeight / 8, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].threadEngagement}:</span>
                      <span className="value">{formatValueWithConversion(results.threadEngagement, unitSystem, showMetricConversion)}</span>
                    </div>
                    {unitSystem === 'metric' && (
                      <div className="result-item">
                        <span className="label">{translations[language].pitch}:</span>
                        <span className="value">{formatValueWithConversion(results.pitch, unitSystem, showMetricConversion)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="result-card">
                  <h3>{translations[language].externalThread} ({translations[language].bolt})</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{translations[language].majorDiameter} (d):</span>
                      <span className="value">{formatValueWithConversion(results.externalMajorDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].effectiveDiameter} (d₁+2h):</span>
                      <span className="value">{formatValueWithConversion(results.externalEffectiveDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].pitchDiameter} (d₂):</span>
                      <span className="value">{formatValueWithConversion(results.externalPitchDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].minorDiameter} (d₁):</span>
                      <span className="value">{formatValueWithConversion(results.externalMinorDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].coreDiameter} (d₃):</span>
                      <span className="value">{formatValueWithConversion(results.externalCoreDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{translations[language].internalThread} ({translations[language].nut})</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{translations[language].majorDiameter} (D):</span>
                      <span className="value">{formatValueWithConversion(results.internalMajorDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].pitchDiameter} (D₂):</span>
                      <span className="value">{formatValueWithConversion(results.internalPitchDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].minorDiameter} (D₁):</span>
                      <span className="value">{formatValueWithConversion(results.internalMinorDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{translations[language].boltHead}</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{translations[language].headDiameter}:</span>
                      <span className="value">{formatMM(results.boltHeadDiameter)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].headHeight}:</span>
                      <span className="value">{formatMM(results.boltHeadHeight)}</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{translations[language].nutDimensions}</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{translations[language].widthAcrossFlats}:</span>
                      <span className="value">{formatMM(results.nutWidthAcrossFlats)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].widthAcrossCorners}:</span>
                      <span className="value">{formatMM(results.nutWidthAcrossCorners)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].nutHeight}:</span>
                      <span className="value">{formatMM(results.nutHeight)}</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{translations[language].washerDimensions}</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{translations[language].innerDiameter}:</span>
                      <span className="value">{formatMM(results.washerInnerDiameter)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].outerDiameter}:</span>
                      <span className="value">{formatMM(results.washerOuterDiameter)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{translations[language].thickness}:</span>
                      <span className="value">{formatMM(results.washerThickness)}</span>
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
