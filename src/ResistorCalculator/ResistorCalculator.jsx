import { useMemo, useState } from 'react';
import { FaMicrochip } from 'react-icons/fa';
import AnimatedButton from '../components/AnimatedButton/AnimatedButton';
import PageHeader from '../components/PageHeader/PageHeader';
import StyledSelect from '../components/StyledSelect/StyledSelect';
import StyledInput from '../components/StyledInput/StyledInput';
import { useLanguage } from '../contexts/LanguageContext';
import translations from '../Translation/Translations';
import './ResistorCalculator.scss';

const REGULATOR_SPECS = {
    LMR16006: { vfb: 0.765, name: 'LMR16006' },
    ISL85415: { vfb: 0.6, name: 'ISL85415' },
    MP1482: { vfb: 0.923, name: 'MP1482' },
    LM317: { vfb: 1.25, name: 'LM317' }
};

const SMD_0805_RESISTOR_VALUES = [
    0,
    1,
    7.5,
    10,
    22,
    39,
    47,
    68,
    75,
    100,
    130,
    220,
    360,
    470,
    680,
    750,
    1000,
    1300,
    1800,
    2200,
    3000,
    3600,
    3900,
    4700,
    5600,
    6800,
    10000,
    12000,
    22000,
    33000,
    39000,
    47000,
    51100,
    56000,
    68000,
    75000,
    100000,
    130000,
    150000,
    180000,
    220000,
    270000,
    330000,
    390000,
    470000,
    560000,
    680000,
    750000,
    1000000,
    2700000,
    3300000,
    4700000,
    10000000
];

// 1/4W through-hole resistors (user's actual stock)
const THROUGH_HOLE_RESISTOR_VALUES = [
    0,
    10,
    22,
    47,
    100,
    150,
    200,
    220,
    270,
    330,
    470,
    510,
    680,
    1000,
    2000,
    2200,
    3300,
    4700,
    5100,
    6800,
    10000,
    20000,
    47000,
    51000,
    68000,
    100000,
    220000,
    300000,
    470000,
    680000,
    1000000
];

function toListText(values) {
    return values.join(', ');
}

function parseResistorToken(token) {
    const cleaned = token.trim().toLowerCase().replace(',', '.');
    if (!cleaned) {
        return null;
    }

    // Supports plain numbers and simple IEC-like suffixes such as 4k7, 1m, 220r.
    const iecMatch = cleaned.match(/^(\d*\.?\d+)([rmk])(\d*)$/);
    if (iecMatch) {
        const base = Number(iecMatch[1]);
        const marker = iecMatch[2];
        const tail = iecMatch[3] || '';

        if (Number.isNaN(base)) {
            return null;
        }

        if (marker === 'r') {
            return Number(`${base}${tail ? `.${tail}` : ''}`);
        }

        if (marker === 'k') {
            return Number(`${base}${tail ? `.${tail}` : ''}`) * 1000;
        }

        if (marker === 'm') {
            return Number(`${base}${tail ? `.${tail}` : ''}`) * 1000000;
        }
    }

    const numeric = Number(cleaned);
    return Number.isNaN(numeric) ? null : numeric;
}

function parseResistorList(text) {
    const tokens = text.split(/[;\n\t ]+|,/).map((item) => item.trim()).filter(Boolean);

    if (!tokens.length) {
        return { values: [], invalidTokens: [] };
    }

    const parsed = [];
    const invalidTokens = [];

    for (const token of tokens) {
        const value = parseResistorToken(token);
        if (value === null || value < 0) {
            invalidTokens.push(token);
            continue;
        }
        parsed.push(value);
    }

    const uniqueSorted = Array.from(new Set(parsed)).sort((a, b) => a - b);
    return { values: uniqueSorted, invalidTokens };
}

function formatResistorNotation(value) {
    if (value >= 1000000) {
        const scaled = (value / 1000000).toPrecision(6).replace(/\.?0+$/, '');
        return `${scaled}M`;
    }

    if (value >= 1000) {
        const scaled = (value / 1000).toPrecision(6).replace(/\.?0+$/, '');
        return `${scaled}k`;
    }

    return `${value.toPrecision(6).replace(/\.?0+$/, '')}R`;
}

function calculateVout(vfb, r1, r2) {
    return vfb * (1 + r1 / r2);
}

