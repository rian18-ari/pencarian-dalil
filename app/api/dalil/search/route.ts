import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { DalilItem, SearchResponse } from "@/lib/types";
import { findLocalVerifiedDalil } from "@/lib/dalil-database";

const FALLBACK_MODELS = [
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
];

const SYSTEM_PROMPT = `Anda adalah asisten khusus pencarian dalil Islam ("Pencarian Dalil Cepat").
Tugas Anda adalah memahami maksud pencarian pengguna dan menyajikan dalil Al-Qur'an dan Hadis yang 100% otentik, akurat, dan dapat diverifikasi.

=== ATURAN PALING KETAT & MUTLAK ===
1. ANDA DILARANG MENGARANG, MEMODIFIKASI, MEMENGGAL SECARA SALAH, ATAU MEMBUAT SENDIRI ayat Al-Qur’an maupun hadis.
2. Semua dalil WAJIB berasal dari sumber yang otentik dan dapat diverifikasi secara ilmiah Islam.
   - Al-Qur'an: Rujukan Mushaf standar (nama surah nomor 1-114, nomor ayat valid). Teks Arab lengkap berharakat, terjemahan baku bahasa Indonesia (Kemenag RI). Tautan sumber asli ke https://quran.com/{surah_number}/{ayah_number}.
   - Hadits: Hanya dari kutubus sittah / kutubut tis'ah / riyadhus shalihin / arba'in nawawi yang mu'tabar (Bukhari, Muslim, Abu Dawud, Tirmidzi, Nasa'i, Ibnu Majah, Ahmad, dll.) dengan nomor hadis spesifik. Teks Arab asli, terjemahan Indonesia, dan tautan rujukan sunnah.com (misal https://sunnah.com/bukhari:1395).
3. JANGAN PERNAH menyatakan sebuah hadis shahih/hasan/daif kecuali status tersebut memang dapat diverifikasi dari sumber kredibel. Sebutkan perawinya dengan jelas (misal: "HR. Bukhari no. 1395", "HR. Muslim no. 2699", "Shahih (Muttafaq 'Alaih)").
4. Jika topik pencarian tidak memiliki dalil yang shahih/terverifikasi, atau pengguna mencari hal khayalan/palsu, JANGAN REKAYASA DALIL. Tetapkan verifiedFound = false, dan beri pesan: "Sumber dalil tidak dapat diverifikasi, sehingga tidak ditampilkan."
5. Hindari hasil duplikat. Sajikan 3 hingga 6 dalil paling relevan dan berbobot.
6. Berikan penjelasan singkat dan padat mengenai korelasi/relevansi dalil tersebut dengan topik yang dicari pengguna.
7. Patuhi filter sumber yang diminta pengguna:
   - Jika filter "quran", HANYA tampilkan ayat Al-Qur'an.
   - Jika filter "hadits", HANYA tampilkan Hadis mu'tabar.
   - Jika filter "all", tampilkan kombinasi seimbang Al-Qur'an dan Hadis.`;

interface GeminiParsedOutput {
  understoodIntent: string;
  verifiedFound: boolean;
  unverifiedMessage?: string;
  results: DalilItem[];
}

