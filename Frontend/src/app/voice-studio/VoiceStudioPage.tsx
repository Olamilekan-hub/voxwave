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
  Eye,
  Edit3,
  Copy,
  Star,
  Clock,
  Users,
  Zap,
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

  async getVoices() {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const response = await fetch(`${API_BASE_URL}/api/voice/list`);

    if (!response.ok) {
      throw new Error("Failed to get voices");
    }

    return await response.json();
  },

  async deleteVoice(voiceId: string) {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const response = await fetch(`${API_BASE_URL}/api/voice/${voiceId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      throw new Error(
        errorData.message || errorData.error || "Failed to delete voice"
      );
    }

    return await response.json();
  },

  async getVoiceQuota() {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const response = await fetch(`${API_BASE_URL}/api/voice/quota`);

    if (!response.ok) {
      throw new Error("Failed to get voice quota");
    }

    return await response.json();
  },
};

interface VoiceSample {
  id: string;
  file: File;
  url: string;
  duration?: number;
  isValid: boolean;
  error?: string;
}

interface CustomVoice {
  voice_id: string;
  elevenlabs_voice_id?: string;
  name: string;
  description: string;
  category?: string;
  is_custom: boolean;
  created_at?: string;
  file_size?: number;
}

const VoiceStudioPage = () => {
  const { theme, mounted } = useTheme();

  // Voice creation states
  const [voiceName, setVoiceName] = useState("");
  const [voiceDescription, setVoiceDescription] = useState("");
  const [voiceSamples, setVoiceSamples] = useState<VoiceSample[]>([]);
  const [isCreatingVoice, setIsCreatingVoice] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);

  // Voice management states
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  // Voice settings
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
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
  const [quota, setQuota] = useState<any>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recorder for voice samples
  const audioRecorder = useAudioRecorder({
    audioBitsPerSecond: 128000,
  });

  // Load voices and quota on mount
  useEffect(() => {
    loadVoicesAndQuota();
  }, []);

  // Handle recorded audio
  useEffect(() => {
    if (audioRecorder.audioBlob && audioRecorder.audioUrl) {
      const newSample: VoiceSample = {
        id: Date.now().toString(),
        file: new File([audioRecorder.audioBlob], "recorded-sample.webm", {
          type: "audio/webm",
        }),
        url: audioRecorder.audioUrl,
        isValid: true,
      };
      setVoiceSamples((prev) => [...prev, newSample]);
      audioRecorder.clearRecording();
    }
  }, [audioRecorder.audioBlob, audioRecorder.audioUrl]);

  const loadVoicesAndQuota = async () => {
    try {
      setIsLoadingVoices(true);
      setError(null);

      const [voicesResponse, quotaResponse] = await Promise.all([
        voiceStudioApi.getVoices(),
        voiceStudioApi.getVoiceQuota().catch(() => ({ success: false })),
      ]);

      if (voicesResponse.success) {
        setCustomVoices(voicesResponse.data.customVoices || []);
      }

      if (quotaResponse.success) {
        setQuota(quotaResponse.data);
      }
    } catch (error) {
      console.error("Error loading voices:", error);
      setError(
        `Failed to load voices: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const validation = audioUtils.validateAudioFile(file);
      const sample: VoiceSample = {
        id: Date.now().toString() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        isValid: validation.valid,
        error: validation.error,
      };

      setVoiceSamples((prev) => [...prev, sample]);
    });

    // Clear input for multiple uploads
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    files.forEach((file) => {
      const validation = audioUtils.validateAudioFile(file);
      const sample: VoiceSample = {
        id: Date.now().toString() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        isValid: validation.valid,
        error: validation.error,
      };

      setVoiceSamples((prev) => [...prev, sample]);
    });
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const removeSample = (sampleId: string) => {
    setVoiceSamples((prev) => {
      const sample = prev.find((s) => s.id === sampleId);
      if (sample) {
        URL.revokeObjectURL(sample.url);
      }
      return prev.filter((s) => s.id !== sampleId);
    });
  };

  const createVoice = async () => {
    if (!voiceName.trim()) {
      setError("Please enter a voice name");
      return;
    }

    const validSamples = voiceSamples.filter((s) => s.isValid);
    if (validSamples.length === 0) {
      setError("Please add at least one valid voice sample");
      return;
    }

    if (validSamples.length > 5) {
      setError("Maximum 5 voice samples allowed");
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

      // Add audio files
      validSamples.forEach((sample, index) => {
        formData.append(
          "audioFiles",
          sample.file,
          `sample-${index + 1}.${sample.file.name.split(".").pop()}`
        );
      });

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
        setSuccess(`Voice "${voiceName}" created successfully!`);

        // Reset form
        setVoiceName("");
        setVoiceDescription("");
        setVoiceSamples([]);
        setCreationProgress(0);

        // Reload voices
        await loadVoicesAndQuota();

        // Switch to manage tab to see the new voice
        setActiveTab("manage");

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

  const deleteVoice = async (voiceId: string, voiceName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the voice "${voiceName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setError(null);
      const response = await voiceStudioApi.deleteVoice(voiceId);

      if (response.success) {
        setSuccess(`Voice "${voiceName}" deleted successfully`);
        await loadVoicesAndQuota();
      }
    } catch (error) {
      console.error("Error deleting voice:", error);
      setError(
        `Failed to delete voice: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-16 ${
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
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
                  Create and manage your custom AI voices
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div
              className={`flex rounded-xl p-1 ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-100"
              }`}
            >
              <button
                onClick={() => setActiveTab("create")}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "create"
                    ? "bg-green-500 text-black"
                    : theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Create Voice
              </button>
              <button
                onClick={() => setActiveTab("manage")}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "manage"
                    ? "bg-green-500 text-black"
                    : theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Manage Voices
              </button>
            </div>
          </div>

          {/* Quota Info */}
          {quota && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div
                className={`p-4 rounded-xl ${
                  theme === "dark" ? "bg-gray-900" : "bg-gray-50"
                }`}
              >
                <div className="text-2xl font-bold text-green-400">
                  {quota.voices_created || 0}
                </div>
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Voices Created
                </div>
              </div>
              <div
                className={`p-4 rounded-xl ${
                  theme === "dark" ? "bg-gray-900" : "bg-gray-50"
                }`}
              >
                <div className="text-2xl font-bold text-green-400">
                  {quota.voices_remaining || 0}
                </div>
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Remaining
                </div>
              </div>
              <div
                className={`p-4 rounded-xl ${
                  theme === "dark" ? "bg-gray-900" : "bg-gray-50"
                }`}
              >
                <div className="text-2xl font-bold text-green-400">
                  {quota.subscription_tier || "Free"}
                </div>
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Plan
                </div>
              </div>
              <div
                className={`p-4 rounded-xl ${
                  theme === "dark" ? "bg-gray-900" : "bg-gray-50"
                }`}
              >
                <div className="text-2xl font-bold text-green-400">
                  {quota.character_usage
                    ? `${Math.round(
                        (quota.character_usage.remaining /
                          quota.character_usage.limit) *
                          100
                      )}%`
                    : "100%"}
                </div>
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Credits Left
                </div>
              </div>
            </div>
          )}
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
        {/* CREATE VOICE TAB */}
        {activeTab === "create" && (
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

              {/* Voice Samples */}
              <div
                className={`p-6 rounded-2xl border-2 ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Voice Samples</h2>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Upload 1-5 high-quality audio samples (minimum 30 seconds
                      each)
                    </p>
                  </div>
                  <div className="text-sm text-green-400 font-medium">
                    {voiceSamples.filter((s) => s.isValid).length}/5 samples
                  </div>
                </div>

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
                    Upload Audio Samples
                  </h3>
                  <p
                    className={`${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    } mb-4`}
                  >
                    Drop your audio files here or click to browse
                  </p>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Supports MP3, WAV, M4A, FLAC (Max 25MB each)
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
                      <h4 className="font-medium">Record Audio Sample</h4>
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

                {/* Sample List */}
                {voiceSamples.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium">Uploaded Samples</h4>
                    {voiceSamples.map((sample) => (
                      <SampleItem
                        key={sample.id}
                        sample={sample}
                        onRemove={removeSample}
                        theme={theme}
                      />
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
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
                        ? "Uploading samples..."
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
                  {Object.entries(voiceLabels).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-2 capitalize">
                        {key}
                      </label>
                      <select
                        value={value}
                        onChange={(e) =>
                          setVoiceLabels((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className={`w-full p-3 rounded-xl border-2 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-gray-50 border-gray-200 text-gray-900"
                        } focus:border-green-500 focus:outline-none`}
                      >
                        {key === "accent" && (
                          <>
                            <option value="american">American</option>
                            <option value="british">British</option>
                            <option value="australian">Australian</option>
                            <option value="irish">Irish</option>
                            <option value="canadian">Canadian</option>
                          </>
                        )}
                        {key === "age" && (
                          <>
                            <option value="young">Young</option>
                            <option value="middle aged">Middle Aged</option>
                            <option value="old">Old</option>
                          </>
                        )}
                        {key === "gender" && (
                          <>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="neutral">Neutral</option>
                          </>
                        )}
                        {(key === "loudness" || key === "tempo") && (
                          <>
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                          </>
                        )}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={createVoice}
                disabled={
                  !voiceName.trim() ||
                  voiceSamples.filter((s) => s.isValid).length === 0 ||
                  isCreatingVoice
                }
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
                  <li>• Include diverse emotional expressions</li>
                  <li>• Ensure consistent speaking pace</li>
                  <li>• Avoid background noise</li>
                  <li>• Record in a quiet environment</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* MANAGE VOICES TAB */}
        {activeTab === "manage" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Your Custom Voices</h2>
              <button
                onClick={loadVoicesAndQuota}
                disabled={isLoadingVoices}
                className={`p-3 rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition-colors disabled:opacity-50`}
              >
                {isLoadingVoices ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>

            {isLoadingVoices ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center space-x-3">
                  <Loader className="w-6 h-6 animate-spin text-green-400" />
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    Loading voices...
                  </span>
                </div>
              </div>
            ) : customVoices.length === 0 ? (
              <div className="text-center py-16">
                <Mic className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">
                  No Custom Voices Yet
                </h3>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } mb-6`}
                >
                  Create your first custom voice to get started
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="bg-gradient-to-r from-green-400 to-green-600 text-black px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
                >
                  Create Your First Voice
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customVoices.map((voice) => (
                  <VoiceCard
                    key={voice.voice_id}
                    voice={voice}
                    onDelete={deleteVoice}
                    theme={theme}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Sample Item Component
const SampleItem = ({
  sample,
  onRemove,
  theme,
}: {
  sample: VoiceSample;
  onRemove: (id: string) => void;
  theme: string;
}) => {
  const audio = useAudio(sample.url);

  return (
    <div
      className={`p-4 rounded-xl border ${
        sample.isValid
          ? theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-gray-50"
          : "border-red-500/50 bg-red-500/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={audio.play}
            disabled={!audio.canPlay || audio.isLoading || !sample.isValid}
            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {audio.isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : audio.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <div>
            <div className="font-medium text-sm">{sample.file.name}</div>
            <div
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {audioUtils.formatFileSize(sample.file.size)}
              {audio.duration > 0 &&
                ` • ${audioUtils.formatDuration(audio.duration)}`}
            </div>
            {!sample.isValid && sample.error && (
              <div className="text-xs text-red-400 mt-1">{sample.error}</div>
            )}
          </div>
        </div>

        <button
          onClick={() => onRemove(sample.id)}
          className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar for playing audio */}
      {audio.duration > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-300 rounded-full h-1">
            <div
              className="bg-green-500 h-1 rounded-full transition-all"
              style={{
                width: `${(audio.currentTime / audio.duration) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Voice Card Component
const VoiceCard = ({
  voice,
  onDelete,
  theme,
}: {
  voice: CustomVoice;
  onDelete: (id: string, name: string) => void;
  theme: string;
}) => {
  return (
    <div
      className={`p-6 rounded-2xl border-2 transition-all hover:border-green-500/50 ${
        theme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">{voice.name}</h3>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {voice.description}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
            Custom
          </span>
          <button
            onClick={() => onDelete(voice.voice_id, voice.name)}
            className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors"
            title="Delete voice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span
            className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
          >
            Created
          </span>
          <span>
            {voice.created_at
              ? new Date(voice.created_at).toLocaleDateString()
              : "Unknown"}
          </span>
        </div>

        {voice.file_size && (
          <div className="flex items-center justify-between text-sm">
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              Size
            </span>
            <span>{audioUtils.formatFileSize(voice.file_size)}</span>
          </div>
        )}

        <div className="flex items-center space-x-2 pt-3">
          <button className="flex-1 bg-green-500/20 text-green-400 py-2 px-4 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium">
            <Play className="w-4 h-4 inline mr-2" />
            Preview
          </button>
          <button className="flex-1 bg-gray-500/20 text-gray-400 py-2 px-4 rounded-lg hover:bg-gray-500/30 transition-colors text-sm font-medium">
            <Edit3 className="w-4 h-4 inline mr-2" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceStudioPage;
