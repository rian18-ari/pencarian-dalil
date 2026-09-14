'use client';

import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ScrollText, Layers, RefreshCw, AlertCircle, Sparkles, X, SlidersHorizontal, BookMarked } from 'lucide-react';
import { DalilItem, SearchResponse, SourceFilter } from '@/lib/types';
import { DalilCard } from '@/components/DalilCard';
import { PrincipleBanner } from '@/components/PrincipleBanner';
import { Toast } from '@/components/Toast';

const SUGGESTIONS = [
  'Ayat tentang Sabar',
  'Dalil tentang Zakat',
  'Hadis tentang Menuntut Ilmu',
  'Birrul Walidain (Berbakti Orang Tua)',
  'Sholat Khusyuk',
  'Keutamaan Sedekah',
  'Kejujuran & Amanah',
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SourceFilter>('all');
  const [arabicFontSize, setArabicFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  // Search execution state
  const [loading, setLoading] = useState(false);
  const [understoodIntent, setUnderstoodIntent] = useState<string | null>(null);
  const [results, setResults] = useState<DalilItem[]>([]);
  const [unverifiedMessage, setUnverifiedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearch = async (overrideQuery?: string, overrideFilter?: SourceFilter) => {
    const q = (overrideQuery !== undefined ? overrideQuery : query).trim();
    const f = overrideFilter !== undefined ? overrideFilter : activeFilter;

    if (!q) return;

    setLoading(true);
    setError(null);
    setUnverifiedMessage(null);
    setHasSearched(true);

    try {
      const res = await fetch('/api/dalil/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, filter: f }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal mencari dalil.');
      }

      const data: SearchResponse = await res.json();
      setUnderstoodIntent(data.understoodIntent || null);
      setResults(data.results || []);
      setUnverifiedMessage(data.unverifiedMessage || null);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kendala saat menghubungi server.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter: SourceFilter) => {
    setActiveFilter(filter);
    if (hasSearched && query.trim()) {
      handleSearch(query, filter);
    }
  };

  const handleSuggestionClick = (topic: string) => {
    setQuery(topic);
    handleSearch(topic, activeFilter);
  };

  const filteredResults = results.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.sourceType === activeFilter;
  });

  const quranCount = results.filter((r) => r.sourceType === 'quran').length;
  const haditsCount = results.filter((r) => r.sourceType === 'hadits').length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Top Navigation / App Bar */}
      <header
        id="app-header"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-none">
                Pencarian Dalil Cepat
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Al-Qur’an & Hadis Terverifikasi
              </p>
            </div>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs">
            <span className="text-stone-500 px-1.5 hidden sm:inline">Teks Arab:</span>
            <button
              type="button"
              id="btn-font-normal"
              onClick={() => setArabicFontSize('normal')}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                arabicFontSize === 'normal'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Ukuran font Arab sedang"
            >
              A
            </button>
            <button
              type="button"
              id="btn-font-large"
              onClick={() => setArabicFontSize('large')}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                arabicFontSize === 'large'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Ukuran font Arab besar"
            >
              A+
            </button>
            <button
              type="button"
              id="btn-font-xlarge"
              onClick={() => setArabicFontSize('xlarge')}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                arabicFontSize === 'xlarge'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Ukuran font Arab ekstra besar"
            >
              A++
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Principle Banner */}
        <PrincipleBanner />

        {/* Search Box */}
        <section id="search-section" className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <form
            id="search-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative flex items-center"
          >
            <div className="absolute left-3.5 text-stone-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>

            <input
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik topik atau pertanyaan (contoh: dalil tentang zakat, ayat sabar)..."
              className="w-full pl-11 pr-24 py-3 sm:py-3.5 text-stone-900 text-sm sm:text-base bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl outline-hidden transition-all placeholder:text-stone-400"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {query && (
                <button
                  type="button"
                  id="btn-clear-search"
                  onClick={() => setQuery('')}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                id="btn-submit-search"
                disabled={loading || !query.trim()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Cari</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Contoh Topik Populer:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleSuggestionClick(topic)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-stone-700 text-xs rounded-lg border border-stone-200 transition-colors cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Search Results Area */}
        {hasSearched && (
          <section id="results-section" className="space-y-4">
            {/* Filter Tabs & Intent Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 border border-stone-200 rounded-xl">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  id="filter-all"
                  onClick={() => handleFilterChange('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Semua</span>
                  {results.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                      {results.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  id="filter-quran"
                  onClick={() => handleFilterChange('quran')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeFilter === 'quran'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Al-Qur’an</span>
                  {hasSearched && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-800">
                      {quranCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  id="filter-hadits"
                  onClick={() => handleFilterChange('hadits')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeFilter === 'hadits'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <ScrollText className="w-3.5 h-3.5" />
                  <span>Hadis</span>
                  {hasSearched && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-800">
                      {haditsCount}
                    </span>
                  )}
                </button>
              </div>

              {understoodIntent && !loading && (
                <div className="text-xs text-stone-500 italic truncate sm:text-right">
                  Maksud: <span className="text-stone-800 font-medium">{understoodIntent}</span>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div id="loading-state" className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-sm animate-pulse">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-700 shrink-0" />
                  <div>
                    <p className="font-semibold">Meneliti rujukan dalil terverifikasi...</p>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Memastikan ketepatan teks ayat Al-Qur&apos;an dan keabsahan sanad/kitab hadis mu&apos;tabar.
                    </p>
                  </div>
                </div>

                {/* Skeletons */}
                {[1, 2].map((n) => (
                  <div key={n} className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 animate-pulse">
                    <div className="h-5 bg-stone-200 rounded w-1/3"></div>
                    <div className="h-16 bg-stone-100 rounded-lg"></div>
                    <div className="h-4 bg-stone-200 rounded w-4/5"></div>
                    <div className="h-4 bg-stone-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div id="error-state" className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-900 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold">Terjadi Kendala</h2>
                    <p className="text-xs text-red-800 leading-relaxed">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-retry"
                  onClick={() => handleSearch()}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Unverified / Empty Result State */}
            {!loading && !error && (unverifiedMessage || filteredResults.length === 0) && (
              <div
                id="unverified-state"
                className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-6 sm:p-8 text-center space-y-3"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                  <AlertCircle className="w-6 h-6" />
                </div>

                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h2 className="text-base font-bold text-amber-950">
                    {unverifiedMessage || 'Sumber dalil tidak dapat diverifikasi, sehingga tidak ditampilkan.'}
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                    Sesuai kaidah amanah ilmiah, aplikasi kami menolak membuat-buat atau menyajikan ayat/hadis yang tidak memiliki rujukan shahih dari mushaf standar atau kitab mu&apos;tabar.
                  </p>
                </div>

                <div className="pt-3">
                  <p className="text-xs text-stone-600 mb-2 font-medium">Coba gunakan kata kunci topik umum seperti:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.slice(0, 4).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-md text-xs transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dalil Result Cards */}
            {!loading && !error && filteredResults.length > 0 && (
              <div id="dalil-list" className="space-y-4">
                {filteredResults.map((item) => (
                  <DalilCard
                    key={item.id}
                    item={item}
                    arabicFontSize={arabicFontSize}
                    onCopySuccess={showToast}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Empty State before search */}
        {!hasSearched && (
          <section id="initial-guide" className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900">
                Pencarian Dalil Cepat & Terpercaya
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Temukan ayat Al-Qur’an dan hadis nabi berdasarkan topik pembahasan, masalah fiqih harian, akhlak, maupun pertanyaan kontekstual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                <div className="font-semibold text-sm text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">1</span>
                  Ketik Topik Bebas
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Masukkan pertanyaan alami seperti <em>&ldquo;ayat tentang sabar&rdquo;</em>, <em>&ldquo;hadis tentang menuntut ilmu&rdquo;</em>, atau <em>&ldquo;hukum zakat&rdquo;</em>.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                <div className="font-semibold text-sm text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">2</span>
                  Kaidah Amanah Ilmiah
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Semua dalil diverifikasi dari rujukan resmi Al-Qur&apos;an dan Kitab Hadits Mu&apos;tabar. AI dilarang mengarang dalil.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                <div className="font-semibold text-sm text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">3</span>
                  Salin & Verifikasi
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Tersedia teks Arab berharakat, terjemahan Indonesia, penjelasan korelasi, dan tombol verifikasi sumber asli.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-medium text-stone-700">
            Pencarian Dalil Cepat • Al-Qur’an & Hadis Terverifikasi
          </p>
          <p className="text-stone-400">
            Dirancang untuk ustadz, guru, santri, siswa, dan kaum muslimin. Bersumber dari rujukan mu&apos;tabar.
          </p>
        </div>
      </footer>
    </div>
  );
}
