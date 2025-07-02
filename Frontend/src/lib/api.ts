const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Generic API call function with better error handling
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    
    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    
    throw error;
  }
}

// TTS API functions
export const ttsApi = {
  // Get available voices
  async getVoices(): Promise<VoicesResponse> {
    return apiCall('/api/tts/voices');
  },

  // Generate speech from text
  async generateSpeech(data: {
    text: string;
    voiceId: string;
    options?: {
      model_id?: string;
      voice_settings?: {
        stability?: number;
        similarity_boost?: number;
        style?: number;
        use_speaker_boost?: boolean;
      };
    };
  }): Promise<TtsResponse> {
    // Validate input
    if (!data.text || !data.text.trim()) {
      throw new Error('Text is required');
    }
    
    if (!data.voiceId) {
      throw new Error('Voice ID is required');
    }
    
    if (data.text.length > 5000) {
      throw new Error('Text must be less than 5000 characters');
    }

    return apiCall('/api/tts/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Speech-to-Speech API functions
export const speechToSpeechApi = {
  // Get conversion info and supported formats
  async getConversionInfo(): Promise<any> {
    return apiCall('/api/speech-to-speech/info');
  },

  // Convert speech to speech
  async convertSpeech(formData: FormData): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/speech-to-speech/convert`, {
        method: 'POST',
        body: formData, // Don't set Content-Type for FormData
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.message || errorData.error || 'Failed to convert speech');
      }

      return await response.json();
    } catch (error) {
      console.error('Speech conversion failed:', error);
      throw error;
    }
  },
};
export const voiceApi = {
  // Create voice clone
  async createVoice(formData: FormData): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voice/create`, {
        method: 'POST',
        body: formData, // Don't set Content-Type for FormData
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.message || errorData.error || 'Failed to create voice');
      }

      return await response.json();
    } catch (error) {
      console.error('Voice creation failed:', error);
      throw error;
    }
  },

  // Convert speech to speech
  async convertSpeech(formData: FormData): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voice/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.message || errorData.error || 'Failed to convert speech');
      }

      return await response.json();
    } catch (error) {
      console.error('Speech conversion failed:', error);
      throw error;
    }
  },

  // List voices
  async listVoices(): Promise<any> {
    return apiCall('/api/voice/list');
  },
};

// STT API functions (for future use)
export const sttApi = {
  // Transcribe audio
  async transcribeAudio(formData: FormData): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stt/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.message || errorData.error || 'Failed to transcribe audio');
      }

      return await response.json();
    } catch (error) {
      console.error('Audio transcription failed:', error);
      throw error;
    }
  },
};

// Health check with timeout
export const healthApi = {
  async checkHealth(): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Health check timed out - server may be down');
      }
      throw error;
    }
  },

  async getApiInfo(): Promise<any> {
    return apiCall('/api/info');
  },
};

// Audio utility functions
export const audioUtils = {
  // Download audio blob as file
  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Convert audio file to blob
  async fileToBlob(file: File): Promise<Blob> {
    return new Blob([file], { type: file.type });
  },

  // Validate audio file
  validateAudioFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/flac',
      'audio/x-flac',
      'audio/mp4',
      'audio/m4a',
      'audio/aac',
      'audio/ogg',
      'audio/webm'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload MP3, WAV, M4A, FLAC, or OGG files.'
      };
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Maximum size is 25MB.'
      };
    }

    return { valid: true };
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format duration
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

// Types for TypeScript
export interface Voice {
  voice_id: string;
  name: string;
  description?: string;
  category?: string;
  preview_url?: string;
  elevenlabs_voice_id?: string;
}

export interface TtsResponse {
  success: boolean;
  data: {
    fileId: string;
    audioUrl: string;
    filename: string;
    fileSize: number;
    duration: number;
    characterCount: number;
    voiceUsed: string;
    createdAt: string;
  };
  message: string;
}

export interface VoicesResponse {
  success: boolean;
  data: {
    elevenLabsVoices: Voice[];
    customVoices: Voice[];
    total: number;
  };
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  status: string;
  services: {
    database: string;
    elevenLabs: string;
  };
  endpoints: Record<string, string>;
}