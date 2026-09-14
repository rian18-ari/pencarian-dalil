import type {Metadata} from 'next';
import { Amiri, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pencarian Dalil Cepat - Al-Qur’an & Hadis Terverifikasi',
  description: 'Aplikasi pencarian dalil Al-Qur\'an dan Hadis terverifikasi dengan teks Arab asli, terjemahan bahasa Indonesia, dan tautan sumber rujukan.',
  openGraph: {
    title: 'Pencarian Dalil Cepat - Al-Qur’an & Hadis Terverifikasi',
    description: 'Aplikasi pencarian dalil Al-Qur\'an dan Hadis terverifikasi dengan teks Arab asli, terjemahan bahasa Indonesia, dan tautan sumber rujukan.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pencarian Dalil Cepat',
    description: 'Pencarian dalil Al-Qur\'an dan Hadis terverifikasi dengan teks Arab asli dan terjemahan.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${amiri.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased bg-stone-50 text-stone-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}

