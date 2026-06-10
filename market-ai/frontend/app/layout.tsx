import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Market AI — منصة مراقبة أسعار المواد الخام',
  description: 'منصة ذكاء اصطناعي لمراقبة وتوقع أسعار مواد الغزل والنسيج في مصر',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
