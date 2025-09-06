import { useLanguage } from '../../contexts/LanguageContext';
import translations from '../../Translation/Translations';
import './ThreadDiagram.scss';

function ThreadDiagram({ results }) {
    const { language } = useLanguage();

    if (!results) {
        return (
            <div className="thread-diagram">
                <div className="thread-diagram__placeholder">
                    <p>{translations[language].enterValuesToShowDiagram}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="thread-diagram">
            <h3 className="thread-diagram__title">
                {translations[language].threadProfile} - {results.threadDesignation}
            </h3>

            <div className="thread-diagram__container">
                <div className="thread-diagram__svg-container">
                    <svg
                        width="100%"
                        height="auto"
                        viewBox="0 0 708.66 566.93"
                        className="thread-diagram__svg"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Arrow marker definitions */}
                        <defs>
                            <marker
                                id="arrowStart"
                                orient="auto"
                                refY="0"
                                refX="0"
                                markerWidth="12"
                                markerHeight="8"
                                viewBox="-6 -4 12 8"
                                markerUnits="strokeWidth"
                            >
                                <path
                                    d="M 2,-2 L -4,0 L 2,2 Z"
                                    fill="#000000"
                                    stroke="#000000"
                                    strokeWidth="0.5"
                                />
                            </marker>
                            <marker
                                id="arrowEnd"
                                orient="auto"
                                refY="0"
                                refX="0"
                                markerWidth="12"
                                markerHeight="8"
                                viewBox="-6 -4 12 8"
                                markerUnits="strokeWidth"
                            >
                                <path
                                    d="M -2,-2 L 4,0 L -2,2 Z"
                                    fill="#000000"
                                    stroke="#000000"
                                    strokeWidth="0.5"
                                />
                            </marker>
                            <marker
                                id="arrowSmall"
                                orient="auto"
                                refY="0"
                                refX="0"
                                markerWidth="10"
                                markerHeight="6"
                                viewBox="-5 -3 10 6"
                                markerUnits="strokeWidth"
                            >
                                <path
                                    d="M -1.5,-1.5 L 3,0 L -1.5,1.5 Z"
                                    fill="#000000"
                                    stroke="#000000"
                                    strokeWidth="0.3"
                                />
                            </marker>
                            <marker
                                id="arrowSmallFlipped"
                                orient="auto"
                                refY="0"
                                refX="0"
                                markerWidth="10"
                                markerHeight="6"
                                viewBox="-5 -3 10 6"
                                markerUnits="strokeWidth"
                            >
                                <path
                                    d="M 1.5,-1.5 L -3,0 L 1.5,1.5 Z"
                                    fill="#000000"
                                    stroke="#000000"
                                    strokeWidth="0.3"
                                />
                            </marker>
                        </defs>

                        {/* Thread profile paths */}
                        <path
                            style={{
                                fill: 'none',
                                stroke: '#000000',
                                strokeWidth: 0.88,
                                strokeLinecap: 'square'
                            }}
                            d="M 141.73,255.33 L 213.04,378.51 L 354.77,133.03 L 496.51,378.51 L 566.93,255.33"
                        />
                        <path
                            style={{
                                fill: 'none',
                                stroke: '#000000',
                                strokeWidth: 5.31,
                                strokeLinecap: 'square'
                            }}
                            d="M 124.02,224.65 L 177.17,316.70 L 248.03,316.70 L 336.61,163.28 L 372.05,163.28 L 460.63,316.70 L 531.50,316.70 L 584.65,224.65"
                        />

                        {/* Dimension lines with arrows */}
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerStart: 'url(#arrowStart)',
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 219.62,55.02 L 488.91,55.02" 
                        />
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerStart: 'url(#arrowStart)',
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 343.64,102.77 L 364.90,102.77" 
                        />
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerStart: 'url(#arrowStart)',
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 290.55,301.36 L 418.11,301.36" 
                        />
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerStart: 'url(#arrowStart)',
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 467.72,408.76 L 524.41,408.76" 
                        />
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerStart: 'url(#arrowStart)',
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 602.36,169.41 L 602.36,249.19" 
                        />
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerStart: 'url(#arrowStart)',
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 637.80,138.73 L 637.80,157.14" 
                        />
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerStart: 'url(#arrowStart)',
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 637.80,169.41 L 637.80,310.56" 
                        />
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerStart: 'url(#arrowStart)',
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 637.80,322.84 L 637.80,371.93" 
                        />
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerStart: 'url(#arrowStart)',
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 673.23,138.73 L 673.23,371.93" 
                        />

                        {/* Vertical dimension lines for diameters */}
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 124.02,454.78 L 124.02,322.84" 
                        />
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 70.87,454.78 L 70.87,261.47" 
                        />
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerEnd: 'url(#arrowEnd)'
                            }} 
                            d="M 17.72,454.78 L 17.72,169.41" 
                        />

                        {/* Other dimension lines without arrows */}
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 63.78,255.33 L 609.45,255.33" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 644.88,163.28 L 10.63,163.28" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 347.24,132.59 L 680.31,132.59" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 496.06,316.70 L 644.88,316.70" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 488.98,378.07 L 680.31,378.07" />

                        {/* Vertical dimension lines */}
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 496.06,384.21 L 496.06,49.74" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 212.60,491.61 L 212.60,49.74" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 460.63,316.70 L 460.63,414.89" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 531.50,316.70 L 531.50,414.89" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 336.61,163.28 L 336.61,95.77" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 372.05,163.28 L 372.05,95.77" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 283.46,255.33 L 283.46,307.50" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 425.20,255.33 L 425.20,307.50" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 212.60,316.70 L 116.93,316.70" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 124.02,454.78 L 124.02,322.84" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 70.87,454.78 L 70.87,261.47" />
                        <path style={{ fill: 'none', stroke: '#000000', strokeWidth: 0.88 }} d="M 17.72,454.78 L 17.72,169.41" />

                        {/* Angle indicator curves */}
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerEnd: 'url(#arrowSmall)'
                            }} 
                            d="M 318.90,197.03 C 318.90,197.03 336.34,209.30 354.33,209.30 C 372.32,209.30 382.68,200.10 382.68,200.10" 
                        />
                        
                        {/* 30 degree angle indicator - force arrow with markerStart */}
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerStart: 'url(#arrowSmallFlipped)'
                            }} 
                            d="M 222.78,271.66 A 124.69,106.77 0 0 1 268.04,282.44" 
                        />
                        
                        {/* 90 degree angle indicator - arrow on correct side */}
                        <path 
                            style={{ 
                                fill: 'none', 
                                stroke: '#000000', 
                                strokeWidth: 0.88,
                                markerStart: 'url(#arrowSmallFlipped)'
                            }} 
                            d="M 221.31,440.09 A 53.06,45.97 0 0 1 265.66,485.75" 
                        />

                        {/* Axis line */}
                        <path
                            style={{
                                fill: 'none',
                                stroke: '#000000',
                                strokeWidth: 3.54,
                                strokeDasharray: '28.35 7.09 3.54 7.09'
                            }}
                            d="M 124.02,485.47 L 407.48,485.47"
                        />

                        {/* Static labels that don't change */}
                        <text x="355.72" y="95.14" textAnchor="middle" fontSize="14" fontFamily="Arial" className="calculated-value">
                            P/8 = {(results.pitch / 8).toFixed(3)} mm
                        </text>
                        <text x="353.81" y="294.60" textAnchor="middle" fontSize="14" fontFamily="Arial" className="calculated-value">
                            P/2 = {(results.pitch / 2).toFixed(3)} mm
                        </text>
                        <text x="353.89" y="225.59" textAnchor="middle" fontSize="16" fontFamily="Arial">60°</text>
                        <text x="497.43" y="426.97" textAnchor="middle" fontSize="14" fontFamily="Arial" className="calculated-value">
                            P/4 = {(results.pitch / 4).toFixed(3)} mm
                        </text>
                        <text x="690" y="255.33" textAnchor="middle" fontSize="14" fontFamily="Arial" className="calculated-value" 
                              transform="rotate(-90, 690, 255.33)">
                            H = {results.basicTriangleHeight.toFixed(3)} mm
                        </text>
                        {/* Thread height labels with calculated values */}
                        <text x="580" y="346.81" textAnchor="middle" fontSize="14" fontFamily="Arial" className="calculated-value">
                            H/4 = {(results.basicTriangleHeight / 4).toFixed(3)} mm
                        </text>
                        <text x="580" y="154.67" textAnchor="middle" fontSize="14" fontFamily="Arial" className="calculated-value">
                            H/8 = {results.threadHeight3.toFixed(3)} mm
                        </text>
                        <text x="653" y="240" textAnchor="middle" fontSize="14" fontFamily="Arial" className="calculated-value" 
                              transform="rotate(-90, 653, 240)">
                            5H/8 = {results.threadHeight.toFixed(3)} mm
                        </text>
                        <text x="543" y="197.03" textAnchor="middle" fontSize="14" fontFamily="Arial" className="calculated-value">
                            3H/8 = {(3 * results.basicTriangleHeight / 8).toFixed(3)} mm
                        </text>
                        
                        <text x="389.73" y="475.64" textAnchor="middle" fontSize="16" fontFamily="Arial">Axis of screw thread</text>
                        <text x="235.32" y="297.66" textAnchor="middle" fontSize="16" fontFamily="Arial">30°</text>
                        <text x="234.67" y="470.13" textAnchor="middle" fontSize="16" fontFamily="Arial">90°</text>

                        {/* Dynamic calculated values - vertical text next to dimension lines */}
                        <text x="354.88" y="49.74" textAnchor="middle" fontSize="16" fontFamily="Arial" className="calculated-value">
                            P = {results.pitch} mm
                        </text>
                        <text x="35" y="320" textAnchor="middle" fontSize="14" fontFamily="Arial" className="calculated-value" 
                              transform="rotate(-90, 35, 320)">
                            d = {results.externalMajorDiameter.toFixed(2)} mm
                        </text>
                        <text x="88" y="360" textAnchor="middle" fontSize="14" fontFamily="Arial" className="calculated-value" 
                              transform="rotate(-90, 88, 360)">
                            d₂ = {results.externalPitchDiameter.toFixed(2)} mm
                        </text>
                        <text x="141" y="390" textAnchor="middle" fontSize="14" fontFamily="Arial" className="calculated-value" 
                              transform="rotate(-90, 141, 390)">
                            d₁ = {results.externalMinorDiameter.toFixed(2)} mm
                        </text>
                    </svg>

                    {/* Additional calculated values display */}
                    <div className="thread-diagram__calculated-values">
                        <div className="calculated-values-grid">
                            <div className="value-pair">
                                <span className="value-label">{translations[language].majorDiameter}:</span>
                                <span className="value-number">d = {results.externalMajorDiameter.toFixed(2)} mm</span>
                            </div>
                            <div className="value-pair">
                                <span className="value-label">{translations[language].pitchDiameter}:</span>
                                <span className="value-number">d₂ = {results.externalPitchDiameter.toFixed(2)} mm</span>
                            </div>
                            <div className="value-pair">
                                <span className="value-label">{translations[language].minorDiameter}:</span>
                                <span className="value-number">d₁ = {results.externalMinorDiameter.toFixed(2)} mm</span>
                            </div>
                            <div className="value-pair">
                                <span className="value-label">{translations[language].pitch}:</span>
                                <span className="value-number">P = {results.pitch} mm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ThreadDiagram;
