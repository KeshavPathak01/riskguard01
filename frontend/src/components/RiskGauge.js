
import React from 'react';

const W = 200;
const H = 130;     
const CX = 100;    
const CY = 115;    
const R = 75;      

function polarToXY(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + R * Math.cos(rad),
    y: CY - R * Math.sin(rad), 
  };
}

function describeArc(startAngle, endAngle) {
  const start = polarToXY(startAngle);
  const end   = polarToXY(endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function getRiskColor(score) {
  if (score >= 70) return '#f87171';
  if (score >= 40) return '#fbbf24';
  return '#34d399';
}

function getRiskLabel(score) {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

export default function RiskGauge({ score = 0 }) {
  const color = getRiskColor(score);
  const label = getRiskLabel(score);

  const scoreAngle = 180 - (score / 100) * 180;

  const needleRad = (scoreAngle * Math.PI) / 180;
  const needleLen = R * 0.7;
  const needleX = CX + needleLen * Math.cos(needleRad);
  const needleY = CY - needleLen * Math.sin(needleRad);

  const scoreArc = describeArc(180, scoreAngle);

  return (
    <div style={{ width: '100%', maxWidth: 200, margin: '0 auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', overflow: 'hidden' }}
      >
        {}
        <path
          d={describeArc(180, 0)}
          fill="none"
          stroke="#1e293b"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {}
        {score > 0 && (
          <path
            d={scoreArc}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${color}80)`,
              transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        )}

        {}
        <line
          x1={CX} y1={CY}
          x2={needleX} y2={needleY}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 4px ${color})`,
            transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />

        {}
        <circle
          cx={CX} cy={CY} r={4}
          fill={color}
          style={{ filter: `drop-shadow(0 0 5px ${color})` }}
        />

        {}
        <text
          x={CX} y={CY - 20}
          textAnchor="middle"
          fontSize="26"
          fontWeight="900"
          fill={color}
          fontFamily="Inter, system-ui, sans-serif"
          style={{ transition: 'fill 0.4s ease' }}
        >
          {score}
        </text>

        {}
        <text
          x={CX} y={CY - 4}
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          fill="#64748b"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {label} RISK
        </text>

        {}
        <text x={CX - R - 10} y={CY + 4} textAnchor="end" fontSize="9" fill="#475569" fontFamily="Inter, sans-serif">0</text>
        <text x={CX + R + 10} y={CY + 4} textAnchor="start" fontSize="9" fill="#475569" fontFamily="Inter, sans-serif">100</text>
        <text x={CX} y={CY - R - 10} textAnchor="middle" fontSize="9" fill="#475569" fontFamily="Inter, sans-serif">50</text>
      </svg>
    </div>
  );
}
