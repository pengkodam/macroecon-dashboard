// ─── Malaysia Macro Forecast Dashboard ──────────────────────────────
// Data sources: IMF WEO (forecast API), World Bank, ADB, BNM
// All free, open, no API keys required

export interface DataPoint {
  date: string;
  value: number;
}

export interface InstitutionalForecast {
  source: string;
  sourceUrl: string;
  year: string;
  value: number;
  updatedAt: string;
}

export interface IndicatorConfig {
  id: string;
  name: string;
  unit: string;
  description: string;
  category: 'growth' | 'prices' | 'fiscal' | 'external' | 'labour';
}

export interface IndicatorData {
  config: IndicatorConfig;
  historical: DataPoint[];
  forecasts: InstitutionalForecast[];
  imfForecast: DataPoint[];
  loading: boolean;
  error?: string;
}

// ─── Indicator Registry ─────────────────────────────────────────────

export const INDICATOR_CONFIGS: IndicatorConfig[] = [
  { id: 'gdp_growth', name: 'GDP Growth', unit: '% YoY', description: 'Real GDP growth rate', category: 'growth' },
  { id: 'inflation', name: 'Inflation (CPI)', unit: '% YoY', description: 'Consumer price inflation', category: 'prices' },
  { id: 'unemployment', name: 'Unemployment Rate', unit: '%', description: 'Labour force unemployment rate', category: 'labour' },
  { id: 'current_account', name: 'Current Account', unit: '% of GDP', description: 'Current account balance', category: 'external' },
  { id: 'gov_debt', name: 'Government Debt', unit: '% of GDP', description: 'General government gross debt', category: 'fiscal' },
  { id: 'fiscal_balance', name: 'Fiscal Balance', unit: '% of GDP', description: 'Government net lending/borrowing', category: 'fiscal' },
  { id: 'gdp_nominal', name: 'GDP (Nominal)', unit: 'USD Bn', description: 'Nominal GDP in current US dollars', category: 'growth' },
  { id: 'gdp_per_capita', name: 'GDP per Capita', unit: 'USD', description: 'GDP per capita, current prices', category: 'growth' },
  { id: 'population', name: 'Population', unit: 'Million', description: 'Total population', category: 'growth' },
];

// ─── IMF DataMapper API ─────────────────────────────────────────────
// Free, no key. Includes WEO forecasts out to ~2029.

const IMF_BASE = 'https://www.imf.org/external/datamapper/api/v1';

const IMF_MAP: Record<string, string> = {
  gdp_growth: 'NGDP_RPCH',
  inflation: 'PCPIPCH',
  unemployment: 'LUR',
  current_account: 'BCA_NGDPD',
  gov_debt: 'GGXWDG_NGDP',
  fiscal_balance: 'GGXCNL_NGDP',
  gdp_nominal: 'NGDPD',
  gdp_per_capita: 'NGDPDPC',
  population: 'LP',
};

export async function fetchIMFData(indicatorId: string): Promise<{
  historical: DataPoint[];
  forecast: DataPoint[];
}> {
  const code = IMF_MAP[indicatorId];
  if (!code) return { historical: [], forecast: [] };

  try {
    const res = await fetch(`${IMF_BASE}/${code}/MYS`);
    if (!res.ok) throw new Error(`IMF ${res.status}`);
    const json = await res.json();
    const values = json?.values?.[code]?.MYS || {};
    const currentYear = new Date().getFullYear();

    const all: DataPoint[] = Object.entries(values)
      .map(([year, val]) => ({ date: year, value: Number(val) }))
      .filter((d) => !isNaN(d.value))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      historical: all.filter((d) => Number(d.date) < currentYear),
      forecast: all.filter((d) => Number(d.date) >= currentYear),
    };
  } catch (e) {
    console.warn(`IMF fetch failed for ${indicatorId}:`, e);
    return { historical: [], forecast: [] };
  }
}

// ─── Curated Institutional Forecasts ────────────────────────────────
// Hand-curated from official publications. Update when new editions release.
// Sources:
//   IMF WEO January 2026 Update
//   World Bank Macro Poverty Outlook October 2025
//   ADB ADO September/December 2025
//   RAM Ratings Q4 2025
//   J.P. Morgan Asia Outlook December 2025

