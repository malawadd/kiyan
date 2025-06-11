import React from 'react';

interface PortfolioSnapshot {
  _id: string;
  totalValue: number;
  totalPnL: number;
  timestamp: number;
}

interface PortfolioChartProps {
  data: PortfolioSnapshot[];
}

export function PortfolioChart({ data }: PortfolioChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No performance data available
      </div>
    );
  }

  // Simple line chart using SVG
  const width = 800;
  const height = 200;
  const padding = 40;

  const minValue = Math.min(...data.map(d => d.totalValue));
  const maxValue = Math.max(...data.map(d => d.totalValue));
  const valueRange = maxValue - minValue || 1;

  const minTime = Math.min(...data.map(d => d.timestamp));
  const maxTime = Math.max(...data.map(d => d.timestamp));
  const timeRange = maxTime - minTime || 1;

  const points = data.map((d, i) => {
    const x = padding + ((d.timestamp - minTime) / timeRange) * (width - 2 * padding);
    const y = height - padding - ((d.totalValue - minValue) / valueRange) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const currentValue = data[data.length - 1]?.totalValue || 0;
  const previousValue = data[data.length - 2]?.totalValue || currentValue;
  const change = currentValue - previousValue;
  const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            ${currentValue.toLocaleString()}
          </p>
          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}${change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Last 30 days</p>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto">
        <svg width={width} height={height} className="w-full h-auto">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Chart line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={points}
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = padding + ((d.timestamp - minTime) / timeRange) * (width - 2 * padding);
            const y = height - padding - ((d.totalValue - minValue) / valueRange) * (height - 2 * padding);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
                className="hover:r-4 transition-all"
              />
            );
          })}
          
          {/* Y-axis labels */}
          <text x="10" y={padding} className="text-xs fill-gray-500">
            ${maxValue.toLocaleString()}
          </text>
          <text x="10" y={height - padding + 5} className="text-xs fill-gray-500">
            ${minValue.toLocaleString()}
          </text>
        </svg>
      </div>
    </div>
  );
}