function calculateVoutRange(vfb, r1, r2, resistorTolerance) {
    const r1Min = r1 * (1 - resistorTolerance);
    const r1Max = r1 * (1 + resistorTolerance);
    const r2Min = r2 * (1 - resistorTolerance);
    const r2Max = r2 * (1 + resistorTolerance);

    return {
        min: vfb * (1 + r1Min / r2Max),
        max: vfb * (1 + r1Max / r2Min)
    };
}

function calculateResistorPower(r1, r2, vout) {
    if (r1 === 0 || r2 === 0) {
        return { powerR1: 0, powerR2: 0, maxPower: 0 };
    }

    const current = vout / (r1 + r2);
    const powerR1 = current * current * r1;
    const powerR2 = current * current * r2;

    return { powerR1, powerR2, maxPower: Math.max(powerR1, powerR2) };
}

function findResistorPairs({ vfb, targetVout, voltageTolerance, resistorTolerance, maxWattage, resistorValues }) {
    const output = [];
    const voutMinTarget = targetVout - voltageTolerance;
    const voutMaxTarget = targetVout + voltageTolerance;

    for (const r1 of resistorValues) {
        for (const r2 of resistorValues) {
            if (r2 === 0) {
                continue;
            }

            const nominalVout = calculateVout(vfb, r1, r2);
            if (nominalVout < voutMinTarget || nominalVout > voutMaxTarget) {
                continue;
            }

            const range = calculateVoutRange(vfb, r1, r2, resistorTolerance);
            const power = calculateResistorPower(r1, r2, nominalVout);

            if (maxWattage > 0 && power.maxPower > maxWattage) {
                continue;
            }

            output.push({
                r1,
                r2,
                nominalVout,
                minVout: range.min,
                maxVout: range.max,
                deviation: Math.abs(nominalVout - targetVout),
                worstCaseOk: range.min >= voutMinTarget && range.max <= voutMaxTarget,
                ...power
            });
        }
    }

    output.sort((a, b) => a.deviation - b.deviation);
    return output;
}

function formatOhms(value) {
    return `${formatResistorNotation(value)} (${value} ohm)`;
}

function formatVoltage(value) {
    return `${value.toFixed(3)} V`;
}

function formatPower(value) {
    return `${value.toFixed(4)} W`;
}

function buildTypeMap(useSmd, useTh, customValues) {
    const map = {};
    const add = (val, flag) => {
        map[val] = map[val] ? `${map[val]}+${flag}` : flag;
    };
    if (useSmd) SMD_0805_RESISTOR_VALUES.forEach((v) => add(v, 'smd'));
    if (useTh) THROUGH_HOLE_RESISTOR_VALUES.forEach((v) => add(v, 'th'));
    customValues.forEach((v) => add(v, 'custom'));
    return map;
}