export function getInstitutionalForecasts(id: string): InstitutionalForecast[] {
  const db: Record<string, InstitutionalForecast[]> = {
    gdp_growth: [
      { source: 'IMF WEO', sourceUrl: 'https://www.imf.org/en/publications/weo', year: '2025e', value: 4.6, updatedAt: 'Jan 2026' },
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2025e', value: 4.1, updatedAt: 'Oct 2025' },
      { source: 'ADB', sourceUrl: 'https://www.adb.org/outlook/editions/december-2025', year: '2025e', value: 4.5, updatedAt: 'Dec 2025' },
      { source: 'RAM Ratings', sourceUrl: 'https://www.ram.com.my', year: '2025e', value: 4.8, updatedAt: 'Q4 2025' },
      { source: 'IMF WEO', sourceUrl: 'https://www.imf.org/en/publications/weo', year: '2026f', value: 4.3, updatedAt: 'Jan 2026' },
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2026f', value: 4.1, updatedAt: 'Oct 2025' },
      { source: 'ADB', sourceUrl: 'https://www.adb.org/outlook/editions/september-2025', year: '2026f', value: 4.2, updatedAt: 'Sep 2025' },
      { source: 'RAM Ratings', sourceUrl: 'https://www.ram.com.my', year: '2026f', value: 4.5, updatedAt: 'Q4 2025' },
      { source: 'J.P. Morgan', sourceUrl: 'https://privatebank.jpmorgan.com/apac/en/insights/markets-and-investing/asf/2026-asia-outlook', year: '2026f', value: 4.3, updatedAt: 'Dec 2025' },
      { source: 'IMF WEO', sourceUrl: 'https://www.imf.org/en/publications/weo', year: '2027f', value: 4.3, updatedAt: 'Jan 2026' },
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2027f', value: 4.0, updatedAt: 'Oct 2025' },
    ],
    inflation: [
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2025e', value: 2.5, updatedAt: 'Oct 2025' },
      { source: 'RAM Ratings', sourceUrl: 'https://www.ram.com.my', year: '2025e', value: 1.4, updatedAt: 'Q4 2025' },
      { source: 'ADB', sourceUrl: 'https://www.adb.org/outlook/editions/september-2025', year: '2025e', value: 2.0, updatedAt: 'Sep 2025' },
      { source: 'RAM Ratings', sourceUrl: 'https://www.ram.com.my', year: '2026f', value: 1.5, updatedAt: 'Q4 2025' },
      { source: 'ADB', sourceUrl: 'https://www.adb.org/outlook/editions/september-2025', year: '2026f', value: 2.4, updatedAt: 'Jul 2025' },
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2026f', value: 2.3, updatedAt: 'Oct 2025' },
    ],
    unemployment: [
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2025e', value: 3.3, updatedAt: 'Oct 2025' },
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2026f', value: 3.2, updatedAt: 'Oct 2025' },
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2027f', value: 3.2, updatedAt: 'Oct 2025' },
    ],
    current_account: [
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2025e', value: 2.4, updatedAt: 'Oct 2025' },
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2026f', value: 2.3, updatedAt: 'Oct 2025' },
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2027f', value: 2.1, updatedAt: 'Oct 2025' },
    ],
    gov_debt: [
      { source: 'RAM Ratings', sourceUrl: 'https://www.ram.com.my', year: '2025e', value: 65.7, updatedAt: 'Q4 2025' },
      { source: 'RAM Ratings', sourceUrl: 'https://www.ram.com.my', year: '2026f', value: 65.7, updatedAt: 'Q4 2025' },
    ],
    fiscal_balance: [
      { source: 'RAM Ratings', sourceUrl: 'https://www.ram.com.my', year: '2025e', value: -3.8, updatedAt: 'Q4 2025' },
      { source: 'RAM Ratings', sourceUrl: 'https://www.ram.com.my', year: '2026f', value: -3.5, updatedAt: 'Q4 2025' },
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2025e', value: -4.3, updatedAt: 'Oct 2025' },
      { source: 'World Bank', sourceUrl: 'https://thedocs.worldbank.org/en/doc/c6aceb75bed03729ef4ff9404dd7f125-0500012021/related/mpo-mys.pdf', year: '2026f', value: -4.0, updatedAt: 'Oct 2025' },
    ],
  };
  return db[id] || [];
}

// ─── Consensus Calculation ──────────────────────────────────────────

export interface ConsensusForecast {
  year: string;
  mean: number;
  high: number;
  low: number;
  count: number;
  sources: { source: string; value: number }[];
}

export function calculateConsensus(forecasts: InstitutionalForecast[]): ConsensusForecast[] {
  const byYear = new Map<string, InstitutionalForecast[]>();
  forecasts.forEach((f) => {
    const g = byYear.get(f.year) || [];
    g.push(f);
    byYear.set(f.year, g);
  });

  return Array.from(byYear.entries())
    .map(([year, items]) => {
      const vals = items.map((i) => i.value);
      return {
        year,
        mean: Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)),
        high: Math.max(...vals),
        low: Math.min(...vals),
        count: vals.length,
        sources: items.map((i) => ({ source: i.source, value: i.value })),
      };
    })
    .sort((a, b) => a.year.localeCompare(b.year));
}

// ─── Fetch Full Indicator ───────────────────────────────────────────

export async function fetchIndicator(config: IndicatorConfig): Promise<IndicatorData> {
  try {
    const imf = await fetchIMFData(config.id);
    return {
      config,
      historical: imf.historical,
      imfForecast: imf.forecast,
      forecasts: getInstitutionalForecasts(config.id),
      loading: false,
    };
  } catch (e) {
    return {
      config,
      historical: [],
      imfForecast: [],
      forecasts: getInstitutionalForecasts(config.id),
      loading: false,
      error: String(e),
    };
  }
}

export async function fetchAllIndicators(): Promise<IndicatorData[]> {
  const results = await Promise.allSettled(INDICATOR_CONFIGS.map((c) => fetchIndicator(c)));
  return results
    .filter((r): r is PromiseFulfilledResult<IndicatorData> => r.status === 'fulfilled')
    .map((r) => r.value);
}
