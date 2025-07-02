const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Generic API call function
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// TTS API functions
export const ttsApi = {
  // Get available voices
  async getVoices() {
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
  }) {
    return apiCall('/api/tts/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Voice API functions (for future use)
export const voiceApi = {
  // Create voice clone
  async createVoice(formData: FormData) {
    return fetch(`${API_BASE_URL}/api/voice/create`, {
      method: 'POST',
      body: formData, // Don't set Content-Type for FormData
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  },

  // Convert speech to speech
  async convertSpeech(formData: FormData) {
    return fetch(`${API_BASE_URL}/api/voice/convert`, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  },

  // List voices
  async listVoices() {
    return apiCall('/api/voice/list');
  },
};

// STT API functions (for future use)
export const sttApi = {
  // Transcribe audio
  async transcribeAudio(formData: FormData) {
    return fetch(`${API_BASE_URL}/api/stt/transcribe`, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  },
};

// Health check
export const healthApi = {
  async checkHealth() {
    return apiCall('/health');
  },

  async getApiInfo() {
    return apiCall('/api/info');
  },
};

// Types for TypeScript
export interface Voice {
  voice_id: string;
  name: string;
  description?: string;
  category?: string;
  preview_url?: string;
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