export async function POST(req: NextRequest) {
  let query = "";
  let filter: "all" | "quran" | "hadits" = "all";

  try {
    const body = await req.json();
    query = (body.query || "").trim();
    filter = body.filter || "all";
  } catch {
    return NextResponse.json(
      { error: "Format permintaan tidak valid." },
      { status: 400 }
    );
  }

  if (!query) {
    return NextResponse.json(
      { error: "Kata kunci atau topik pencarian tidak boleh kosong." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key is set, use local verified database directly
  if (!apiKey) {
    const localMatches = findLocalVerifiedDalil(query, filter);
    if (localMatches.length > 0) {
      return NextResponse.json({
        query,
        understoodIntent: `Menampilkan dalil terverifikasi untuk "${query}"`,
        results: localMatches,
        totalFound: localMatches.length,
      } satisfies SearchResponse);
    }

    return NextResponse.json({
      query,
      understoodIntent: `Pencarian dalil untuk topik "${query}"`,
      results: [],
      unverifiedMessage: "Sumber dalil tidak dapat diverifikasi, sehingga tidak ditampilkan.",
      totalFound: 0,
    } satisfies SearchResponse);
  }

  // Initialize Gemini SDK with telemetry header
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const userPromptText = `Cari dalil relevan untuk query: "${query}"
Filter sumber yang diminta: "${filter}".
Kembalikan dalil dalam format JSON terstruktur sesuai skema.`;

  let lastAiError: unknown = null;
  let parsedOutput: GeminiParsedOutput | null = null;

  // Attempt generation across available models with fallback
  for (const modelName of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPromptText,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              understoodIntent: {
                type: Type.STRING,
                description: "Ringkasan pemahaman AI terhadap topik/pertanyaan pengguna dalam bahasa Indonesia yang santun.",
              },
              verifiedFound: {
                type: Type.BOOLEAN,
                description: "True jika ada dalil shahih/terverifikasi yang ditemukan; False jika sumber dalil tidak dapat diverifikasi.",
              },
              unverifiedMessage: {
                type: Type.STRING,
                description: 'Jika verifiedFound false, isi dengan: "Sumber dalil tidak dapat diverifikasi, sehingga tidak ditampilkan."',
              },
              results: {
                type: Type.ARRAY,
                description: "Daftar dalil Al-Qur'an atau Hadis yang terverifikasi.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    sourceType: {
                      type: Type.STRING,
                      description: "Hanya bernilai 'quran' atau 'hadits'",
                    },
                    reference: {
                      type: Type.STRING,
                      description: "Format rujukan resmi, contoh: 'QS. Al-Baqarah [2]: 153' atau 'HR. Bukhari no. 1395'",
                    },
                    surahOrBookName: {
                      type: Type.STRING,
                      description: "Nama surah (contoh 'Al-Baqarah') atau nama kitab (contoh 'Shahih Al-Bukhari')",
                    },
                    verseOrNumber: {
                      type: Type.STRING,
                      description: "Nomor ayat (contoh 'Ayat 153') atau nomor hadis (contoh 'Hadis no. 1395')",
                    },
                    arabicText: {
                      type: Type.STRING,
                      description: "Teks Arab asli yang akurat berharakat lengkap",
                    },
                    translationId: {
                      type: Type.STRING,
                      description: "Terjemahan bahasa Indonesia resmi dan akurat",
                    },
                    relevanceExplanation: {
                      type: Type.STRING,
                      description: "Penjelasan ringkas bagaimana dalil ini menjawab topik pencarian",
                    },
                    sourceUrl: {
                      type: Type.STRING,
                      description: "URL verifikasi sumber asli (quran.com atau sunnah.com)",
                    },
                    authenticityGrade: {
                      type: Type.STRING,
                      description: "Status keotentikan, contoh: 'Mutawatir (Al-Qur’an Al-Karim)' atau 'Shahih (HR. Bukhari)'",
                    },
                    verified: {
                      type: Type.BOOLEAN,
                      description: "Harus true jika telah diverifikasi",
                    },
                  },
                  required: [
                    "id",
                    "sourceType",
                    "reference",
                    "surahOrBookName",
                    "verseOrNumber",
                    "arabicText",
                    "translationId",
                    "relevanceExplanation",
                    "sourceUrl",
                    "authenticityGrade",
                    "verified",
                  ],
                },
              },
            },
            required: ["understoodIntent", "verifiedFound", "results"],
          },
        },
      });

      let rawText = response.text?.trim() || "";
      if (rawText.startsWith("```json")) {
        rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      if (rawText) {
        parsedOutput = JSON.parse(rawText);
        // Successful response received
        break;
      }
    } catch (err: unknown) {
      console.warn(`Model ${modelName} encountered error, trying next fallback if available:`, err);
      lastAiError = err;
    }
  }

  // If AI produced valid parsed output
  if (parsedOutput) {
    if (parsedOutput.verifiedFound && parsedOutput.results && parsedOutput.results.length > 0) {
      let sanitizedResults = parsedOutput.results.filter(
        item => item.verified && item.arabicText && item.translationId
      );

      if (filter !== "all") {
        sanitizedResults = sanitizedResults.filter(item => item.sourceType === filter);
      }

      // Deduplicate
      const seen = new Set<string>();
      sanitizedResults = sanitizedResults.filter(item => {
        const key = `${item.sourceType}-${item.reference}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (sanitizedResults.length > 0) {
        return NextResponse.json({
          query,
          understoodIntent: parsedOutput.understoodIntent,
          results: sanitizedResults,
          totalFound: sanitizedResults.length,
        } satisfies SearchResponse);
      }
    }

    // AI explicitly said unverified or no results matched
    // Check if local database has verified dalil for this query
    const localMatches = findLocalVerifiedDalil(query, filter);
    if (localMatches.length > 0) {
      return NextResponse.json({
        query,
        understoodIntent: parsedOutput.understoodIntent || `Menampilkan dalil terverifikasi untuk "${query}"`,
        results: localMatches,
        totalFound: localMatches.length,
      } satisfies SearchResponse);
    }

    return NextResponse.json({
      query,
      understoodIntent: parsedOutput.understoodIntent || `Pencarian dalil untuk topik "${query}"`,
      results: [],
      unverifiedMessage: parsedOutput.unverifiedMessage || "Sumber dalil tidak dapat diverifikasi, sehingga tidak ditampilkan.",
      totalFound: 0,
    } satisfies SearchResponse);
  }

  // If all AI models failed (e.g. 503 high demand spike, network, or empty)
  console.error("All AI models failed, checking local verified database for query:", query, lastAiError);
  const localMatches = findLocalVerifiedDalil(query, filter);

  if (localMatches.length > 0) {
    return NextResponse.json({
      query,
      understoodIntent: `Menampilkan rujukan dalil terverifikasi untuk topik "${query}"`,
      results: localMatches,
      totalFound: localMatches.length,
    } satisfies SearchResponse);
  }

  // Clean unverified fallback instead of crashing
  return NextResponse.json({
    query,
    understoodIntent: `Pencarian dalil untuk topik "${query}"`,
    results: [],
    unverifiedMessage: "Sumber dalil tidak dapat diverifikasi, sehingga tidak ditampilkan.",
    totalFound: 0,
  } satisfies SearchResponse);
}
