import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MySQL ITS Reviewer',
  description: 'ITS Database exam reviewer for USER SCHOOL',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
