import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import AnimatedButton from '../components/AnimatedButton/AnimatedButton';
import PageHeader from '../components/PageHeader/PageHeader';
import PageContainer from '../components/PageContainer/PageContainer';
import PageSection from '../components/PageSection/PageSection';
import ThreadDiagram from '../components/ThreadDiagram/ThreadDiagram';
import StyledSelect from '../components/StyledSelect/StyledSelect';
import StyledInput from '../components/StyledInput/StyledInput';
import translations from '../Translation/Translations';
import { downloadThreadDXF } from '../utils/dwgGenerator';
import './ThreadCalculator.scss';
import { formatMM, formatValueWithConversion } from '../utils/converters';
import calculateThreadDimensions from '../utils/calculators';
import { FaCog } from 'react-icons/fa';
import { TbAngle } from "react-icons/tb";
import { GiHexagonalNut } from 'react-icons/gi';

function ThreadCalculator({ onBackToHome }) {
  const { language } = useLanguage();
    const t = translations[language] || translations.en;
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

  const handleDownloadDXF = async () => {
    if (results) {
      await downloadThreadDXF(results);
    }
  };

  return (
    <PageContainer className="thread-calculator">
        <PageHeader
          onBackToHome={onBackToHome}
          title={<><GiHexagonalNut /> {t.threadCalculatorTitle}</>}
          description={t.threadCalculatorDescription}
          languageSelectorVariant="calculator"
        />

        <PageSection title={t.inputParameters} variant="calculator">
          <div className="thread-calculator__inputs">
            <div className="select-group">
              <StyledSelect
                label={t.unitSystem || 'Unit System'}
                value={{ value: unitSystem, label: unitSystem === 'metric' ? 'Metric (mm)' : 'Imperial (inches)' }}
                onChange={(selectedOption) => { setUnitSystem(selectedOption.value); setResults(null); }}
                icon={FaCog}
                variant="calculator"
                options={[
                  { value: 'metric', label: 'Metric (mm)' },
                  { value: 'imperial', label: 'Imperial (inches)' }
                ]}
              />
            </div>
            <div className="select-group">
              <StyledSelect
                label={t.threadAngle}
                value={{ value: threadAngle, label: threadAngle === 60 ? '60° (ISO/UTS Standard)' : '55° (British Standard)' }}
                onChange={(selectedOption) => { setThreadAngle(parseInt(selectedOption.value)); setResults(null); }}
                icon={TbAngle}
                variant="calculator"
                options={[
                  { value: 60, label: '60° (ISO/UTS Standard)' },
                  { value: 55, label: '55° (British Standard)' }
                ]}
              />
            </div>

            {unitSystem === 'metric' ? (
              <>
                <StyledInput
                  label={`${t.nominalDiameter} (mm)`}
                  type="number"
                  value={nominalDiameter}
                  onChange={(e) => { setNominalDiameter(parseFloat(e.target.value)); setResults(null); }}
                  step="0.1"
                  min="1"
                  max="100"
                  variant="calculator"
                />
                <StyledInput
                  label={`${t.threadPitch} (mm)`}
                  type="number"
                  value={pitch}
                  onChange={(e) => { setPitch(parseFloat(e.target.value)); setResults(null); }}
                  step="0.1"
                  min="0.1"
                  max="10"
                  variant="calculator"
                />
              </>
            ) : (
              <>
                <StyledInput
                  label={`${t.nominalDiameter} (inches)`}
                  type="number"
                  value={imperialDiameter}
                  onChange={(e) => { setImperialDiameter(parseFloat(e.target.value)); setResults(null); }}
                  step="0.0625"
                  min="0.0625"
                  max="4"
                  variant="calculator"
                />
                <StyledInput
                  label={`${t.threadsPerInch} (TPI)`}
                  type="number"
                  value={tpi}
                  onChange={(e) => { setTpi(parseFloat(e.target.value)); setResults(null); }}
                  step="1"
                  min="1"
                  max="80"
                  variant="calculator"
                />
              </>
            )}
          </div>

          <div className="thread-calculator-actions">
            <div className="button-group">
              <AnimatedButton onClick={handleCalculate} color="green">
                {t.calculate}
              </AnimatedButton>
              {unitSystem === 'imperial' && (
                <AnimatedButton
                  onClick={() => setShowMetricConversion(!showMetricConversion)}
                  color="orange"
                  title={t.toggleInchMmConversion}
                >
                  {showMetricConversion ? t.showInch : t.showMm}
                </AnimatedButton>
              )}
              {results && (
                <AnimatedButton onClick={handleDownloadDXF} color="purple">
                  📐 {t.downloadDxf}
                </AnimatedButton>
              )}
            </div>
          </div>
        </PageSection>

        {results && (
          <div className="thread-calculator__results">
            <ThreadDiagram
              results={results}
              isImperial={unitSystem === 'imperial' && !showMetricConversion}
              originalUnitSystem={unitSystem}
            />
            <PageSection
              title={`${t.results}: ${results.threadDesignation}`}
              variant="calculator"
            >
              <div className="results-grid">
                <div className="result-card">
                  <h3>{t.fundamentalTriangle}</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{t.basicTriangleHeight} (H):</span>
                      <span className="value">{formatValueWithConversion(results.basicTriangleHeight, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.threadHeight} (5H/8)(h):</span>
                      <span className="value">{formatValueWithConversion(results.threadHeight, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.halfHeight} (H/4):</span>
                      <span className="value">{formatValueWithConversion(results.basicTriangleHeight / 4, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.eighthHeight} (H/8):</span>
                      <span className="value">{formatValueWithConversion(results.threadHeight3, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.threeEighthsHeight} (3H/8):</span>
                      <span className="value">{formatValueWithConversion(3 * results.basicTriangleHeight / 8, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.threadEngagement}:</span>
                      <span className="value">{formatValueWithConversion(results.threadEngagement, unitSystem, showMetricConversion)}</span>
                    </div>
                    {unitSystem === 'metric' && (
                      <div className="result-item">
                        <span className="label">{t.pitch}:</span>
                        <span className="value">{formatValueWithConversion(results.pitch, unitSystem, showMetricConversion)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="result-card">
                  <h3>{t.externalThread} ({t.bolt})</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{t.majorDiameter} (d):</span>
                      <span className="value">{formatValueWithConversion(results.externalMajorDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.effectiveDiameter} (d₁+2h):</span>
                      <span className="value">{formatValueWithConversion(results.externalEffectiveDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.pitchDiameter} (d₂):</span>
                      <span className="value">{formatValueWithConversion(results.externalPitchDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.minorDiameter} (d₁):</span>
                      <span className="value">{formatValueWithConversion(results.externalMinorDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.coreDiameter} (d₃):</span>
                      <span className="value">{formatValueWithConversion(results.externalCoreDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{t.internalThread} ({t.nut})</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{t.majorDiameter} (D):</span>
                      <span className="value">{formatValueWithConversion(results.internalMajorDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.pitchDiameter} (D₂):</span>
                      <span className="value">{formatValueWithConversion(results.internalPitchDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.minorDiameter} (D₁):</span>
                      <span className="value">{formatValueWithConversion(results.internalMinorDiameter, unitSystem, showMetricConversion)}</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{t.boltHead}</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{t.headDiameter}:</span>
                      <span className="value">{formatMM(results.boltHeadDiameter)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.headHeight}:</span>
                      <span className="value">{formatMM(results.boltHeadHeight)}</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{t.nutDimensions}</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{t.widthAcrossFlats}:</span>
                      <span className="value">{formatMM(results.nutWidthAcrossFlats)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.widthAcrossCorners}:</span>
                      <span className="value">{formatMM(results.nutWidthAcrossCorners)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.nutHeight}:</span>
                      <span className="value">{formatMM(results.nutHeight)}</span>
                    </div>
                  </div>
                </div>

                <div className="result-card">
                  <h3>{t.washerDimensions}</h3>
                  <div className="result-items">
                    <div className="result-item">
                      <span className="label">{t.innerDiameter}:</span>
                      <span className="value">{formatMM(results.washerInnerDiameter)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.outerDiameter}:</span>
                      <span className="value">{formatMM(results.washerOuterDiameter)}</span>
                    </div>
                    <div className="result-item">
                      <span className="label">{t.thickness}:</span>
                      <span className="value">{formatMM(results.washerThickness)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </PageSection>
          </div>
        )}
    </PageContainer>
  );
}

export default ThreadCalculator;
