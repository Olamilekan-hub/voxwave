"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Play,
  Pause,
  Download,
  Upload,
  Mic,
  MicOff,
  Volume2,
  Waves,
  Settings,
  Trash2,
  RefreshCw,
  Loader,
  AlertCircle,
  CheckCircle,
  FileAudio,
  Plus,
  X,
  Clock,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ttsApi, speechToSpeechApi, audioUtils } from "@/lib/api";
import { useAudio } from "@/hooks/useAudio";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

// Define types for better TypeScript support
interface Voice {
  voice_id: string;
  name: string;
  description?: string;
  category?: string;
  preview_url?: string;
  elevenlabs_voice_id?: string;
  is_custom?: boolean;
}

interface VoicesResponse {
  success: boolean;
  data: {
    elevenLabsVoices: Voice[];
    customVoices: Voice[];
    total: number;
  };
  message: string;
}

interface CustomVoice {
  id: string;
  name: string;
  audioUrl: string;
  blob: Blob;
  file?: File;
}

const SpeechToSpeechPage = () => {
  const { theme, mounted } = useTheme();

  // Original audio states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);

  // Target voice states
  const [selectedVoice, setSelectedVoice] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);

  // Custom voice upload states
  const [customVoiceName, setCustomVoiceName] = useState("");
  const [customVoiceFile, setCustomVoiceFile] = useState<File | null>(null);
  const [showCustomVoiceUpload, setShowCustomVoiceUpload] = useState(false);

  // Conversion states
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string | null>(
    null
  );
  const [convertedAudioBlob, setConvertedAudioBlob] = useState<Blob | null>(
    null
  );
  const [conversionResult, setConversionResult] = useState<any>(null);

  // Settings states
  const [quality, setQuality] = useState("eleven_english_sts_v2");
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.8);
  const [preserveEmotion, setPreserveEmotion] = useState(true);

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customVoiceInputRef = useRef<HTMLInputElement>(null);

  // Audio hooks for playback
  const originalAudio = useAudio(originalAudioUrl);
  const convertedAudio = useAudio(convertedAudioUrl);

  // Audio recorder hook
  const audioRecorder = useAudioRecorder({
    audioBitsPerSecond: 128000,
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Load voices on component mount
  useEffect(() => {
    loadVoices();
  }, []);

  // Handle recorded audio
  useEffect(() => {
    if (audioRecorder.audioBlob && audioRecorder.audioUrl) {
      setUploadedFile(null); // Clear uploaded file when recording
      setOriginalAudioUrl(audioRecorder.audioUrl);
      clearConversionResults();
      setError(null);
    }
  }, [audioRecorder.audioBlob, audioRecorder.audioUrl]);

  const voicesContainerRef = useRef<HTMLDivElement>(null);

  const loadVoices = async () => {
    try {
      setIsLoadingVoices(true);
      setError(null);

      const response: VoicesResponse = await ttsApi.getVoices();

      if (response.success) {
        const allVoices = [
          ...response.data.elevenLabsVoices,
          ...response.data.customVoices,
        ];
        setVoices(allVoices);

        if (allVoices.length > 0 && !selectedVoice) {
          // Select the last voice (original order) which will appear first in display
          setSelectedVoice(allVoices[allVoices.length - 1].voice_id);
        }
      } else {
        throw new Error("Failed to load voices");
      }
    } catch (error) {
      console.error("Error loading voices:", error);
      setError(
        `Failed to load voices: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );

      // Fallback voices
      const fallbackVoices = [
        {
          voice_id: "21m00Tcm4TlvDq8ikWAM",
          name: "Rachel",
          description: "Natural, warm female voice",
        },
        {
          voice_id: "AZnzlk1XvdvUeBnXmlld",
          name: "Domi",
          description: "Strong, confident female voice",
        },
        {
          voice_id: "EXAVITQu4vr4xnSDxMaL",
          name: "Bella",
          description: "Sweet, friendly female voice",
        },
      ];
      setVoices(fallbackVoices);
      if (!selectedVoice) {
        setSelectedVoice(fallbackVoices[fallbackVoices.length - 1].voice_id);
      }
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = audioUtils.validateAudioFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }

      setUploadedFile(file);
      audioRecorder.clearRecording(); // Clear recording when uploading
      const url = URL.createObjectURL(file);
      setOriginalAudioUrl(url);
      clearConversionResults();
      setError(null);
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files[0];
      if (file) {
        const validation = audioUtils.validateAudioFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          return;
        }

        setUploadedFile(file);
        audioRecorder.clearRecording();
        const url = URL.createObjectURL(file);
        setOriginalAudioUrl(url);
        clearConversionResults();
        setError(null);
      }
    },
    [audioRecorder]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleCustomVoiceUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = audioUtils.validateAudioFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid voice file");
        return;
      }
      setCustomVoiceFile(file);
      setError(null);
    }
  };

  const addCustomVoice = () => {
    if (!customVoiceFile || !customVoiceName.trim()) {
      setError("Please provide a voice name and audio file");
      return;
    }

    const customVoice: CustomVoice = {
      id: `custom_${Date.now()}`,
      name: customVoiceName.trim(),
      audioUrl: URL.createObjectURL(customVoiceFile),
      blob: customVoiceFile,
      file: customVoiceFile,
    };

    setCustomVoices((prev) => [...prev, customVoice]);
    setSelectedVoice(customVoice.id);
    setCustomVoiceName("");
    setCustomVoiceFile(null);
    setShowCustomVoiceUpload(false);
    setError(null);

    // Clear the file input
    if (customVoiceInputRef.current) {
      customVoiceInputRef.current.value = "";
    }
  };

  const removeCustomVoice = (voiceId: string) => {
    setCustomVoices((prev) => prev.filter((v) => v.id !== voiceId));
    if (selectedVoice === voiceId) {
      setSelectedVoice(voices.length > 0 ? voices[0].voice_id : "");
    }
  };

  const handleConvert = async () => {
    if (!originalAudioUrl || !selectedVoice) {
      setError("Please upload an audio file and select a voice");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();

      // Add the audio file
      if (uploadedFile) {
        formData.append("audio", uploadedFile);
      } else if (audioRecorder.audioBlob) {
        formData.append(
          "audio",
          audioRecorder.audioBlob,
          "recorded-audio.webm"
        );
      } else {
        throw new Error("No audio file available");
      }

      // Handle custom voice or regular voice
      let voiceIdToUse = selectedVoice;
      const customVoice = customVoices.find((v) => v.id === selectedVoice);

      if (customVoice) {
        // For now, we'll use a default voice since VoxWave voice cloning requires API setup
        // In a full implementation, you'd first create the voice clone, then use its ID
        voiceIdToUse =
          voices.length > 0 ? voices[0].voice_id : "21m00Tcm4TlvDq8ikWAM";
        console.log(
          `Using custom voice "${customVoice.name}" - converting with default voice for now`
        );
      }

      // Add conversion parameters
      formData.append("voiceId", voiceIdToUse);
      formData.append(
        "options",
        JSON.stringify({
          model_id: quality,
          stability: stability,
          similarity_boost: similarityBoost,
          style: preserveEmotion ? 0.5 : 0.0,
          use_speaker_boost: true,
        })
      );

      console.log("Converting speech with voice:", voiceIdToUse);

      const response = await speechToSpeechApi.convertSpeech(formData);

      if (response.success) {
        setConversionResult(response.data);

        // Fetch the converted audio as blob
        const audioResponse = await fetch(
          `${API_BASE_URL}${response.data.audioUrl}`
        );
        if (!audioResponse.ok) {
          throw new Error("Failed to fetch converted audio");
        }

        const blob = await audioResponse.blob();
        const blobUrl = URL.createObjectURL(blob);

        setConvertedAudioBlob(blob);
        setConvertedAudioUrl(blobUrl);
        setError(null);

        console.log("Speech conversion completed successfully");
      } else {
        throw new Error("Speech conversion failed");
      }
    } catch (error) {
      console.error("Error converting speech:", error);
      setError(
        `Failed to convert speech: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!convertedAudioBlob || !conversionResult) return;

    try {
      audioUtils.downloadBlob(
        convertedAudioBlob,
        conversionResult.filename || "voxwave-converted-speech.mp3"
      );
    } catch (error) {
      console.error("Error downloading audio:", error);
      setError("Failed to download audio");
    }
  };

  const clearConversionResults = () => {
    if (convertedAudioUrl) {
      URL.revokeObjectURL(convertedAudioUrl);
    }
    setConvertedAudioUrl(null);
    setConvertedAudioBlob(null);
    setConversionResult(null);
  };

  const clearAudio = () => {
    if (originalAudioUrl) {
      URL.revokeObjectURL(originalAudioUrl);
    }
    setUploadedFile(null);
    setOriginalAudioUrl(null);
    audioRecorder.clearRecording();
    clearConversionResults();
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    if (!isLoadingVoices && selectedVoice) {
      setTimeout(() => {
        scrollToSelectedVoice();
      }, 1000);
    }
  }, [isLoadingVoices, selectedVoice]);

  // Get all available voices (built-in + custom)
  const getAllVoices = () => {
    const allVoices = [
      ...voices.map((v) => ({ ...v, is_custom: false })),
      ...customVoices.map((v) => ({
        voice_id: v.id,
        name: v.name,
        description: "Custom Voice",
        is_custom: true,
      })),
    ];
    return allVoices.reverse();
  };

  const scrollToSelectedVoice = () => {
    if (voicesContainerRef.current && selectedVoice) {
      const selectedElement = voicesContainerRef.current.querySelector(
        `[data-voice-id="${selectedVoice}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  // Helper function to format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-16 mt-5 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`border-b ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
              <Waves className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Speech to Speech</h1>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Transform existing audio with different voices
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`p-4 rounded-xl ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-400">
                {uploadedFile
                  ? audioUtils.formatFileSize(uploadedFile.size)
                  : audioRecorder.audioBlob
                  ? audioUtils.formatFileSize(audioRecorder.audioBlob.size)
                  : "0 MB"}
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                File Size
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-400">
                {quality === "eleven_english_sts_v2"
                  ? "English"
                  : "Multilingual"}
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Model
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-400">
                {getAllVoices().find((v) => v.voice_id === selectedVoice)
                  ?.name || "None"}
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Target Voice
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {(error ||
        originalAudio.error ||
        convertedAudio.error ||
        audioRecorder.error) && (
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">
                {error ||
                  originalAudio.error ||
                  convertedAudio.error ||
                  audioRecorder.error}
              </span>
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

      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Audio Input */}
            <div
              className={`p-6 rounded-2xl border-2 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-xl font-semibold mb-6">Input Audio</h2>

              {!originalAudioUrl ? (
                <div className="space-y-6">
                  {/* File Upload */}
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
                      Upload Audio File
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
                      Supports MP3, WAV, M4A, FLAC (Max 25MB)
                    </p>
                  </div>

                  <div
                    className={`flex items-center ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="px-4 text-sm font-medium">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  {/* Voice Recording */}
                  <div className="text-center">
                    {!audioRecorder.isSupported ? (
                      <div className="text-red-400 text-sm mb-4">
                        Audio recording is not supported in your browser
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={
                            audioRecorder.isRecording
                              ? audioRecorder.stopRecording
                              : audioRecorder.startRecording
                          }
                          disabled={!audioRecorder.isSupported}
                          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            audioRecorder.isRecording
                              ? "bg-red-500 hover:bg-red-600 animate-pulse"
                              : "bg-gradient-to-r from-green-400 to-green-600 hover:shadow-lg hover:shadow-green-500/25"
                          }`}
                        >
                          {audioRecorder.isRecording ? (
                            <MicOff className="w-8 h-8 text-white" />
                          ) : (
                            <Mic className="w-8 h-8 text-black" />
                          )}
                        </button>

                        <p
                          className={`mt-4 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {audioRecorder.isRecording ? (
                            <span className="flex items-center justify-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                Recording:{" "}
                                {formatDuration(audioRecorder.duration)}
                              </span>
                            </span>
                          ) : (
                            "Click to start recording"
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* Audio Player - Original */
                <div
                  className={`p-6 rounded-xl ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={originalAudio.play}
                        disabled={
                          !originalAudio.canPlay || originalAudio.isLoading
                        }
                        className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-black hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {originalAudio.isLoading ? (
                          <Loader className="w-6 h-6 animate-spin" />
                        ) : originalAudio.isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </button>
                      <div>
                        <div className="font-medium text-lg">
                          Original Audio
                        </div>
                        <div
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {uploadedFile ? uploadedFile.name : "Recorded Audio"}
                          {originalAudio.duration > 0 && (
                            <span>
                              {" "}
                              •{" "}
                              {audioUtils.formatDuration(
                                originalAudio.duration
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={clearAudio}
                      className={`p-3 rounded-lg ${
                        theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      } transition-colors`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {originalAudio.duration > 0 && (
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                          originalAudio.duration > 0
                            ? (originalAudio.currentTime /
                                originalAudio.duration) *
                              100
                            : 0
                        }
                        onChange={(e) =>
                          originalAudio.seek(
                            (parseFloat(e.target.value) / 100) *
                              originalAudio.duration
                          )
                        }
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>
                          {audioUtils.formatDuration(originalAudio.currentTime)}
                        </span>
                        <span>
                          {audioUtils.formatDuration(originalAudio.duration)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Waveform Visualization */}
                  <div className="h-20 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 bg-blue-400 rounded-full transition-all duration-75 ${
                            originalAudio.isPlaying ? "animate-pulse" : ""
                          }`}
                          style={{
                            height: `${Math.random() * 50 + 10}px`,
                            opacity: originalAudio.isPlaying ? 0.8 : 0.4,
                          }}
                        />
                      ))}
                    </div>
                  </div>
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

            {/* Converted Audio */}
            {convertedAudioUrl && conversionResult && (
              <div
                className={`p-6 rounded-2xl border-2 ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <h2 className="text-xl font-semibold mb-6">Converted Audio</h2>

                <div
                  className={`p-6 rounded-xl ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={convertedAudio.play}
                        disabled={
                          !convertedAudio.canPlay || convertedAudio.isLoading
                        }
                        className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-black hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {convertedAudio.isLoading ? (
                          <Loader className="w-6 h-6 animate-spin" />
                        ) : convertedAudio.isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </button>
                      <div>
                        <div className="font-medium text-lg">
                          Converted Speech
                        </div>
                        <div
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Voice:{" "}
                          {
                            getAllVoices().find(
                              (v) => v.voice_id === selectedVoice
                            )?.name
                          }
                          {convertedAudio.duration > 0 && (
                            <span>
                              {" "}
                              •{" "}
                              {audioUtils.formatDuration(
                                convertedAudio.duration
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {audioUtils.formatFileSize(conversionResult.fileSize)}
                        </div>
                        <div className="text-xs text-gray-500">Converted</div>
                      </div>
                      <button
                        onClick={handleDownload}
                        className={`p-3 rounded-lg ${
                          theme === "dark"
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-200 hover:bg-gray-300"
                        } transition-colors`}
                        title="Download Converted Audio"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {convertedAudio.duration > 0 && (
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                          convertedAudio.duration > 0
                            ? (convertedAudio.currentTime /
                                convertedAudio.duration) *
                              100
                            : 0
                        }
                        onChange={(e) =>
                          convertedAudio.seek(
                            (parseFloat(e.target.value) / 100) *
                              convertedAudio.duration
                          )
                        }
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>
                          {audioUtils.formatDuration(
                            convertedAudio.currentTime
                          )}
                        </span>
                        <span>
                          {audioUtils.formatDuration(convertedAudio.duration)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Converted Waveform */}
                  <div className="h-20 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 bg-green-400 rounded-full transition-all duration-75 ${
                            convertedAudio.isPlaying ? "animate-pulse" : ""
                          }`}
                          style={{
                            height: `${Math.random() * 50 + 10}px`,
                            opacity: convertedAudio.isPlaying ? 0.8 : 0.4,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings Sidebar - Will continue in next part... */}
          <div className="space-y-6">
            {/* Voice Selection */}
            <div
              className={`p-6 rounded-2xl border-2 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Target Voice
                  {isLoadingVoices && (
                    <Loader className="w-4 h-4 ml-2 animate-spin" />
                  )}
                </h3>
                <button
                  onClick={() =>
                    setShowCustomVoiceUpload(!showCustomVoiceUpload)
                  }
                  className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                  title="Add Custom Voice"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Custom Voice Upload */}
              {showCustomVoiceUpload && (
                <div
                  className={`p-4 rounded-lg mb-4 ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <h4 className="font-medium mb-3">Add Custom Voice</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Voice name..."
                      value={customVoiceName}
                      onChange={(e) => setCustomVoiceName(e.target.value)}
                      className={`w-full p-2 rounded-lg border ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                    <div className="flex gap-2">
                      <input
                        ref={customVoiceInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleCustomVoiceUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => customVoiceInputRef.current?.click()}
                        className={`flex-1 p-2 rounded-lg border-2 border-dashed ${
                          theme === "dark"
                            ? "border-gray-600 hover:border-green-500"
                            : "border-gray-300 hover:border-green-500"
                        } transition-colors`}
                      >
                        {customVoiceFile
                          ? customVoiceFile.name
                          : "Upload voice sample"}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addCustomVoice}
                        disabled={!customVoiceName.trim() || !customVoiceFile}
                        className="flex-1 bg-green-500 text-black px-3 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Voice
                      </button>
                      <button
                        onClick={() => setShowCustomVoiceUpload(false)}
                        className={`px-3 py-2 rounded-lg ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div
                ref={voicesContainerRef}
                className="space-y-3 max-h-64 overflow-y-auto"
              >
                {isLoadingVoices ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-green-400" />
                    <span className="ml-2 text-gray-500">
                      Loading voices...
                    </span>
                  </div>
                ) : getAllVoices().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No voices available. Check your connection.
                  </div>
                ) : (
                  getAllVoices().map((voice) => (
                    <div key={voice.voice_id} className="relative">
                      <button
                        data-voice-id={voice.voice_id}
                        onClick={() => setSelectedVoice(voice.voice_id)}
                        className={`w-full p-3 rounded-xl text-left transition-all ${
                          selectedVoice === voice.voice_id
                            ? "bg-green-500/10 border-2 border-green-500"
                            : theme === "dark"
                            ? "bg-gray-800 border-2 border-gray-700 hover:border-gray-600"
                            : "bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{voice.name}</div>
                            <div
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {voice.description || "AI Voice"}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                voice.is_custom
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {voice.is_custom ? "Custom" : "VoxWave"}
                            </span>
                            {voice.is_custom && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCustomVoice(voice.voice_id);
                                }}
                                className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Conversion Settings */}
            <div
              className={`p-6 rounded-2xl border-2 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Model
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className={`w-full p-3 rounded-xl border-2 ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:border-green-500 focus:outline-none`}
                  >
                    <option value="eleven_english_sts_v2">
                      English Model (Faster)
                    </option>
                    <option value="eleven_multilingual_sts_v2">
                      Multilingual Model
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stability: {stability.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={stability}
                    onChange={(e) => setStability(parseFloat(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher values make voice more stable but less expressive
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Similarity Boost: {similarityBoost.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={similarityBoost}
                    onChange={(e) =>
                      setSimilarityBoost(parseFloat(e.target.value))
                    }
                    className="w-full accent-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enhances similarity to the target voice
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Preserve Emotion
                  </label>
                  <button
                    onClick={() => setPreserveEmotion(!preserveEmotion)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preserveEmotion ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        preserveEmotion ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={
                !originalAudioUrl ||
                !selectedVoice ||
                isProcessing ||
                isLoadingVoices
              }
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Convert Speech</span>
                </>
              )}
            </button>

            {/* Success Message */}
            {conversionResult && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm">
                  Speech converted successfully! File:{" "}
                  {conversionResult.filename}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToSpeechPage;
