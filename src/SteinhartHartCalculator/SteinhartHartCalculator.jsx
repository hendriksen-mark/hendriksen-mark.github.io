import { useState, useMemo } from 'react';
import { FaThermometerHalf, FaCog, FaListAlt } from 'react-icons/fa';
import AnimatedButton from '../components/AnimatedButton/AnimatedButton';
import PageHeader from '../components/PageHeader/PageHeader';
import StyledSelect from '../components/StyledSelect/StyledSelect';
import StyledInput from '../components/StyledInput/StyledInput';
import { useLanguage } from '../contexts/LanguageContext';
import translations from '../Translation/Translations';
import './SteinhartHartCalculator.scss';

// ── Presets ────────────────────────────────────────────────────────────────────
const PRESETS = {
    custom: { labelKey: 'ntcPresetCustom', model: 'beta', r0: 10000, t0: 25, beta: 3950, A: 0, B: 0, C: 0 },
    '10k_b3950': { labelKey: 'ntcPreset10kB3950', model: 'beta', r0: 10000, t0: 25, beta: 3950, A: 0, B: 0, C: 0 },
    '10k_b3435': { labelKey: 'ntcPreset10kB3435', model: 'beta', r0: 10000, t0: 25, beta: 3435, A: 0, B: 0, C: 0 },
    '4k7_b3977': { labelKey: 'ntcPreset4k7B3977', model: 'beta', r0: 4700, t0: 25, beta: 3977, A: 0, B: 0, C: 0 },
    '100k_b4066': { labelKey: 'ntcPreset100kB4066', model: 'beta', r0: 100000, t0: 25, beta: 4066, A: 0, B: 0, C: 0 },
    // Steinhart-Hart 3-coefficient presets (EPCOS NTC B57560G1103, 10k nominal)
    '10k_sh': {
        labelKey: 'ntcPreset10kSH',
        model: 'steinhart-hart',
        r0: 0, t0: 0, beta: 0,
        A: 1.129148e-3, B: 2.34125e-4, C: 8.76741e-8,
    },
};

// ── Math ───────────────────────────────────────────────────────────────────────
function betaRtoT(r0, t0, beta, r) {
    const T0_K = t0 + 273.15;
    const T_K = 1 / (1 / T0_K + (1 / beta) * Math.log(r / r0));
    return T_K - 273.15;
}

function betaTtoR(r0, t0, beta, tempC) {
    const T0_K = t0 + 273.15;
    const T_K = tempC + 273.15;
    return r0 * Math.exp(beta * (1 / T_K - 1 / T0_K));
}

function shRtoT(A, B, C, r) {
    const lnR = Math.log(r);
    const T_K = 1 / (A + B * lnR + C * lnR * lnR * lnR);
    return T_K - 273.15;
}

function shTtoR(A, B, C, tempC) {
    const T_K = tempC + 273.15;
    const target = 1 / T_K;
    // Newton-Raphson on f(x) = A + B*x + C*x^3 - target, x = ln(R)
    let x = Math.log(10000);
    for (let i = 0; i < 200; i++) {
        const f = A + B * x + C * x * x * x - target;
        const df = B + 3 * C * x * x;
        if (Math.abs(df) < 1e-30) break;
        const dx = f / df;
        x -= dx;
        if (Math.abs(dx) < 1e-12) break;
    }
    return Math.exp(x);
}

function celsiusToFahrenheit(c) {
    return c * 9 / 5 + 32;
}

function fahrenheitToCelsius(f) {
    return (f - 32) * 5 / 9;
}

function formatResistance(r) {
    if (r >= 1e6) return `${(r / 1e6).toPrecision(5).replace(/\.?0+$/, '')} MΩ`;
    if (r >= 1e3) return `${(r / 1e3).toPrecision(5).replace(/\.?0+$/, '')} kΩ`;
    return `${r.toPrecision(5).replace(/\.?0+$/, '')} Ω`;
}

