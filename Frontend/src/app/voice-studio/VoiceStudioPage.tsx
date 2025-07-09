"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Mic,
  MicOff,
  Play,
  Pause,
  Download,
  Trash2,
  Plus,
  X,
  Settings,
  Loader,
  CheckCircle,
  AlertCircle,
  Volume2,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAudio } from "@/hooks/useAudio";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { audioUtils } from "@/lib/api";

// Voice Studio API functions
const voiceStudioApi = {
  async createVoice(formData: FormData) {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Log what we're sending for debugging
    console.log("Creating voice with form data...");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/voice/create`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      throw new Error(
        errorData.message || errorData.error || "Failed to create voice"
      );
    }

    return await response.json();
  },
};

const VoiceStudioPage = () => {
  const { theme, mounted } = useTheme();

  // Voice creation states
  const [voiceName, setVoiceName] = useState("");
  const [voiceDescription, setVoiceDescription] = useState("");
  const [voiceSample, setVoiceSample] = useState<File | null>(null);
  const [voiceSampleUrl, setVoiceSampleUrl] = useState<string | null>(null);
  const [isCreatingVoice, setIsCreatingVoice] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);

  // Voice settings - UPDATED with comprehensive accents
  const [voiceLabels, setVoiceLabels] = useState({
    accent: "american",
    age: "middle aged",
    gender: "male",
    loudness: "normal",
    tempo: "normal",
  });

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recorder for voice samples
  const audioRecorder = useAudioRecorder({
    audioBitsPerSecond: 128000,
  });

  // Audio player for voice sample preview
  const sampleAudio = useAudio(voiceSampleUrl);

  // Handle recorded audio
  useEffect(() => {
    if (audioRecorder.audioBlob && audioRecorder.audioUrl) {
      const recordedFile = new File(
        [audioRecorder.audioBlob],
        "recorded-sample.webm",
        {
          type: "audio/webm",
        }
      );

      // Validate the recorded file
      const validation = validateVoiceFile(recordedFile);
      if (!validation.valid) {
        setError(validation.error || "Invalid recorded audio");
        audioRecorder.clearRecording();
        return;
      }

      setVoiceSample(recordedFile);
      setVoiceSampleUrl(audioRecorder.audioUrl);
      audioRecorder.clearRecording();
      setError(null);
    }
  }, [audioRecorder.audioBlob, audioRecorder.audioUrl]);

  // Enhanced validation for voice cloning - UPDATED with 100KB minimum
  const validateVoiceFile = (
    file: File
  ): { valid: boolean; error?: string } => {
    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
      "audio/flac",
      "audio/x-flac",
      "audio/mp4",
      "audio/m4a",
      "audio/aac",
      "audio/ogg",
      "audio/webm",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error:
          "Invalid file type. Please upload MP3, WAV, M4A, FLAC, or OGG files.",
      };
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size too large. Maximum size is 25MB.",
      };
    }

    // UPDATED: New minimum size for voice cloning - 100KB
    const minSize = 100 * 1024; // 100KB minimum (matches ElevenLabs requirement)
    if (file.size < minSize) {
      return {
        valid: false,
        error: "File size too small. Minimum size is 100KB for voice cloning.",
      };
    }

    return { valid: true };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateVoiceFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    // Clear previous sample
    if (voiceSampleUrl) {
      URL.revokeObjectURL(voiceSampleUrl);
    }

    setVoiceSample(file);
    const url = URL.createObjectURL(file);
    setVoiceSampleUrl(url);
    setError(null);

    // Clear input for future uploads
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files[0];
      if (!file) return;

      const validation = validateVoiceFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }

      // Clear previous sample
      if (voiceSampleUrl) {
        URL.revokeObjectURL(voiceSampleUrl);
      }

      setVoiceSample(file);
      const url = URL.createObjectURL(file);
      setVoiceSampleUrl(url);
      setError(null);
    },
    [voiceSampleUrl]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const removeSample = () => {
    if (voiceSampleUrl) {
      URL.revokeObjectURL(voiceSampleUrl);
    }
    setVoiceSample(null);
    setVoiceSampleUrl(null);
  };

  const createVoice = async () => {
    if (!voiceName.trim()) {
      setError("Please enter a voice name");
      return;
    }

    if (!voiceSample) {
      setError("Please upload a voice sample");
      return;
    }

    setIsCreatingVoice(true);
    setError(null);
    setSuccess(null);
    setCreationProgress(0);

    try {
      const formData = new FormData();
      formData.append("name", voiceName.trim());
      formData.append(
        "description",
        voiceDescription.trim() || `Custom voice: ${voiceName}`
      );
      formData.append("labels", JSON.stringify(voiceLabels));
      formData.append(
        "audioFile",
        voiceSample,
        `voice-sample.${voiceSample.name.split(".").pop()}`
      );

      // Simulate progress
      const progressInterval = setInterval(() => {
        setCreationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      console.log("Creating voice with ElevenLabs API...");
      const response = await voiceStudioApi.createVoice(formData);

      clearInterval(progressInterval);
      setCreationProgress(100);

      if (response.success) {
        // UPDATED SUCCESS MESSAGE
        setSuccess(
          `🎉 Voice "${voiceName}" created successfully! You can now use your custom voice in Text-to-Speech and Speech-to-Speech. Look for "${voiceName}" in the voice selection dropdown.`
        );

        // Reset form
        setVoiceName("");
        setVoiceDescription("");
        removeSample();
        setCreationProgress(0);

        console.log("Voice created successfully:", response.data);
      } else {
        throw new Error("Voice creation failed");
      }
    } catch (error) {
      console.error("Error creating voice:", error);
      setError(
        `Failed to create voice: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setCreationProgress(0);
    } finally {
      setIsCreatingVoice(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  // Format duration helper
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // UPDATED: Comprehensive accent list
  const accentOptions = [
    // North American
    { value: "american", label: "American (General)" },
    { value: "american-southern", label: "American (Southern)" },
    { value: "american-midwest", label: "American (Midwest)" },
    { value: "american-west", label: "American (West Coast)" },
    { value: "american-northeast", label: "American (Northeast)" },
    { value: "canadian", label: "Canadian" },
    { value: "mexican", label: "Mexican" },

    // British & Irish
    { value: "british", label: "British (RP)" },
    { value: "british-cockney", label: "British (Cockney)" },
    { value: "british-northern", label: "British (Northern)" },
    { value: "scottish", label: "Scottish" },
    { value: "welsh", label: "Welsh" },
    { value: "irish", label: "Irish" },

    // Australian & New Zealand
    { value: "australian", label: "Australian" },
    { value: "newzealand", label: "New Zealand" },

    // European
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "italian", label: "Italian" },
    { value: "spanish", label: "Spanish (Spain)" },
    { value: "portuguese", label: "Portuguese" },
    { value: "dutch", label: "Dutch" },
    { value: "swedish", label: "Swedish" },
    { value: "norwegian", label: "Norwegian" },
    { value: "danish", label: "Danish" },
    { value: "finnish", label: "Finnish" },
    { value: "russian", label: "Russian" },
    { value: "polish", label: "Polish" },
    { value: "czech", label: "Czech" },
    { value: "hungarian", label: "Hungarian" },
    { value: "romanian", label: "Romanian" },
    { value: "greek", label: "Greek" },

    // Asian
    { value: "chinese-mandarin", label: "Chinese (Mandarin)" },
    { value: "chinese-cantonese", label: "Chinese (Cantonese)" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" },
    { value: "thai", label: "Thai" },
    { value: "vietnamese", label: "Vietnamese" },
    { value: "filipino", label: "Filipino" },
    { value: "indonesian", label: "Indonesian" },
    { value: "malaysian", label: "Malaysian" },
    { value: "singaporean", label: "Singaporean" },

    // Indian Subcontinent
    { value: "indian-hindi", label: "Indian (Hindi)" },
    { value: "indian-tamil", label: "Indian (Tamil)" },
    { value: "indian-telugu", label: "Indian (Telugu)" },
    { value: "indian-bengali", label: "Indian (Bengali)" },
    { value: "indian-marathi", label: "Indian (Marathi)" },
    { value: "indian-gujarati", label: "Indian (Gujarati)" },
    { value: "indian-punjabi", label: "Indian (Punjabi)" },
    { value: "indian-kannada", label: "Indian (Kannada)" },
    { value: "indian-malayalam", label: "Indian (Malayalam)" },
    { value: "pakistani", label: "Pakistani" },
    { value: "bangladeshi", label: "Bangladeshi" },
    { value: "sri-lankan", label: "Sri Lankan" },

    // African
    { value: "nigerian-yoruba", label: "Nigerian (Yoruba)" },
    { value: "nigerian-igbo", label: "Nigerian (Igbo)" },
    { value: "nigerian-hausa", label: "Nigerian (Hausa)" },
    { value: "nigerian-pidgin", label: "Nigerian (Pidgin)" },
    { value: "south-african", label: "South African" },
    { value: "kenyan", label: "Kenyan" },
    { value: "ghanaian", label: "Ghanaian" },
    { value: "ethiopian", label: "Ethiopian" },
    { value: "egyptian", label: "Egyptian" },
    { value: "moroccan", label: "Moroccan" },

    // Middle Eastern
    { value: "arabic-gulf", label: "Arabic (Gulf)" },
    { value: "arabic-levantine", label: "Arabic (Levantine)" },
    { value: "arabic-egyptian", label: "Arabic (Egyptian)" },
    { value: "hebrew", label: "Hebrew" },
    { value: "persian", label: "Persian (Farsi)" },
    { value: "turkish", label: "Turkish" },

    // Latin American
    { value: "argentinian", label: "Argentinian" },
    { value: "brazilian", label: "Brazilian" },
    { value: "colombian", label: "Colombian" },
    { value: "chilean", label: "Chilean" },
    { value: "venezuelan", label: "Venezuelan" },
    { value: "peruvian", label: "Peruvian" },
    { value: "ecuadorian", label: "Ecuadorian" },
    { value: "uruguayan", label: "Uruguayan" },
    { value: "bolivian", label: "Bolivian" },
    { value: "paraguayan", label: "Paraguayan" },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-16 mt-8 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Header - UPDATED: Removed tab navigation */}
      <div
        className={`border-b ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Voice Studio</h1>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Create your custom AI voice and use it across VoxWave
              </p>
            </div>
          </div>

          {/* Quick links to other pages */}
          <div className="flex flex-wrap gap-3">
            <a
              href="/text-to-speech"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Use in Text-to-Speech</span>
            </a>
            <a
              href="/speech-to-speech"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Use in Speech-to-Speech</span>
            </a>
          </div>
        </div>
      </div>

      {/* Error/Success Banners */}
      {error && (
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">{success}</span>
            </div>
            <button
              onClick={clearSuccess}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CREATE VOICE SECTION - No longer in a tab */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Creation Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Voice Details */}
            <div
              className={`p-6 rounded-2xl border-2 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-xl font-semibold mb-6">Voice Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Voice Name *
                  </label>
                  <input
                    type="text"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    placeholder="Enter a unique name for your voice..."
                    className={`w-full p-3 rounded-xl border-2 ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    } focus:border-green-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={voiceDescription}
                    onChange={(e) => setVoiceDescription(e.target.value)}
                    placeholder="Describe the voice characteristics..."
                    rows={3}
                    className={`w-full p-3 rounded-xl border-2 ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    } focus:border-green-500 focus:outline-none resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* Voice Sample */}
            <div
              className={`p-6 rounded-2xl border-2 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Voice Sample</h2>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Upload one high-quality audio sample (minimum 100KB,
                    recommended 30+ seconds)
                  </p>
                </div>
                <div className="text-sm text-green-400 font-medium">
                  {voiceSample ? "1/1 sample" : "0/1 sample"}
                </div>
              </div>

              {!voiceSample ? (
                <>
                  {/* Upload Area */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      isDragging
                        ? "border-green-500 bg-green-500/10"
                        : theme === "dark"
                        ? "border-gray-600 hover:border-green-500 bg-gray-800/50"
                        : "border-gray-300 hover:border-green-500 bg-gray-50"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">
                      Upload Voice Sample
                    </h3>
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      } mb-4`}
                    >
                      Drop your audio file here or click to browse
                    </p>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      Supports MP3, WAV, M4A, FLAC (Min: 100KB, Max: 25MB)
                    </p>
                  </div>

                  {/* Recording Option */}
                  <div
                    className={`mt-6 p-4 rounded-xl ${
                      theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Record Voice Sample</h4>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Record directly from your microphone
                        </p>
                      </div>
                      <button
                        onClick={
                          audioRecorder.isRecording
                            ? audioRecorder.stopRecording
                            : audioRecorder.startRecording
                        }
                        disabled={!audioRecorder.isSupported}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
                          audioRecorder.isRecording
                            ? "bg-red-500 hover:bg-red-600 animate-pulse"
                            : "bg-gradient-to-r from-green-400 to-green-600 hover:shadow-lg hover:shadow-green-500/25"
                        }`}
                      >
                        {audioRecorder.isRecording ? (
                          <MicOff className="w-6 h-6 text-white" />
                        ) : (
                          <Mic className="w-6 h-6 text-black" />
                        )}
                      </button>
                    </div>

                    {audioRecorder.isRecording && (
                      <div className="mt-4 flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">
                          Recording: {formatDuration(audioRecorder.duration)}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Sample Display */
                <div
                  className={`p-4 rounded-xl border ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-800"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={sampleAudio.play}
                        disabled={!sampleAudio.canPlay || sampleAudio.isLoading}
                        className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {sampleAudio.isLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : sampleAudio.isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      <div>
                        <div className="font-medium text-sm">
                          {voiceSample.name}
                        </div>
                        <div
                          className={`text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {audioUtils.formatFileSize(voiceSample.size)}
                          {sampleAudio.duration > 0 &&
                            ` • ${audioUtils.formatDuration(
                              sampleAudio.duration
                            )}`}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={removeSample}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress bar for playing audio */}
                  {sampleAudio.duration > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-300 rounded-full h-1">
                        <div
                          className="bg-green-500 h-1 rounded-full transition-all"
                          style={{
                            width: `${
                              (sampleAudio.currentTime / sampleAudio.duration) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Creation Progress */}
            {isCreatingVoice && (
              <div
                className={`p-6 rounded-2xl border-2 ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <Loader className="w-6 h-6 animate-spin text-green-400" />
                  <h3 className="text-lg font-semibold">Creating Voice...</h3>
                </div>

                <div className="space-y-3">
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${creationProgress}%` }}
                    ></div>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {creationProgress < 30
                      ? "Uploading sample..."
                      : creationProgress < 60
                      ? "Processing audio..."
                      : creationProgress < 90
                      ? "Training voice model..."
                      : "Finalizing..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Voice Labels */}
            <div
              className={`p-6 rounded-2xl border-2 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Voice Characteristics
              </h3>

              <div className="space-y-4">
                {/* UPDATED: Comprehensive Accent Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Accent/Region
                  </label>
                  <select
                    value={voiceLabels.accent}
                    onChange={(e) =>
                      setVoiceLabels((prev) => ({
                        ...prev,
                        accent: e.target.value,
                      }))
                    }
                    className={`w-full p-3 rounded-xl border-2 max-h-48 overflow-y-auto ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:border-green-500 focus:outline-none`}
                  >
                    {accentOptions.map((accent) => (
                      <option key={accent.value} value={accent.value}>
                        {accent.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Other characteristics remain the same */}
                <div>
                  <label className="block text-sm font-medium mb-2">Age</label>
                  <select
                    value={voiceLabels.age}
                    onChange={(e) =>
                      setVoiceLabels((prev) => ({
                        ...prev,
                        age: e.target.value,
                      }))
                    }
                    className={`w-full p-3 rounded-xl border-2 ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:border-green-500 focus:outline-none`}
                  >
                    <option value="young">Young</option>
                    <option value="middle aged">Middle Aged</option>
                    <option value="old">Old</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gender
                  </label>
                  <select
                    value={voiceLabels.gender}
                    onChange={(e) =>
                      setVoiceLabels((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className={`w-full p-3 rounded-xl border-2 ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:border-green-500 focus:outline-none`}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Loudness
                  </label>
                  <select
                    value={voiceLabels.loudness}
                    onChange={(e) =>
                      setVoiceLabels((prev) => ({
                        ...prev,
                        loudness: e.target.value,
                      }))
                    }
                    className={`w-full p-3 rounded-xl border-2 ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:border-green-500 focus:outline-none`}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tempo
                  </label>
                  <select
                    value={voiceLabels.tempo}
                    onChange={(e) =>
                      setVoiceLabels((prev) => ({
                        ...prev,
                        tempo: e.target.value,
                      }))
                    }
                    className={`w-full p-3 rounded-xl border-2 ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:border-green-500 focus:outline-none`}
                  >
                    <option value="low">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="high">Fast</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={createVoice}
              disabled={!voiceName.trim() || !voiceSample || isCreatingVoice}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isCreatingVoice ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Creating Voice...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Create Voice</span>
                </>
              )}
            </button>

            {/* Tips */}
            <div
              className={`p-4 rounded-xl ${
                theme === "dark"
                  ? "bg-blue-500/10 border border-blue-500/30"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <h4 className="font-medium text-blue-400 mb-2">
                💡 Tips for Better Results
              </h4>
              <ul
                className={`text-sm space-y-1 ${
                  theme === "dark" ? "text-blue-300" : "text-blue-700"
                }`}
              >
                <li>• Use clear, high-quality recordings</li>
                <li>• Record at least 30 seconds of natural speech</li>
                <li>• Speak at your normal pace and tone</li>
                <li>• Avoid background noise</li>
                <li>• Record in a quiet environment</li>
                <li>• One good sample is better than multiple poor ones</li>
              </ul>
            </div>

            {/* Next Steps Card */}
            <div
              className={`p-4 rounded-xl ${
                theme === "dark"
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <h4 className="font-medium text-green-400 mb-2">
                🎯 After Creating Your Voice
              </h4>
              <ul
                className={`text-sm space-y-1 ${
                  theme === "dark" ? "text-green-300" : "text-green-700"
                }`}
              >
                <li>• Your voice will appear in all voice dropdowns</li>
                <li>• Use it in Text-to-Speech to generate content</li>
                <li>• Use it in Speech-to-Speech to transform audio</li>
                <li>• Share your custom voice with team members</li>
              </ul>
              <div className="mt-3 flex space-x-2">
                <a
                  href="/text-to-speech"
                  className="flex-1 text-center px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-xs font-medium"
                >
                  Text-to-Speech →
                </a>
                <a
                  href="/speech-to-speech"
                  className="flex-1 text-center px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-xs font-medium"
                >
                  Speech-to-Speech →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceStudioPage;
