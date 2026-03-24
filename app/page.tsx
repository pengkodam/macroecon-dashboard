'use client';

import { useState, useEffect } from 'react';
import {
  fetchAllIndicators,
  calculateConsensus,
  type IndicatorData,
  type IndicatorConfig,
  INDICATOR_CONFIGS,
} from '@/lib/data';
import ForecastTable from '@/components/ForecastTable';
import TimeSeriesChart from '@/components/TimeSeriesChart';

const CATEGORY_LABELS: Record<string, string> = {
  growth: 'Growth & Output',
  prices: 'Prices',
  fiscal: 'Fiscal',
  external: 'External',
  labour: 'Labour',
};

const CATEGORY_ORDER = ['growth', 'prices', 'labour', 'external', 'fiscal'];

const ICON_MAP: Record<string, string> = {
  gdp_growth: '📈',
  inflation: '🏷️',
  unemployment: '👷',
  current_account: '🌐',
  gov_debt: '🏦',
  fiscal_balance: '📊',
  gdp_nominal: '💰',
  gdp_per_capita: '🧑',
  population: '👥',
};

function formatVal(v: number, unit: string): string {
  if (unit.includes('USD Bn')) return `$${v.toFixed(0)}B`;
  if (unit.includes('USD')) return `$${v.toLocaleString()}`;
  if (unit.includes('Million')) return `${v.toFixed(1)}M`;
  if (unit.includes('%')) return `${v.toFixed(1)}%`;
  return v.toFixed(1);
}