// Solve 3x3 Steinhart-Hart system from 3 (tempC, r) measurement pairs
// Returns { A, B, C } or null if singular
function solveSteinhartHart(measurements) {
    const rows = measurements.map(({ tempC, r }) => {
        const T_K = tempC + 273.15;
        const lnR = Math.log(r);
        return [1, lnR, lnR * lnR * lnR, 1 / T_K];
    });

    // Gaussian elimination with partial pivoting
    for (let col = 0; col < 3; col++) {
        let maxRow = col;
        for (let row = col + 1; row < 3; row++) {
            if (Math.abs(rows[row][col]) > Math.abs(rows[maxRow][col])) maxRow = row;
        }
        [rows[col], rows[maxRow]] = [rows[maxRow], rows[col]];
        if (Math.abs(rows[col][col]) < 1e-20) return null;
        for (let row = col + 1; row < 3; row++) {
            const f = rows[row][col] / rows[col][col];
            for (let j = col; j <= 3; j++) rows[row][j] -= f * rows[col][j];
        }
    }

    // Back substitution
    const x = [0, 0, 0];
    for (let i = 2; i >= 0; i--) {
        x[i] = rows[i][3];
        for (let j = i + 1; j < 3; j++) x[i] -= rows[i][j] * x[j];
        x[i] /= rows[i][i];
    }
    return { A: x[0], B: x[1], C: x[2] };
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function SteinhartHartCalculator({ onBackToHome }) {
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    // ── State ──────────────────────────────────────────────────────────────────
    const [preset, setPreset] = useState('10k_b3950');
    const [model, setModel] = useState('beta');

    // Beta params
    const [beta, setBeta] = useState('3950');
    const [r0, setR0] = useState('10000');
    const [t0, setT0] = useState('25');

    // S-H params
    const [shA, setShA] = useState('1.129148e-3');
    const [shB, setShB] = useState('2.34125e-4');
    const [shC, setShC] = useState('8.76741e-8');

    // Calculation direction
    const [direction, setDirection] = useState('r-to-t');

    // Inputs
    const [resistanceInput, setResistanceInput] = useState('');
    const [tempInput, setTempInput] = useState('');
    const [tempUnit, setTempUnit] = useState('C');

    // Results
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    // ── Table range
    const [tableMin, setTableMin] = useState('-20');
    const [tableMax, setTableMax] = useState('120');
    const [tableStep, setTableStep] = useState('10');

    // ── Coefficient fitting
    const [showFitting, setShowFitting] = useState(false);
    const [fitMeasurements, setFitMeasurements] = useState([
        { temp: '', r: '' },
        { temp: '', r: '' },
        { temp: '', r: '' },
    ]);
    const [fitTempUnit, setFitTempUnit] = useState('C');
    const [fitResult, setFitResult] = useState(null);
    const [fitError, setFitError] = useState('');

    // ── Param temp unit (for T0 in Beta model)
    const [paramTempUnit, setParamTempUnit] = useState('C');

    function handleParamTempUnitChange(newUnit) {
        const raw = parseFloat(t0);
        if (isFinite(raw)) {
            let inC;
            if (paramTempUnit === 'C') inC = raw;
            else if (paramTempUnit === 'F') inC = fahrenheitToCelsius(raw);
            else inC = raw - 273.15;
            let converted;
            if (newUnit === 'C') converted = inC;
            else if (newUnit === 'F') converted = celsiusToFahrenheit(inC);
            else converted = inC + 273.15;
            setT0(String(Math.round(converted * 100) / 100));
        }
        setParamTempUnit(newUnit);
        setPreset('custom');
        setResult(null);
    }

    // ── Preset apply ──────────────────────────────────────────────────────────
    function applyPreset(id) {
        setPreset(id);
        const p = PRESETS[id];
        if (!p) return;
        setModel(p.model);
        if (p.model === 'beta') {
            setBeta(String(p.beta));
            setR0(String(p.r0));
            setT0(String(p.t0));
            setParamTempUnit('C');
        } else {
            setShA(String(p.A));
            setShB(String(p.B));
            setShC(String(p.C));
        }
        setResult(null);
        setError('');
    }

    // ── Validate and compute ──────────────────────────────────────────────────
    function handleCalculate() {
        setError('');
        setResult(null);

        try {
            if (direction === 'r-to-t') {
                const r = parseFloat(resistanceInput);
                if (!isFinite(r) || r <= 0) { setError(t.ntcErrorInvalidResistance); return; }

                let tempC;
                if (model === 'beta') {
                    const bv = parseFloat(beta);
                    const r0v = parseFloat(r0);
                    const t0v_raw = parseFloat(t0);
                    const t0v = paramTempUnit === 'C' ? t0v_raw : paramTempUnit === 'F' ? fahrenheitToCelsius(t0v_raw) : t0v_raw - 273.15;
                    if (!isFinite(bv) || bv <= 0) { setError(t.ntcErrorInvalidBeta); return; }
                    if (!isFinite(r0v) || r0v <= 0) { setError(t.ntcErrorInvalidR0); return; }
                    if (!isFinite(t0v_raw)) { setError(t.ntcErrorInvalidT0); return; }
                    tempC = betaRtoT(r0v, t0v, bv, r);
                } else {
                    const Av = parseFloat(shA);
                    const Bv = parseFloat(shB);
                    const Cv = parseFloat(shC);
                    if (!isFinite(Av) || !isFinite(Bv) || !isFinite(Cv)) { setError(t.ntcErrorInvalidCoefficients); return; }
                    tempC = shRtoT(Av, Bv, Cv, r);
                }

                if (!isFinite(tempC)) { setError(t.ntcErrorOutOfRange); return; }
                setResult({ type: 'temperature', tempC, tempF: celsiusToFahrenheit(tempC), inputR: r });
            } else {
                let inputTempC;
                const tv = parseFloat(tempInput);
                if (!isFinite(tv)) { setError(t.ntcErrorInvalidTemperature); return; }
                inputTempC = tempUnit === 'C' ? tv : tempUnit === 'F' ? fahrenheitToCelsius(tv) : tv - 273.15;

                let r;
                if (model === 'beta') {
                    const bv = parseFloat(beta);
                    const r0v = parseFloat(r0);
                    const t0v_raw = parseFloat(t0);
                    const t0v = paramTempUnit === 'C' ? t0v_raw : paramTempUnit === 'F' ? fahrenheitToCelsius(t0v_raw) : t0v_raw - 273.15;
                    if (!isFinite(bv) || bv <= 0) { setError(t.ntcErrorInvalidBeta); return; }
                    if (!isFinite(r0v) || r0v <= 0) { setError(t.ntcErrorInvalidR0); return; }
                    if (!isFinite(t0v_raw)) { setError(t.ntcErrorInvalidT0); return; }
                    r = betaTtoR(r0v, t0v, bv, inputTempC);
                } else {
                    const Av = parseFloat(shA);
                    const Bv = parseFloat(shB);
                    const Cv = parseFloat(shC);
                    if (!isFinite(Av) || !isFinite(Bv) || !isFinite(Cv)) { setError(t.ntcErrorInvalidCoefficients); return; }
                    r = shTtoR(Av, Bv, Cv, inputTempC);
                }

                if (!isFinite(r) || r <= 0) { setError(t.ntcErrorOutOfRange); return; }
                setResult({ type: 'resistance', r, inputTempC, inputTempF: celsiusToFahrenheit(inputTempC), inputTempK: inputTempC + 273.15 });
            }
        } catch {
            setError(t.ntcErrorOutOfRange);
        }
    }

    // ── Coefficient fitting ───────────────────────────────────────────────────
    function handleFitCoefficients() {
        setFitError('');
        setFitResult(null);

        const parsed = fitMeasurements.map(({ temp, r }) => {
            const tv = parseFloat(temp);
            const rv = parseFloat(r);
            const tC = fitTempUnit === 'C' ? tv : fitTempUnit === 'F' ? fahrenheitToCelsius(tv) : tv - 273.15;
            return { tempC: tC, r: rv };
        });

        if (parsed.some(({ tempC, r }) => !isFinite(tempC) || !isFinite(r) || r <= 0)) {
            setFitError(t.ntcFitErrorNeedThree);
            return;
        }

        const coeffs = solveSteinhartHart(parsed);
        if (!coeffs) {
            setFitError(t.ntcFitErrorSingular);
            return;
        }
        setFitResult(coeffs);
    }

    function handleUseCoefficients() {
        if (!fitResult) return;
        setShA(fitResult.A.toExponential(6));
        setShB(fitResult.B.toExponential(6));
        setShC(fitResult.C.toExponential(6));
        setModel('steinhart-hart');
        setPreset('custom');
        setResult(null);
        setError('');
    }

    // ── Characteristic table ──────────────────────────────────────────────────
    const tableData = useMemo(() => {
        const minT = parseFloat(tableMin);
        const maxT = parseFloat(tableMax);
        const stepT = parseFloat(tableStep);
        if (!isFinite(minT) || !isFinite(maxT) || !isFinite(stepT) || stepT <= 0 || minT >= maxT) return [];

        const rows = [];
        for (let tempC = minT; tempC <= maxT + stepT * 0.001; tempC += stepT) {
            const tC = Math.round(tempC * 1000) / 1000;
            try {
                let r;
                if (model === 'beta') {
                    const bv = parseFloat(beta);
                    const r0v = parseFloat(r0);
                    const t0v_raw = parseFloat(t0);
                    const t0v = paramTempUnit === 'C' ? t0v_raw : paramTempUnit === 'F' ? fahrenheitToCelsius(t0v_raw) : t0v_raw - 273.15;
                    if (!isFinite(bv) || !isFinite(r0v) || !isFinite(t0v_raw) || bv <= 0 || r0v <= 0) break;
                    r = betaTtoR(r0v, t0v, bv, tC);
                } else {
                    const Av = parseFloat(shA);
                    const Bv = parseFloat(shB);
                    const Cv = parseFloat(shC);
                    if (!isFinite(Av) || !isFinite(Bv) || !isFinite(Cv)) break;
                    r = shTtoR(Av, Bv, Cv, tC);
                }
                if (isFinite(r) && r > 0) {
                    rows.push({ tempC: tC, tempF: celsiusToFahrenheit(tC), r });
                }
            } catch {
                // skip invalid rows
            }
        }
        return rows;
    }, [tableMin, tableMax, tableStep, model, beta, r0, t0, paramTempUnit, shA, shB, shC]);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="steinhart-calculator">
            <div className="steinhart-calculator__container">

                {/* Header */}
                <PageHeader
                    onBackToHome={onBackToHome}
                    backToHomeText={t.backToHome}
                    title={<><FaThermometerHalf /> {t.ntcTitle}</>}
                    description={t.ntcSubtitle}
                    languageSelectorVariant="calculator-steinhart"
                />

                {/* NTC Configuration */}
                <div className="steinhart-calculator__section">
                    <h2 className="steinhart-calculator__section-title">{t.ntcConfiguration}</h2>
                    <div className="steinhart-calculator__inputs">
                        <StyledSelect
                            label={t.ntcPreset}
                            value={{ value: preset, label: t[PRESETS[preset]?.labelKey] ?? preset }}
                            onChange={(opt) => applyPreset(opt.value)}
                            options={Object.entries(PRESETS).map(([id, p]) => ({ value: id, label: t[p.labelKey] ?? p.labelKey }))}
                            icon={FaListAlt}
                            variant="calculator-steinhart"
                        />
                        <StyledSelect
                            label={t.ntcModel}
                            value={{ value: model, label: model === 'beta' ? t.ntcModelBeta : t.ntcModelSH }}
                            onChange={(opt) => { setModel(opt.value); setPreset('custom'); setResult(null); setError(''); }}
                            options={[
                                { value: 'beta', label: t.ntcModelBeta },
                                { value: 'steinhart-hart', label: t.ntcModelSH },
                            ]}
                            icon={FaCog}
                            variant="calculator-steinhart"
                        />
                    </div>
                </div>

                {/* Model Parameters */}
                <div className="steinhart-calculator__section">
                    <h2 className="steinhart-calculator__section-title">{t.ntcParameters}</h2>
                    {model === 'beta' ? (
                        <div className="steinhart-calculator__inputs">
                            <StyledInput
                                label={t.ntcBetaValue}
                                type="number"
                                value={beta}
                                onChange={(e) => { setBeta(e.target.value); setPreset('custom'); setResult(null); }}
                                placeholder="3950"
                                min="0"
                                variant="calculator-steinhart"
                            />
                            <StyledInput
                                label={`${t.ntcR0} (Ω)`}
                                type="number"
                                value={r0}
                                onChange={(e) => { setR0(e.target.value); setPreset('custom'); setResult(null); }}
                                placeholder="10000"
                                min="0"
                                variant="calculator-steinhart"
                            />
                            <StyledInput
                                label={`${t.ntcT0} (${paramTempUnit === 'C' ? '°C' : paramTempUnit === 'F' ? '°F' : 'K'})`}
                                type="number"
                                value={t0}
                                onChange={(e) => { setT0(e.target.value); setPreset('custom'); setResult(null); }}
                                placeholder={paramTempUnit === 'C' ? '25' : paramTempUnit === 'F' ? '77' : '298.15'}
                                variant="calculator-steinhart"
                            />
                            <StyledSelect
                                label={t.ntcTempUnit}
                                value={{ value: paramTempUnit, label: paramTempUnit === 'C' ? '°C' : paramTempUnit === 'F' ? '°F' : 'K' }}
                                onChange={(opt) => handleParamTempUnitChange(opt.value)}
                                options={[
                                    { value: 'C', label: '°C' },
                                    { value: 'F', label: '°F' },
                                    { value: 'K', label: 'K' },
                                ]}
                                icon={FaThermometerHalf}
                                variant="calculator-steinhart"
                            />
                        </div>
                    ) : (
                        <div className="steinhart-calculator__inputs">
                            <StyledInput
                                label={t.ntcCoeffA}
                                value={shA}
                                onChange={(e) => { setShA(e.target.value); setPreset('custom'); setResult(null); }}
                                placeholder="1.129148e-3"
                                variant="calculator-steinhart"
                            />
                            <StyledInput
                                label={t.ntcCoeffB}
                                value={shB}
                                onChange={(e) => { setShB(e.target.value); setPreset('custom'); setResult(null); }}
                                placeholder="2.34125e-4"
                                variant="calculator-steinhart"
                            />
                            <StyledInput
                                label={t.ntcCoeffC}
                                value={shC}
                                onChange={(e) => { setShC(e.target.value); setPreset('custom'); setResult(null); }}
                                placeholder="8.76741e-8"
                                variant="calculator-steinhart"
                            />
                        </div>
                    )}

                    {model === 'beta' && (
                        <p className="steinhart-calculator__formula">
                            1/T = 1/T₀ + (1/B) · ln(R/R₀)
                        </p>
                    )}
                    {model === 'steinhart-hart' && (
                        <p className="steinhart-calculator__formula">
                            1/T = A + B·ln(R) + C·(ln(R))³
                        </p>
                    )}
                </div>

                {/* Coefficient Fitting — only for Steinhart-Hart model */}
                {model === 'steinhart-hart' && <div className="steinhart-calculator__section">
                    <div className="steinhart-calculator__table-header">
                        <h2 className="steinhart-calculator__section-title steinhart-calculator__section-title--inline">
                            {t.ntcFitTitle}
                        </h2>
                        <button
                            className="steinhart-calculator__toggle-btn"
                            onClick={() => { setShowFitting((v) => !v); setFitResult(null); setFitError(''); }}
                        >
                            {showFitting ? t.ntcFitHide : t.ntcFitShow}
                        </button>
                    </div>

                    {showFitting && (
                        <>
                            <p className="steinhart-calculator__fit-desc">{t.ntcFitDescription}</p>

                            <div className="steinhart-calculator__fit-options">
                                <StyledSelect
                                    label={t.ntcTempUnit}
                                    value={{ value: fitTempUnit, label: fitTempUnit === 'C' ? '°C' : fitTempUnit === 'F' ? '°F' : 'K' }}
                                    onChange={(opt) => { setFitTempUnit(opt.value); setFitResult(null); setFitError(''); }}
                                    options={[
                                        { value: 'C', label: '°C' },
                                        { value: 'F', label: '°F' },
                                        { value: 'K', label: 'K' },
                                    ]}
                                    icon={FaThermometerHalf}
                                    variant="calculator-steinhart"
                                />
                            </div>

                            <div className="steinhart-calculator__fit-measurements">
                                {fitMeasurements.map((m, i) => (
                                    <div key={i} className="steinhart-calculator__fit-row">
                                        <span className="steinhart-calculator__fit-row-label">
                                            {t.ntcFitMeasurement} {i + 1}
                                        </span>
                                        <StyledInput
                                            label={`${t.ntcInputTemperature} (${fitTempUnit === 'C' ? '°C' : fitTempUnit === 'F' ? '°F' : 'K'})`}
                                            type="number"
                                            value={m.temp}
                                            onChange={(e) => {
                                                setFitMeasurements(fitMeasurements.map((item, j) =>
                                                    j === i ? { ...item, temp: e.target.value } : item
                                                ));
                                                setFitResult(null);
                                                setFitError('');
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFitCoefficients()}
                                            variant="calculator-steinhart"
                                        />
                                        <StyledInput
                                            label={`${t.ntcInputResistance} (Ω)`}
                                            type="number"
                                            value={m.r}
                                            min="0"
                                            onChange={(e) => {
                                                setFitMeasurements(fitMeasurements.map((item, j) =>
                                                    j === i ? { ...item, r: e.target.value } : item
                                                ));
                                                setFitResult(null);
                                                setFitError('');
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFitCoefficients()}
                                            variant="calculator-steinhart"
                                        />
                                    </div>
                                ))}
                            </div>

                            {fitError && <p className="steinhart-calculator__error">{fitError}</p>}

                            <div className="steinhart-calculator__actions">
                                <AnimatedButton color="blue" onClick={handleFitCoefficients}>
                                    {t.ntcFitCalculate}
                                </AnimatedButton>
                            </div>

                            {fitResult && (
                                <div className="steinhart-calculator__fit-result">
                                    <h3 className="steinhart-calculator__fit-result-title">{t.ntcFitResult}</h3>
                                    <div className="steinhart-calculator__result-grid">
                                        <div className="steinhart-calculator__result-item steinhart-calculator__result-item--highlight">
                                            <span className="steinhart-calculator__result-label">{t.ntcCoeffA}</span>
                                            <span className="steinhart-calculator__result-value">{fitResult.A.toExponential(6)}</span>
                                        </div>
                                        <div className="steinhart-calculator__result-item steinhart-calculator__result-item--highlight">
                                            <span className="steinhart-calculator__result-label">{t.ntcCoeffB}</span>
                                            <span className="steinhart-calculator__result-value">{fitResult.B.toExponential(6)}</span>
                                        </div>
                                        <div className="steinhart-calculator__result-item steinhart-calculator__result-item--highlight">
                                            <span className="steinhart-calculator__result-label">{t.ntcCoeffC}</span>
                                            <span className="steinhart-calculator__result-value">{fitResult.C.toExponential(6)}</span>
                                        </div>
                                    </div>
                                    <div className="steinhart-calculator__actions steinhart-calculator__actions--top-gap">
                                        <AnimatedButton color="green" onClick={handleUseCoefficients}>
                                            {t.ntcFitUseCoefficients}
                                        </AnimatedButton>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>}

                {/* Calculator */}
                <div className="steinhart-calculator__section">
                    <h2 className="steinhart-calculator__section-title">{t.ntcCalculate}</h2>

                    <div className="steinhart-calculator__direction-tabs">
                        <button
                            className={`steinhart-calculator__tab${direction === 'r-to-t' ? ' steinhart-calculator__tab--active' : ''}`}
                            onClick={() => { setDirection('r-to-t'); setResult(null); setError(''); }}
                        >
                            {t.ntcDirectionRtoT}
                        </button>
                        <button
                            className={`steinhart-calculator__tab${direction === 't-to-r' ? ' steinhart-calculator__tab--active' : ''}`}
                            onClick={() => { setDirection('t-to-r'); setResult(null); setError(''); }}
                        >
                            {t.ntcDirectionTtoR}
                        </button>
                    </div>

                    <div className="steinhart-calculator__inputs steinhart-calculator__inputs--narrow">
                        {direction === 'r-to-t' ? (
                            <StyledInput
                                label={`${t.ntcInputResistance} (Ω)`}
                                type="number"
                                value={resistanceInput}
                                onChange={(e) => { setResistanceInput(e.target.value); setResult(null); setError(''); }}
                                placeholder="10000"
                                min="0"
                                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                                variant="calculator-steinhart"
                            />
                        ) : (
                            <>
                                <StyledInput
                                    label={t.ntcInputTemperature}
                                    type="number"
                                    value={tempInput}
                                    onChange={(e) => { setTempInput(e.target.value); setResult(null); setError(''); }}
                                    placeholder={tempUnit === 'C' ? '25' : tempUnit === 'F' ? '77' : '298.15'}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                                    variant="calculator-steinhart"
                                />
                                <StyledSelect
                                    label={t.ntcTempUnit}
                                    value={{ value: tempUnit, label: tempUnit === 'C' ? '°C' : tempUnit === 'F' ? '°F' : 'K' }}
                                    onChange={(opt) => { setTempUnit(opt.value); setResult(null); setError(''); }}
                                    options={[
                                        { value: 'C', label: '°C' },
                                        { value: 'F', label: '°F' },
                                        { value: 'K', label: 'K' },
                                    ]}
                                    icon={FaThermometerHalf}
                                    variant="calculator-steinhart"
                                />
                            </>
                        )}
                    </div>

                    {error && <p className="steinhart-calculator__error">{error}</p>}

                    <div className="steinhart-calculator__actions">
                        <AnimatedButton color="blue" onClick={handleCalculate}>
                            {t.calculate}
                        </AnimatedButton>
                    </div>
                </div>

                {/* Results */}
                {result && (
                    <div className="steinhart-calculator__section steinhart-calculator__section--result">
                        <h2 className="steinhart-calculator__section-title">{t.results}</h2>
                        {result.type === 'temperature' ? (
                            <div className="steinhart-calculator__result-grid">
                                <div className="steinhart-calculator__result-item">
                                    <span className="steinhart-calculator__result-label">{t.ntcInputResistance}</span>
                                    <span className="steinhart-calculator__result-value">{formatResistance(result.inputR)}</span>
                                </div>
                                <div className="steinhart-calculator__result-item steinhart-calculator__result-item--highlight">
                                    <span className="steinhart-calculator__result-label">{t.ntcResultTempC}</span>
                                    <span className="steinhart-calculator__result-value">{result.tempC.toFixed(3)} °C</span>
                                </div>
                                <div className="steinhart-calculator__result-item steinhart-calculator__result-item--highlight">
                                    <span className="steinhart-calculator__result-label">{t.ntcResultTempF}</span>
                                    <span className="steinhart-calculator__result-value">{result.tempF.toFixed(3)} °F</span>
                                </div>
                                <div className="steinhart-calculator__result-item">
                                    <span className="steinhart-calculator__result-label">{t.ntcResultTempK}</span>
                                    <span className="steinhart-calculator__result-value">{(result.tempC + 273.15).toFixed(3)} K</span>
                                </div>
                            </div>
                        ) : (
                            <div className="steinhart-calculator__result-grid">
                                <div className="steinhart-calculator__result-item">
                                    <span className="steinhart-calculator__result-label">{t.ntcInputTemperature}</span>
                                    <span className="steinhart-calculator__result-value">{result.inputTempC.toFixed(3)} °C / {result.inputTempF.toFixed(3)} °F / {result.inputTempK.toFixed(3)} K</span>
                                </div>
                                <div className="steinhart-calculator__result-item steinhart-calculator__result-item--highlight">
                                    <span className="steinhart-calculator__result-label">{t.ntcResultResistance} (Ω)</span>
                                    <span className="steinhart-calculator__result-value">{result.r.toFixed(2)} Ω</span>
                                </div>
                                <div className="steinhart-calculator__result-item steinhart-calculator__result-item--highlight">
                                    <span className="steinhart-calculator__result-label">{t.ntcResultResistance} (kΩ)</span>
                                    <span className="steinhart-calculator__result-value">{(result.r / 1000).toPrecision(5).replace(/\.?0+$/, '')} kΩ</span>
                                </div>
                                <div className="steinhart-calculator__result-item">
                                    <span className="steinhart-calculator__result-label">{t.ntcResultResistance} (formatted)</span>
                                    <span className="steinhart-calculator__result-value">{formatResistance(result.r)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Characteristic Table */}
                <div className="steinhart-calculator__section">
                    <h2 className="steinhart-calculator__section-title">{t.ntcCharacteristicTable}</h2>

                    <div className="steinhart-calculator__inputs steinhart-calculator__inputs--narrow">
                        <StyledInput
                            label={`${t.ntcTableMin} (°C)`}
                            type="number"
                            value={tableMin}
                            onChange={(e) => setTableMin(e.target.value)}
                            variant="calculator-steinhart"
                        />
                        <StyledInput
                            label={`${t.ntcTableMax} (°C)`}
                            type="number"
                            value={tableMax}
                            onChange={(e) => setTableMax(e.target.value)}
                            variant="calculator-steinhart"
                        />
                        <StyledInput
                            label={`${t.ntcTableStep} (°C)`}
                            type="number"
                            value={tableStep}
                            onChange={(e) => setTableStep(e.target.value)}
                            min="0.1"
                            variant="calculator-steinhart"
                        />
                    </div>

                    {tableData.length > 0 ? (
                        <div className="steinhart-calculator__table-wrapper">
                            <table className="steinhart-calculator__table">
                                <thead>
                                    <tr>
                                        <th>{t.ntcTableTempC}</th>
                                        <th>{t.ntcTableTempF}</th>
                                        <th>{t.ntcTableTempK}</th>
                                        <th>{t.ntcTableResistance}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((row, i) => (
                                        <tr key={i}>
                                            <td>{row.tempC.toFixed(1)} °C</td>
                                            <td>{row.tempF.toFixed(1)} °F</td>
                                            <td>{(row.tempC + 273.15).toFixed(1)} K</td>
                                            <td>{formatResistance(row.r)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="steinhart-calculator__error">{t.ntcTableInvalidRange}</p>
                    )}
                </div>

            </div>
        </div>
    );
}