function ResistorCalculator({ onBackToHome }) {
    const { language } = useLanguage();
    const t = translations[language];

    const [regulator, setRegulator] = useState('MP1482');
    const [customVfb, setCustomVfb] = useState(0.8);
    const [targetVout, setTargetVout] = useState(3.3);
    const [voltageTolerance, setVoltageTolerance] = useState(0.05);
    const [resistorTolerancePercent, setResistorTolerancePercent] = useState(5);
    const [maxWattage, setMaxWattage] = useState(0.125);
    const [maxResults, setMaxResults] = useState(20);
    const [calculationError, setCalculationError] = useState('');
    const [results, setResults] = useState([]);
    const [resistorValues, setResistorValues] = useState(SMD_0805_RESISTOR_VALUES);
    const [useSmd0805, setUseSmd0805] = useState(true);
    const [useThroughHole, setUseThroughHole] = useState(false);
    const [customResistorText, setCustomResistorText] = useState('');
    const [resistorListError, setResistorListError] = useState('');
    const [resistorTypeMap, setResistorTypeMap] = useState(() => buildTypeMap(true, false, []));
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [hasCalculated, setHasCalculated] = useState(false);

    const activeSpec = REGULATOR_SPECS[regulator];
    const activeVfb = regulator === 'CUSTOM' ? customVfb : activeSpec.vfb;
    const activeRegulatorName = regulator === 'CUSTOM' ? t.customIc : activeSpec.name;
    const combinationCount = useMemo(() => resistorValues.length * resistorValues.length, [resistorValues]);

    const clearCalculatedResults = () => {
        setCalculationError('');
        setResults([]);
        setHasCalculated(false);
    };

    const handleCalculate = () => {
        setCalculationError('');

        if (regulator === 'CUSTOM' && (Number.isNaN(customVfb) || customVfb <= 0)) {
            setCalculationError(t.invalidFeedbackVoltage);
            return;
        }

        if (!resistorValues.length) {
            setResistorListError(t.resistorListNeedsValues);
            return;
        }

        const resistorTolerance = resistorTolerancePercent / 100;
        const computed = findResistorPairs({
            vfb: activeVfb,
            targetVout,
            voltageTolerance,
            resistorTolerance,
            maxWattage,
            resistorValues
        });
        setHasCalculated(true);
        setResults(computed);
    };

    const handleApplyResistorList = () => {
        const { values: customValues, invalidTokens } = parseResistorList(customResistorText);

        if (invalidTokens.length > 0) {
            setResistorListError(`${t.invalidResistorList}: ${invalidTokens.join(', ')}`);
            return;
        }

        const combined = [];
        if (useSmd0805) combined.push(...SMD_0805_RESISTOR_VALUES);
        if (useThroughHole) combined.push(...THROUGH_HOLE_RESISTOR_VALUES);
        combined.push(...customValues);

        const merged = Array.from(new Set(combined)).sort((a, b) => a - b);
        if (!merged.length) {
            setResistorListError(t.resistorListNeedsValues);
            return;
        }

        setResistorListError('');
        setResistorValues(merged);
        setResistorTypeMap(buildTypeMap(useSmd0805, useThroughHole, customValues));
        setHasCalculated(false);
        setResults([]);
        setIsListModalOpen(false);
    };

    const handleResetResistorList = () => {
        setUseSmd0805(true);
        setUseThroughHole(false);
        setCustomResistorText('');
        setResistorValues(SMD_0805_RESISTOR_VALUES);
        setResistorTypeMap(buildTypeMap(true, false, []));
        setResistorListError('');
        setHasCalculated(false);
        setResults([]);
    };

    const handleOpenListModal = () => {
        setResistorListError('');
        setIsListModalOpen(true);
    };

    const handleCloseListModal = () => {
        setResistorListError('');
        setIsListModalOpen(false);
    };

    const handleResetAll = () => {
        setRegulator('MP1482');
        setCustomVfb(0.8);
        setTargetVout(3.3);
        setVoltageTolerance(0.05);
        setResistorTolerancePercent(5);
        setMaxWattage(0.125);
        setMaxResults(20);
        setResistorValues(SMD_0805_RESISTOR_VALUES);
        setUseSmd0805(true);
        setUseThroughHole(false);
        setCustomResistorText('');
        setResistorTypeMap(buildTypeMap(true, false, []));
        setResistorListError('');
        setCalculationError('');
        setResults([]);
        setHasCalculated(false);
        setIsListModalOpen(false);
    };

    const topResults = results.slice(0, maxResults);
    const recommendedPair = results[0] || null;

    const getTypeLabel = (value) => {
        const type = resistorTypeMap[value];
        if (!type) return '';
        return type.split('+').map((k) => {
            if (k === 'smd') return t.resistorTypeSmd;
            if (k === 'th') return t.resistorTypeTh;
            if (k === 'custom') return t.resistorTypeCustom;
            return k;
        }).join(' + ');
    };

    return (
        <div className="resistor-calculator">
            <div className="resistor-calculator__container">
                <PageHeader
                    onBackToHome={onBackToHome}
                    backToHomeText={t.backToHome}
                    title={<><FaMicrochip /> {t.resistorCalculatorTitle}</>}
                    description={t.resistorCalculatorDescription}
                    languageSelectorVariant="calculator-resistor"
                />

                <div className="resistor-calculator__section">
                    <h2 className="resistor-calculator__section-title">{t.inputParameters}</h2>

                    <div className="resistor-calculator__inputs">
                        <StyledSelect
                            label={t.regulator}
                            value={{
                                value: regulator,
                                label: regulator === 'CUSTOM'
                                    ? t.customIc
                                    : `${REGULATOR_SPECS[regulator].name} (Vfb: ${REGULATOR_SPECS[regulator].vfb} V)`
                            }}
                            onChange={(opt) => { setRegulator(opt.value); clearCalculatedResults(); }}
                            options={[
                                ...Object.keys(REGULATOR_SPECS).map((key) => ({
                                    value: key,
                                    label: `${REGULATOR_SPECS[key].name} (Vfb: ${REGULATOR_SPECS[key].vfb} V)`
                                })),
                                { value: 'CUSTOM', label: t.customIc }
                            ]}
                            icon={FaMicrochip}
                            variant="calculator-resistor"
                        />

                        {regulator === 'CUSTOM' && (
                            <StyledInput
                                label={t.customFeedbackVoltage}
                                type="number"
                                step="0.001"
                                min="0"
                                value={customVfb}
                                onChange={(e) => {
                                    setCustomVfb(Number(e.target.value));
                                    clearCalculatedResults();
                                }}
                                variant="calculator-resistor"
                            />
                        )}

                        <StyledInput
                            label={t.targetVoltage}
                            type="number"
                            step="0.01"
                            min="0"
                            value={targetVout}
                            onChange={(e) => {
                                setTargetVout(Number(e.target.value));
                                clearCalculatedResults();
                            }}
                            variant="calculator-resistor"
                        />

                        <StyledInput
                            label={t.voltageTolerance}
                            type="number"
                            step="0.01"
                            min="0"
                            value={voltageTolerance}
                            onChange={(e) => {
                                setVoltageTolerance(Number(e.target.value));
                                clearCalculatedResults();
                            }}
                            variant="calculator-resistor"
                        />

                        <StyledInput
                            label={t.resistorTolerance}
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={resistorTolerancePercent}
                            onChange={(e) => {
                                setResistorTolerancePercent(Number(e.target.value));
                                clearCalculatedResults();
                            }}
                            variant="calculator-resistor"
                        />

                        <StyledInput
                            label={t.maxWattage}
                            type="number"
                            step="0.001"
                            min="0"
                            value={maxWattage}
                            onChange={(e) => {
                                setMaxWattage(Number(e.target.value));
                                clearCalculatedResults();
                            }}
                            variant="calculator-resistor"
                        />

                        <StyledInput
                            label={t.maxResults}
                            type="number"
                            step="1"
                            min="1"
                            max="100"
                            value={maxResults}
                            onChange={(e) => {
                                setMaxResults(Number(e.target.value));
                                clearCalculatedResults();
                            }}
                            variant="calculator-resistor"
                        />
                    </div>

                    <div className="resistor-calculator__meta">
                        <span>{t.availableResistors}: {resistorValues.length}</span>
                        <span>{t.possibleCombinations}: {combinationCount}</span>
                    </div>

                    <div className="resistor-calculator__actions">
                        <AnimatedButton color="orange" onClick={handleOpenListModal}>
                            {t.editResistorList}
                        </AnimatedButton>
                        <AnimatedButton color="green" onClick={handleCalculate}>
                            {t.calculatePairs}
                        </AnimatedButton>
                        <AnimatedButton color="gray" onClick={handleResetAll}>
                            {t.resetAll}
                        </AnimatedButton>
                    </div>
                    {calculationError && <p className="resistor-calculator__list-error">{calculationError}</p>}
                </div>

                {hasCalculated && (
                <div className="resistor-calculator__section">
                    {!results.length && <p className="resistor-calculator__list-error">{t.noPairsFound}</p>}

                    {!!results.length && (
                        <>
                            <h2 className="resistor-calculator__section-title">
                                {t.resultsFound}: {results.length}
                            </h2>

                            {recommendedPair && (
                                <div className="resistor-calculator__recommendation">
                                    <h3>{t.recommendedPair} {activeRegulatorName}</h3>
                                    <div className="recommendation-grid">
                                        <div className="recommendation-item">
                                            <span className="recommendation-label">{t.r1}</span>
                                            <span className="recommendation-value">
                                                {formatOhms(recommendedPair.r1)}
                                                {getTypeLabel(recommendedPair.r1) && <span className="resistor-type-badge">{getTypeLabel(recommendedPair.r1)}</span>}
                                            </span>
                                        </div>
                                        <div className="recommendation-item">
                                            <span className="recommendation-label">{t.r2}</span>
                                            <span className="recommendation-value">
                                                {formatOhms(recommendedPair.r2)}
                                                {getTypeLabel(recommendedPair.r2) && <span className="resistor-type-badge">{getTypeLabel(recommendedPair.r2)}</span>}
                                            </span>
                                        </div>
                                        <div className="recommendation-item">
                                            <span className="recommendation-label">{t.nominalVout}</span>
                                            <span className="recommendation-value">{formatVoltage(recommendedPair.nominalVout)}</span>
                                        </div>
                                        <div className="recommendation-item">
                                            <span className="recommendation-label">{t.voutRange}</span>
                                            <span className="recommendation-value">{formatVoltage(recommendedPair.minVout)} to {formatVoltage(recommendedPair.maxVout)}</span>
                                        </div>
                                        <div className="recommendation-item">
                                            <span className="recommendation-label">{t.powerR1}</span>
                                            <span className="recommendation-value">{formatPower(recommendedPair.powerR1)}</span>
                                        </div>
                                        <div className="recommendation-item">
                                            <span className="recommendation-label">{t.powerR2}</span>
                                            <span className="recommendation-value">{formatPower(recommendedPair.powerR2)}</span>
                                        </div>
                                        <div className="recommendation-item">
                                            <span className="recommendation-label">{t.maxPowerResult}</span>
                                            <span className="recommendation-value">{formatPower(recommendedPair.maxPower)}</span>
                                        </div>
                                        <div className="recommendation-item">
                                            <span className="recommendation-label">{t.worstCase}</span>
                                            <span className="recommendation-value">{recommendedPair.worstCaseOk ? t.yes : t.no}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="resistor-calculator__table-wrap">
                                <table className="resistor-calculator__table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>{t.r1}</th>
                                            <th>{t.r2}</th>
                                            <th>{t.nominalVout}</th>
                                            <th>{t.minVout}</th>
                                            <th>{t.maxVout}</th>
                                            <th>{t.maxPowerResult}</th>
                                            <th>{t.deviation}</th>
                                            <th>{t.worstCase}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topResults.map((item, index) => (
                                            <tr key={`${item.r1}-${item.r2}-${index}`}>
                                                <td>{index + 1}</td>
                                                <td>{formatResistorNotation(item.r1)}{getTypeLabel(item.r1) && <span className="resistor-type-badge">{getTypeLabel(item.r1)}</span>}</td>
                                                <td>{formatResistorNotation(item.r2)}{getTypeLabel(item.r2) && <span className="resistor-type-badge">{getTypeLabel(item.r2)}</span>}</td>
                                                <td>{formatVoltage(item.nominalVout)}</td>
                                                <td>{formatVoltage(item.minVout)}</td>
                                                <td>{formatVoltage(item.maxVout)}</td>
                                                <td>{formatPower(item.maxPower)}</td>
                                                <td>{formatVoltage(item.deviation)}</td>
                                                <td>{item.worstCaseOk ? t.yes : t.no}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
                )}

                {isListModalOpen && (
                    <div className="resistor-calculator__modal-backdrop" onClick={handleCloseListModal}>
                        <div className="resistor-calculator__modal" onClick={(e) => e.stopPropagation()}>
                            <h3>{t.editResistorList}</h3>

                            <div className="resistor-calculator__preset-selection">
                                <label className="resistor-calculator__preset-label">
                                    <input
                                        type="checkbox"
                                        checked={useSmd0805}
                                        onChange={(e) => {
                                            setUseSmd0805(e.target.checked);
                                            setResistorListError('');
                                        }}
                                    />
                                    {t.presetSmd0805}
                                </label>
                                <label className="resistor-calculator__preset-label">
                                    <input
                                        type="checkbox"
                                        checked={useThroughHole}
                                        onChange={(e) => {
                                            setUseThroughHole(e.target.checked);
                                            setResistorListError('');
                                        }}
                                    />
                                    {t.presetThroughHole}
                                </label>
                            </div>

                            <p className="resistor-calculator__list-help">{t.customResistorAdditions}</p>
                            <textarea
                                id="resistor-list-input"
                                value={customResistorText}
                                onChange={(e) => {
                                    setCustomResistorText(e.target.value);
                                    setResistorListError('');
                                }}
                                placeholder={t.resistorListPlaceholder}
                            />
                            <p className="resistor-calculator__list-help">{t.resistorListHelp}</p>
                            {resistorListError && <p className="resistor-calculator__list-error">{resistorListError}</p>}

                            <div className="resistor-calculator__list-actions">
                                <AnimatedButton color="green" onClick={handleApplyResistorList}>
                                    {t.applyResistorList}
                                </AnimatedButton>
                                <AnimatedButton color="gray" onClick={handleResetResistorList}>
                                    {t.resetResistorList}
                                </AnimatedButton>
                                <AnimatedButton color="red" onClick={handleCloseListModal}>
                                    {t.close}
                                </AnimatedButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResistorCalculator;
