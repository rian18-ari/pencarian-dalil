export type SourceFilter = 'all' | 'quran' | 'hadits';

export interface DalilItem {
  id: string;
  sourceType: 'quran' | 'hadits';
  reference: string; // e.g., "QS. Al-Baqarah [2]: 153" atau "HR. Bukhari no. 1"
  surahOrBookName: string; // e.g., "Surah Al-Baqarah" atau "Shahih Bukhari"
  verseOrNumber: string; // e.g., "Ayat 153" atau "Nomor 1"
  arabicText: string;
  translationId: string;
  relevanceExplanation: string;
  sourceUrl: string;
  authenticityGrade: string; // e.g., "Mutawatir (Kalamullah)" atau "Shahih (HR. Bukhari)"
  verified: boolean;
  topicKeywords?: string[];
}

export interface SearchResponse {
  query: string;
  understoodIntent: string;
  results: DalilItem[];
  unverifiedMessage?: string;
  totalFound: number;
}
