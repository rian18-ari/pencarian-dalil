'use client';

import React, { useState } from 'react';
import { DalilItem } from '@/lib/types';
import { BookOpen, ScrollText, ExternalLink, Copy, Check, Share2, Sparkles } from 'lucide-react';

interface DalilCardProps {
  item: DalilItem;
  arabicFontSize: 'normal' | 'large' | 'xlarge';
  onCopySuccess: (message: string) => void;
}

export function DalilCard({ item, arabicFontSize, onCopySuccess }: DalilCardProps) {
  const [copied, setCopied] = useState(false);

  const isQuran = item.sourceType === 'quran';

  const fontClass =
    arabicFontSize === 'xlarge'
      ? 'text-3xl sm:text-4xl leading-[2.6]'
      : arabicFontSize === 'large'
      ? 'text-2xl sm:text-3xl leading-[2.4]'
      : 'text-xl sm:text-2xl leading-[2.2]';

  const handleCopy = async () => {
    const textToCopy = `${item.reference} (${item.surahOrBookName} ${item.verseOrNumber})

${item.arabicText}

Artinya:
"${item.translationId}"

Penjelasan Relevansi:
${item.relevanceExplanation}

Sumber rujukan: ${item.sourceUrl}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopySuccess(`Dalil ${item.reference} berhasil disalin ke clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      onCopySuccess(`Dalil ${item.reference} berhasil disalin`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: item.reference,
      text: `${item.reference}\n\n${item.arabicText}\n\nArtinya:\n"${item.translationId}"\n\nSumber rujukan asli: ${item.sourceUrl}`,
      url: item.sourceUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed, fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <article
      id={`dalil-card-${item.id}`}
      className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200"
    >
      {/* Header bar */}
      <header className="px-5 py-3.5 bg-stone-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isQuran ? (
            <span
              id={`badge-source-${item.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Al-Qur’an
            </span>
          ) : (
            <span
              id={`badge-source-${item.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200"
            >
              <ScrollText className="w-3.5 h-3.5" />
              Hadis
            </span>
          )}

          <span className="text-xs font-medium text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded">
            {item.authenticityGrade}
          </span>
        </div>

        <div className="text-right">
          <h3 className="text-sm font-bold text-stone-900">
            {item.reference}
          </h3>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Arabic Text Block */}
        <div className="bg-stone-50/60 rounded-lg p-5 border border-stone-100 text-right">
          <p
            dir="rtl"
            lang="ar"
            className={`font-arabic text-stone-900 tracking-wide font-normal select-text ${fontClass}`}
          >
            {item.arabicText}
          </p>
        </div>

        {/* Translation Block */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-600">
            Terjemahan Bahasa Indonesia
          </p>
          <blockquote className="text-stone-800 text-base sm:text-lg leading-relaxed pl-3 border-l-2 border-emerald-600 italic">
            &ldquo;{item.translationId}&rdquo;
          </blockquote>
        </div>

        {/* Relevance Explanation */}
        <div className="bg-emerald-50/70 border border-emerald-100/90 rounded-lg p-3.5 text-sm text-emerald-950 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-emerald-900">Korelasi & Relevansi:</span>
            <p className="text-emerald-900 leading-snug">{item.relevanceExplanation}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <a
            id={`link-source-${item.id}`}
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
          >
            <span>Lihat sumber asli</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-1.5">
            <button
              id={`btn-copy-${item.id}`}
              onClick={handleCopy}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Salin dalil dan terjemahan"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Dalil</span>
                </>
              )}
            </button>

            <button
              id={`btn-share-${item.id}`}
              onClick={handleShare}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Bagikan dalil"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan</span>
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
}
