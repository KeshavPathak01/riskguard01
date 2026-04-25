// src/components/RiskGauge.js
import React from 'react';

/**
 * SVG Semicircular Gauge — displays a 0-100 risk score.
 * The arc opens UPWARD (like a speedometer).
 * viewBox is padded to contain the full arc + labels without overflow.
 */

// --- Coordinate constants ---
const W = 200;
const H = 130;     // enough vertical space for the top arc + labels below
const CX = 100;    // center x
const CY = 115;    // center y — pushed down so the arc curves upward
const R = 75;      // radius — slightly smaller to fit with padding

function polarToXY(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + R * Math.cos(rad),
    y: CY - R * Math.sin(rad), // minus because SVG Y is inverted
  };
}

function describeArc(startAngle, endAngle) {
  const start = polarToXY(startAngle);
  const end   = polarToXY(endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  // Sweep flag 1 = clockwise. From 180 (left) to 0 (right), clockwise draws the top half.
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

  // Score goes from 0 (left = 180 deg) to 100 (right = 0 deg)
  const scoreAngle = 180 - (score / 100) * 180;

  // Needle
  const needleRad = (scoreAngle * Math.PI) / 180;
  const needleLen = R * 0.7;
  const needleX = CX + needleLen * Math.cos(needleRad);
  const needleY = CY - needleLen * Math.sin(needleRad);

  // Arc endpoints for score fill (starts at 180/left, sweeps clockwise to scoreAngle)
  const scoreArc = describeArc(180, scoreAngle);

  return (
    <div style={{ width: '100%', maxWidth: 200, margin: '0 auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', overflow: 'hidden' }}
      >
        {/* Track arc (full semicircle 180°→0°) */}
        <path
          d={describeArc(180, 0)}
          fill="none"
          stroke="#1e293b"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Score fill arc */}
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

        {/* Needle */}
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

        {/* Center dot */}
        <circle
          cx={CX} cy={CY} r={4}
          fill={color}
          style={{ filter: `drop-shadow(0 0 5px ${color})` }}
        />

        {/* Score number */}
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

        {/* Label */}
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

        {/* Scale labels: 0 on left, 50 at top, 100 on right */}
        <text x={CX - R - 10} y={CY + 4} textAnchor="end" fontSize="9" fill="#475569" fontFamily="Inter, sans-serif">0</text>
        <text x={CX + R + 10} y={CY + 4} textAnchor="start" fontSize="9" fill="#475569" fontFamily="Inter, sans-serif">100</text>
        <text x={CX} y={CY - R - 10} textAnchor="middle" fontSize="9" fill="#475569" fontFamily="Inter, sans-serif">50</text>
      </svg>
    </div>
  );
}
