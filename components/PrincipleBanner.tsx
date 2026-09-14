'use client';

import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp } from 'lucide-react';

export function PrincipleBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      id="principle-banner"
      className="bg-stone-100/90 border border-stone-200/80 rounded-xl p-4 text-xs sm:text-sm text-stone-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="font-semibold text-stone-900">
            Prinsip Amanah Ilmiah: AI Dilarang Mengarang atau Memodifikasi Dalil
          </span>
        </div>
        <button
          id="btn-toggle-principle"
          onClick={() => setExpanded(!expanded)}
          type="button"
          className="text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 text-xs shrink-0 cursor-pointer"
        >
          <span>{expanded ? 'Tutup' : 'Pelajari'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-stone-200 space-y-2 text-stone-600 leading-relaxed">
          <p>
            Aplikasi ini menjunjung tinggi kehati-hatian dalam syariat Islam:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>AI bukan sumber dalil:</strong> AI hanya bertugas memahami topik pertanyaan dan mencarikan rujukan mushaf Al-Qur&apos;an dan hadis mu&apos;tabar.
            </li>
            <li>
              <strong>Wajib Terverifikasi:</strong> Setiap hasil dilengkapi nama surah, nomor ayat, atau perawi hadis dengan tautan langsung ke naskah asli (Quran.com & Sunnah.com).
            </li>
            <li>
              <strong>Pemberitahuan Transparan:</strong> Apabila suatu pertanyaan tidak memiliki rujukan dalil yang sahih atau terverifikasi, aplikasi secara tegas menampilkan <em>“Sumber dalil tidak dapat diverifikasi, sehingga tidak ditampilkan.”</em>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
