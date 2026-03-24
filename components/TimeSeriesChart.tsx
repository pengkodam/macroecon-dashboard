'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Line,
} from 'recharts';
import type { IndicatorData } from '@/lib/data';
import { calculateConsensus } from '@/lib/data';

interface TimeSeriesChartProps {
  indicator: IndicatorData;
  height?: number;
}

export default function TimeSeriesChart({ indicator, height = 300 }: TimeSeriesChartProps) {
  const { historical, imfForecast, forecasts, config } = indicator;

  // Build chart data: historical + IMF forecast + consensus dots
  const consensus = calculateConsensus(forecasts);

  // Merge all data by year
  const merged = new Map<string, any>();

  historical.forEach((d) => {
    merged.set(d.date, { ...merged.get(d.date), date: d.date, actual: d.value });
  });

  imfForecast.forEach((d) => {
    merged.set(d.date, { ...merged.get(d.date), date: d.date, imf: d.value });
  });

  consensus.forEach((c) => {
    const yr = c.year.replace(/[ef]$/, '');
    merged.set(yr, {
      ...merged.get(yr),
      date: yr,
      consensus: c.mean,
      consensus_high: c.high,
      consensus_low: c.low,
    });
  });

  const chartData = Array.from(merged.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-20); // Last 20 years

  const hasNegative = chartData.some(
    (d) => (d.actual ?? 0) < 0 || (d.imf ?? 0) < 0 || (d.consensus ?? 0) < 0
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id={`g-hist-${config.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`g-imf-${config.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          axisLine={{ stroke: '#1e293b' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            background: '#141b2d',
            border: '1px solid #1e293b',
            borderRadius: 8,
            fontFamily: 'IBM Plex Mono',
            fontSize: 11,
          }}
          labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
          formatter={(val: number, name: string) => {
            const labels: Record<string, string> = {
              actual: 'Actual',
              imf: 'IMF WEO',
              consensus: 'Consensus',
            };
            return [`${val.toFixed(1)} ${config.unit}`, labels[name] || name];
          }}
        />
        {hasNegative && <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />}

        {/* Historical */}
        <Area
          type="monotone"
          dataKey="actual"
          stroke="#38bdf8"
          strokeWidth={2.5}
          fill={`url(#g-hist-${config.id})`}
          dot={false}
          connectNulls
        />

        {/* IMF Forecast */}
        <Area
          type="monotone"
          dataKey="imf"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="6 3"
          fill={`url(#g-imf-${config.id})`}
          dot={{ fill: '#f59e0b', r: 3 }}
          connectNulls
        />

        {/* Consensus mean */}
        <Line
          type="monotone"
          dataKey="consensus"
          stroke="#a78bfa"
          strokeWidth={0}
          dot={{ fill: '#a78bfa', r: 5, strokeWidth: 2, stroke: '#141b2d' }}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
