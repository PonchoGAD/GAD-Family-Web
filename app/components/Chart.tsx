'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

/**
 * 🌌 AuroraDark Chart — общий компонент графика в стиле GAD
 * Props:
 *  - data: массив точек [{ x: string|number, y: number }]
 *  - color?: основной цвет линии
 *  - title?: заголовок над графиком
 */
export default function Chart({
  data,
  color = '#80FFD3', // mint glow по умолчанию
  title,
}: {
  data: { x: string | number; y: number }[];
  color?: string;
  title?: string;
}) {
  return (
    <div className="w-full min-h-[280px] bg-gradient-to-b from-[#0E0E12] via-[#14161B] to-[#1C2025] rounded-2xl p-4 shadow-[0_0_30px_rgba(128,255,211,0.05)] border border-[#1E222A]">
      {title && (
        <div className="text-lg font-semibold mb-2 text-[#D4AF37] tracking-wide">
          {title}
        </div>
      )}

      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="gradGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#2A2E37" opacity={0.3} />
            <XAxis
              dataKey="x"
              tick={{ fill: '#888', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#888', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#14161B',
                borderRadius: 10,
                border: '1px solid #2A2E37',
                color: '#fff',
              }}
              labelStyle={{ color: '#D4AF37' }}
            />
            <Line
              type="monotone"
              dataKey="y"
              stroke="url(#gradGlow)"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                stroke: color,
                strokeWidth: 2,
                fill: '#14161B',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
