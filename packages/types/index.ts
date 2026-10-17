export type ChatRole = "system" | "user" | "assistant";
export type ChatMessage = {
  role: ChatRole;
  content: string;
}

export interface OllamaChatBody {
  model: 'qwen2.5:3b';
  messages: ChatMessage[];
  output?: 'text' | 'json';
  outputformat?: string | Record<string, any>;
  stream?: boolean;
  options?: {
    temperature?: number;
    num_ctx?:     number;
  };
}

//===================================================================
export type KororoTTSBody = {
  voice: 'af_heart' | 'af_bella' | 'af_sarah' | 'af_nicole' | 'am_adam' | 'am_michael' | 'bf_alice' | 'bf_emma' | 'bm_george' | 'bm_lewis';
  text:  string | string[];
  speed: number;
  response_format?: 'mp3' | 'wav' | 'opus' | 'flac' | 'aac';
};

// [text, audioBase64DataUri]
// Example: ["cat is a good pet", "data:audio/mp3;base64,..."] or ["cat", "data:audio/mp3;base64,..."]
export type KororoAudioTuple = [text: string, audio: string];

// Single output: binary audio stream (Blob | ArrayBuffer)
// Multiple items output: array of tuples where [0] is full sentence, followed by each word
export type KororoResponse = KororoAudioTuple[] | Blob | ArrayBuffer;

//===================================================================
export type FasterWhisperModel = 'Systran/faster-whisper-base' | 'Systran/faster-whisper-tiny';

export type FasterWhisperSTTBody = {
  model?: FasterWhisperModel;
  language?: string; // default: "en"
  /**
   * Decoding temperature (0.0 to 1.0):
   * 0.0 = Strict acoustic decoding (no guessing/hallucination, ideal for pronunciation scoring)
   * > 0.0 = Allows language model guessing/flexibility
   */
  temperature?: number;
  /**
   * Audio input: Base64 data string, binary buffer, or File/Blob in FormData
   */
  audio?: string | Blob | any;
};

//===================================================================


