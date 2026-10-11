// ==========================================
// 1. Ollama / Qwen 2.5 3B (LLM & Grammar)
// ==========================================

export type ChatRole = 'system' | 'user' | 'assistant';

export interface OllamaChatMessage {
  role: ChatRole;
  content: string;
}

export interface OllamaChatOptions {
  temperature?: number;
  num_ctx?: number;
  top_p?: number;
  top_k?: number;
  seed?: number;
  stop?: string[];
}

export interface OlamaQwenRequest {
  model: 'qwen2.5:3b' | string;
  messages: OllamaChatMessage[];
  format?: 'json' | string;
  stream?: boolean;
  options?: OllamaChatOptions;
  keep_alive?: string; // e.g. "15m"
}

export interface OlamaQwenResponse {
  model: string;
  created_at: string;
  message: OllamaChatMessage;
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

/**
 * Structured schema when prompting Qwen to evaluate grammar in JSON mode
 */
export interface GrammarErrorItem {
  original: string;
  correction: string;
  reason: string;
  category?: 'grammar' | 'spelling' | 'punctuation' | 'word_choice';
}

export interface GrammarEvaluationResult {
  is_correct: boolean;
  score?: number; // 0-100
  original_text?: string;
  corrected_sentence: string;
  errors?: GrammarErrorItem[];
  improved_alternative?: string;
  explanation?: string;
}

// ==========================================
// 2. Faster-Whisper (STT & Pronunciation)
// ==========================================

export type FasterWhisperModel = 'Systran/faster-whisper-base' | 'Systran/faster-whisper-tiny' | string;
export type FasterWhisperFormat = 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';

export interface FasterWhisperRequest {
  /**
   * Audio file or blob to transcribe (sent via multipart/form-data)
   */
  file: Blob | File | any;
  model?: FasterWhisperModel;
  language?: string; // e.g. "en"
  temperature?: number; // 0.0 for strict acoustic decoding without LLM guessing
  response_format?: FasterWhisperFormat;
  timestamp_granularities?: ('word' | 'segment')[];
  prompt?: string;
}

export interface FasterWhisperWord {
  word: string;
  start: number;
  end: number;
  /**
   * Acoustic confidence probability (0.0 to 1.0)
   * Values < 0.60 indicate mumbled or mispronounced speech
   */
  probability: number;
}

export interface FasterWhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
  words?: FasterWhisperWord[];
}

export interface FasterWhisperResponse {
  task: 'transcribe';
  language: string;
  duration: number;
  text: string;
  words?: FasterWhisperWord[];
  segments?: FasterWhisperSegment[];
}

// ==========================================
// 3. Kokoro-82M (Text-to-Speech)
// ==========================================

export type KokoroVoice =
  // American English (Female)
  | 'af_heart'
  | 'af_bella'
  | 'af_sarah'
  | 'af_nicole'
  // American English (Male)
  | 'am_adam'
  | 'am_michael'
  // British English (Female)
  | 'bf_alice'
  | 'bf_emma'
  // British English (Male)
  | 'bm_george'
  | 'bm_lewis'
  | string;

export type KokoroAudioFormat = 'mp3' | 'wav' | 'opus' | 'flac' | 'aac';

export interface KokoroRequest {
  model?: 'kokoro' | string;
  input: string;
  voice: KokoroVoice;
  speed?: number; // 0.5 to 2.0 (default 1.0)
  response_format?: KokoroAudioFormat;
}

/**
 * The endpoint returns binary audio stream (audio/mpeg or audio/wav)
 */
export type KokoroResponse = Blob | ArrayBuffer | any;
