import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Malaysia Macro Forecast — Open Source Economic Dashboard',
  description:
    'Crowdsourced macroeconomic forecasts for Malaysia. Live data from OpenDOSM, World Bank, and IMF. Track GDP, inflation, unemployment, and more.',
  openGraph: {
    title: 'Malaysia Macro Forecast',
    description: 'Open-source crowdsourced macroeconomic forecasts for Malaysia',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="grain-overlay" />
        {children}
      </body>
    </html>
  );
}