export default function Dashboard() {
  const [indicators, setIndicators] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('gdp_growth');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchAllIndicators();
      setIndicators(data);
      setLastRefresh(new Date());
      setLoading(false);
    })();
  }, []);

  const selected = indicators.find((i) => i.config.id === selectedId);

  // Build the overview table data
  const overviewRows = indicators.map((ind) => {
    const lastActual = ind.historical.length > 0 ? ind.historical[ind.historical.length - 1] : null;
    const consensus = calculateConsensus(ind.forecasts);
    const est = consensus.find((c) => c.year.endsWith('e'));
    const fc1 = consensus.find((c) => c.year === '2026f');
    const fc2 = consensus.find((c) => c.year === '2027f');

    return { ind, lastActual, est, fc1, fc2 };
  });

  return (
    <main className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-sky/4 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-amethyst/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky to-amethyst flex items-center justify-center text-midnight font-display text-base font-bold">
                  MY
                </div>
                <h1 className="font-display text-2xl sm:text-3xl text-pearl leading-none">
                  Malaysia Forecast
                </h1>
              </div>
              <p className="text-xs text-mist font-body mt-2 max-w-xl leading-relaxed">
                Macroeconomic forecast comparison from{' '}
                <span className="text-gold">IMF</span>,{' '}
                <span className="text-sky">World Bank</span>,{' '}
                <span className="text-emerald">ADB</span>,{' '}
                <span className="text-amethyst">RAM Ratings</span> and more.
                All data from free, open sources. No scraping, no API keys.
              </p>
            </div>
            <div className="text-right shrink-0">
              {lastRefresh && (
                <span className="text-[9px] font-mono text-mist/50 block mb-1">
                  IMF data refreshed {lastRefresh.toLocaleTimeString()}
                </span>
              )}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-mist/40 hover:text-sky transition-colors"
              >
                Open Source ↗
              </a>
            </div>
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <div className="skeleton h-12 w-full" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        )}

        {!loading && indicators.length > 0 && (
          <>
            {/* ═══ OVERVIEW TABLE ═══ */}
            <div className="bg-ink/50 border border-slate/50 rounded-xl backdrop-blur-sm overflow-hidden mb-8 animate-fade-in animate-fade-in-delay-1">
              <div className="px-5 py-3 border-b border-slate/40 flex items-center justify-between">
                <h2 className="font-display text-base text-pearl">Forecast Overview</h2>
                <div className="flex items-center gap-3 text-[9px] font-mono text-mist/40">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                    <strong className="text-gold/70">e</strong> = estimate (partial year data)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amethyst inline-block" />
                    <strong className="text-amethyst/70">f</strong> = forecast (projection)
                  </span>
                  <span className="hidden sm:inline">· Consensus = mean of institutions</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate/40 bg-midnight/30">
                      <th className="text-left py-2.5 px-5 font-mono text-[9px] text-mist uppercase tracking-wider w-[200px]">
                        Indicator
                      </th>
                      <th className="text-right py-2.5 px-3 font-mono text-[9px] text-mist uppercase tracking-wider">
                        Last Actual
                      </th>
                      <th className="text-right py-2.5 px-3 font-mono text-[9px] text-gold uppercase tracking-wider">
                        2025e
                      </th>
                      <th className="text-right py-2.5 px-3 font-mono text-[9px] text-amethyst uppercase tracking-wider">
                        2026f
                      </th>
                      <th className="text-right py-2.5 px-3 font-mono text-[9px] text-amethyst/70 uppercase tracking-wider">
                        2027f
                      </th>
                      <th className="text-right py-2.5 px-3 font-mono text-[9px] text-mist uppercase tracking-wider w-[90px]">
                        Sources
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {overviewRows.map(({ ind, lastActual, est, fc1, fc2 }) => (
                      <tr
                        key={ind.config.id}
                        onClick={() => setSelectedId(ind.config.id)}
                        className={`border-b border-slate/15 cursor-pointer transition-all duration-150 ${
                          ind.config.id === selectedId
                            ? 'bg-sky/8'
                            : 'hover:bg-ink/80'
                        }`}
                      >
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{ICON_MAP[ind.config.id] || '📊'}</span>
                            <div>
                              <span className="text-xs font-body font-medium text-pearl block leading-tight">
                                {ind.config.name}
                              </span>
                              <span className="text-[9px] text-mist/50 font-mono">
                                {ind.config.unit}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-3">
                          {lastActual ? (
                            <div>
                              <span className="font-mono text-sm text-pearl">
                                {formatVal(lastActual.value, ind.config.unit)}
                              </span>
                              <span className="text-[8px] text-mist/40 font-mono block">
                                {lastActual.date}
                              </span>
                            </div>
                          ) : (
                            <span className="text-mist/30 font-mono text-xs">—</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-3">
                          {est ? (
                            <span className="font-mono text-sm text-gold">
                              {est.mean.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-mist/30 font-mono text-xs">—</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-3">
                          {fc1 ? (
                            <div>
                              <span className="font-mono text-sm font-semibold text-amethyst">
                                {fc1.mean.toFixed(1)}
                              </span>
                              {fc1.count > 1 && (
                                <span className="text-[8px] text-mist/40 font-mono block">
                                  {fc1.low.toFixed(1)}–{fc1.high.toFixed(1)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-mist/30 font-mono text-xs">—</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-3">
                          {fc2 ? (
                            <span className="font-mono text-sm text-amethyst/70">
                              {fc2.mean.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-mist/30 font-mono text-xs">—</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-3">
                          <span className="text-[9px] font-mono text-mist/50">
                            {ind.forecasts.length > 0
                              ? `${new Set(ind.forecasts.map((f) => f.source)).size}`
                              : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ═══ DETAIL PANEL ═══ */}
            {selected && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8 animate-fade-in animate-fade-in-delay-2">
                {/* Chart */}
                <div className="lg:col-span-3 bg-ink/50 border border-slate/50 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display text-lg text-pearl">
                        {selected.config.name}
                      </h3>
                      <p className="text-[10px] text-mist font-mono mt-0.5">
                        {selected.config.description} · {selected.config.unit}
                      </p>
                    </div>
                    {selected.historical.length > 0 && (
                      <div className="text-right">
                        <span className="font-mono text-xl font-semibold text-sky">
                          {formatVal(
                            selected.historical[selected.historical.length - 1].value,
                            selected.config.unit
                          )}
                        </span>
                        <span className="text-[9px] text-mist/50 font-mono block">
                          {selected.historical[selected.historical.length - 1].date} actual
                        </span>
                      </div>
                    )}
                  </div>

                  <TimeSeriesChart indicator={selected} />

                  {/* Legend */}
                  <div className="flex gap-5 mt-3 text-[10px] font-mono text-mist/60">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-[2px] bg-sky rounded" /> Actual
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-[2px] bg-gold rounded border-dashed" style={{ borderTop: '2px dashed #f59e0b', height: 0 }} /> IMF WEO
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amethyst rounded-full" /> Consensus
                    </span>
                  </div>
                </div>

                {/* Forecast Table */}
                <div className="lg:col-span-2 bg-ink/50 border border-slate/50 rounded-xl p-5 backdrop-blur-sm">
                  <h3 className="font-display text-base text-pearl mb-4">
                    Institutional Forecasts
                  </h3>
                  {selected.forecasts.length > 0 ? (
                    <ForecastTable
                      indicatorName={selected.config.name}
                      unit={selected.config.unit}
                      forecasts={selected.forecasts}
                    />
                  ) : (
                    <p className="text-xs text-mist/40 font-body">
                      No curated institutional forecasts yet. IMF WEO data shown in chart.
                    </p>
                  )}

                  {/* Source badges */}
                  {selected.forecasts.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate/30">
                      <p className="text-[9px] text-mist/40 font-mono uppercase tracking-wider mb-2">
                        Sources
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from(new Set(selected.forecasts.map((f) => f.source))).map(
                          (src) => {
                            const f = selected.forecasts.find((x) => x.source === src)!;
                            return (
                              <a
                                key={src}
                                href={f.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] font-mono text-mist/60 bg-slate/20 hover:bg-sky/10 hover:text-sky px-2 py-1 rounded transition-colors"
                              >
                                {src} · {f.updatedAt} ↗
                              </a>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ DATA SOURCES FOOTER ═══ */}
            <div className="bg-ink/30 border border-slate/30 rounded-xl p-5 animate-fade-in animate-fade-in-delay-3">
              <h3 className="font-display text-sm text-pearl mb-3">
                About This Dashboard
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-mist leading-relaxed">
                <div>
                  <span className="text-gold font-semibold">IMF WEO</span>
                  <p className="mt-1">
                    World Economic Outlook forecasts via the free DataMapper API.
                    Includes projections to ~2029. Updated semi-annually.
                  </p>
                </div>
                <div>
                  <span className="text-sky font-semibold">World Bank</span>
                  <p className="mt-1">
                    Macro Poverty Outlook country briefs. GDP, inflation,
                    unemployment, current account forecasts.
                  </p>
                </div>
                <div>
                  <span className="text-emerald font-semibold">ADB</span>
                  <p className="mt-1">
                    Asian Development Outlook — quarterly forecasts for
                    Southeast Asian economies including Malaysia.
                  </p>
                </div>
                <div>
                  <span className="text-amethyst font-semibold">RAM Ratings</span>
                  <p className="mt-1">
                    Malaysian credit rating agency quarterly economic
                    updates with GDP, fiscal, and debt projections.
                  </p>
                </div>
              </div>
              <p className="text-[9px] text-mist/30 font-mono mt-4 text-center">
                No scraping · No paywalled APIs · All data from official open publications ·
                Institutional forecasts curated manually from published reports
              </p>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-10 pt-4 border-t border-slate/20 text-center">
          <p className="text-[9px] font-mono text-mist/30 leading-relaxed">
            Malaysia Macro Forecast · Open Source · Not financial advice
            <br />
            IMF WEO API (free) · World Bank CC BY 4.0 · ADB Open Data · RAM Ratings Public Reports
          </p>
        </footer>
      </div>
    </main>
  );
}
