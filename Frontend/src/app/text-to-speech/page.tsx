"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Download,
  Copy,
  Volume2,
  FileText,
  Settings,
  Loader,
  AlertCircle,
  CheckCircle,
  Upload,
  Mic,
  MicOff,
  Plus,
  X,
  Clock,
  Trash2,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import {
  ttsApi,
  voiceApi,
  type Voice,
  type TtsResponse,
  type VoicesResponse,
  audioUtils,
} from "@/lib/api";
import { useAudio } from "@/hooks/useAudio";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface CustomVoice {
  id: string;
  name: string;
  audioUrl: string;
  blob: Blob;
  file?: File;
  description?: string;
}

const TextToSpeechPage = () => {
  const { theme, mounted } = useTheme();
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<
    TtsResponse["data"] | null
  >(null);

  // Custom voice states
  const [showCustomVoiceUpload, setShowCustomVoiceUpload] = useState(false);
  const [customVoiceName, setCustomVoiceName] = useState("");
  const [customVoiceFile, setCustomVoiceFile] = useState<File | null>(null);
  const [isCreatingCustomVoice, setIsCreatingCustomVoice] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the enhanced audio hook
  const audio = useAudio(audioUrl);

  // Audio recorder for custom voices
  const audioRecorder = useAudioRecorder({
    audioBitsPerSecond: 128000,
  });

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
  ];

  const exampleTexts = [
    "Welcome to VoxWave, where your words come to life with stunning AI voices.",
    "The future of voice technology is here. Experience natural, human-like speech generation.",
    "Create podcasts, audiobooks, and content with professional-quality voice synthesis.",
    "Transform any text into speech that sounds incredibly realistic and engaging.",
    "Join millions of creators who trust VoxWave for their voice generation needs.",
  ];

  // Load voices on component mount
  useEffect(() => {
    loadVoices();
  }, []);

  // Handle recorded audio for custom voices
  useEffect(() => {
    if (audioRecorder.audioBlob && audioRecorder.audioUrl) {
      const recordedVoice: CustomVoice = {
        id: `recorded_${Date.now()}`,
        name: customVoiceName.trim() || `Recorded Voice ${Date.now()}`,
        audioUrl: audioRecorder.audioUrl,
        blob: audioRecorder.audioBlob,
        description: "Recorded custom voice",
      };

      setCustomVoices((prev) => [...prev, recordedVoice]);
      audioRecorder.clearRecording();
      setCustomVoiceName("");
      setShowCustomVoiceUpload(false);
      setSuccess("Custom voice recorded successfully!");
    }
  }, [audioRecorder.audioBlob, audioRecorder.audioUrl, customVoiceName]);

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

  const handleCustomVoiceUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = audioUtils.validateAudioFile(file);
      if (!validation.valid) {
        setError(
          validation.error ||
            "Invalid audio file. Please select a valid audio file (MP3, WAV, M4A, etc.)"
        );
        return;
      }

      setCustomVoiceFile(file);
      setError(null);
    }
  };

  const addCustomVoice = () => {
    if (!customVoiceFile || !customVoiceName.trim()) {
      setError(
        "Please provide both a voice name and audio file to create a custom voice."
      );
      return;
    }

    const customVoice: CustomVoice = {
      id: `custom_${Date.now()}`,
      name: customVoiceName.trim(),
      audioUrl: URL.createObjectURL(customVoiceFile),
      blob: customVoiceFile,
      file: customVoiceFile,
      description: "Custom uploaded voice",
    };

    setCustomVoices((prev) => [...prev, customVoice]);
    setSelectedVoice(customVoice.id);
    setCustomVoiceName("");
    setCustomVoiceFile(null);
    setShowCustomVoiceUpload(false);
    setSuccess(
      "Custom voice added successfully! You can now use it for text-to-speech generation."
    );

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeCustomVoice = (voiceId: string) => {
    const voice = customVoices.find((v) => v.id === voiceId);
    if (voice) {
      URL.revokeObjectURL(voice.audioUrl);
    }

    setCustomVoices((prev) => prev.filter((v) => v.id !== voiceId));

    if (selectedVoice === voiceId) {
      setSelectedVoice(voices.length > 0 ? voices[0].voice_id : "");
    }

    setSuccess("Custom voice removed successfully.");
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some text to convert to speech.");
      return;
    }

    if (!selectedVoice) {
      setError("Please select a voice for speech generation.");
      return;
    }

    if (text.length > 5000) {
      setError("Text is too long. Please keep it under 5,000 characters.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if it's a custom voice
      const customVoice = customVoices.find((v) => v.id === selectedVoice);

      if (customVoice) {
        // For custom voices, we'd need to create a voice clone first
        // For now, show a helpful message
        setError(
          "Custom voice text-to-speech is coming soon! For now, please use one of our premium AI voices."
        );
        return;
      }

      const response: TtsResponse = await ttsApi.generateSpeech({
        text: text.trim(),
        voiceId: selectedVoice,
        options: {
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style: 0.0,
            use_speaker_boost: true,
          },
        },
      });

      if (response.success) {
        setGeneratedAudio(response.data);

        // Fetch the audio as blob for better handling
        const audioResponse = await fetch(
          `${API_BASE_URL}${response.data.audioUrl}`
        );
        if (!audioResponse.ok) {
          throw new Error(
            "Unable to download the generated audio. Please try again."
          );
        }

        const blob = await audioResponse.blob();

        // Clean up previous audio URL
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        const blobUrl = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(blobUrl);
        setSuccess(
          `Speech generated successfully! Audio file: ${response.data.filename}`
        );

        console.log("Speech generated successfully:", response.data.filename);
      } else {
        throw new Error(
          "Speech generation failed on the server. Please try again."
        );
      }
    } catch (error) {
      console.error("Error generating speech:", error);

      let userFriendlyMessage = "Unable to generate speech. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("quota")) {
          userFriendlyMessage =
            "You've reached your usage limit. Please upgrade your plan or try again later.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          userFriendlyMessage =
            "Network connection issue. Please check your internet connection and try again.";
        } else if (error.message.includes("voice")) {
          userFriendlyMessage =
            "The selected voice is not available. Please choose a different voice.";
        } else {
          userFriendlyMessage = error.message;
        }
      }

      setError(userFriendlyMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!audioBlob || !generatedAudio) {
      setError("No audio available to download. Please generate speech first.");
      return;
    }

    try {
      audioUtils.downloadBlob(
        audioBlob,
        generatedAudio.filename || "voxwave-speech.mp3"
      );
      setSuccess("Audio downloaded successfully!");
    } catch (error) {
      console.error("Error downloading audio:", error);
      setError(
        "Unable to download audio. Please try again or check your browser settings."
      );
    }
  };

  const copyText = () => {
    if (!text.trim()) {
      setError("No text to copy. Please enter some text first.");
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSuccess("Text copied to clipboard!");
      })
      .catch(() => {
        setError(
          "Unable to copy text. Please try selecting and copying manually."
        );
      });
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  // Format duration helper
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
  // Reverse the entire array so last voice appears first
  return allVoices.reverse();
};

const scrollToSelectedVoice = () => {
  if (voicesContainerRef.current && selectedVoice) {
    const selectedElement = voicesContainerRef.current.querySelector(
      `[data-voice-id="${selectedVoice}"]`
    );
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
};

useEffect(() => {
  if (!isLoadingVoices && selectedVoice) {
    setTimeout(() => {
      scrollToSelectedVoice();
    }, 1000);
  }
}, [isLoadingVoices, selectedVoice]);


  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      customVoices.forEach((voice) => {
        URL.revokeObjectURL(voice.audioUrl);
      });
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-16 transition-colors duration-300 mt-5 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`border-b transition-colors duration-300 ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Text to Speech</h1>
              <p
                className={`transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Convert your text into natural-sounding speech
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`p-4 rounded-xl transition-colors duration-300 ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-400">
                {text.length}
              </div>
              <div
                className={`text-sm transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Characters
              </div>
            </div>
            <div
              className={`p-4 rounded-xl transition-colors duration-300 ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-400">
                ~{Math.ceil(text.length / 200)}
              </div>
              <div
                className={`text-sm transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Minutes
              </div>
            </div>
            <div
              className={`p-4 rounded-xl transition-colors duration-300 ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-400">
                {getAllVoices().find((v) => v.voice_id === selectedVoice)
                  ?.name || "None"}
              </div>
              <div
                className={`text-sm transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Selected Voice
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {(error || audio.error) && (
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error || audio.error}</span>
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

      {/* Success Banner */}
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Text Input */}
            <div
              className={`p-6 rounded-2xl border-2 transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Enter Your Text</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={copyText}
                    className={`p-2 rounded-lg transition-colors duration-300 ${
                      theme === "dark"
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    title="Copy text"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className={`w-full h-48 p-4 rounded-xl border-2 transition-colors duration-300 resize-none ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                } focus:border-green-500 focus:outline-none`}
              />

              {/* Character count and limit warning */}
              <div className="flex justify-between items-center mt-2">
                <div
                  className={`text-sm ${
                    text.length > 4500
                      ? "text-orange-400"
                      : text.length > 5000
                      ? "text-red-400"
                      : theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  {text.length}/5,000 characters
                </div>
                {text.length > 4500 && (
                  <div className="text-sm text-orange-400">
                    {text.length > 5000
                      ? "Text too long!"
                      : "Approaching character limit"}
                  </div>
                )}
              </div>

              {/* Example Texts */}
              <div className="mt-4">
                <p
                  className={`text-sm mb-2 transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Try these examples:
                </p>
                <div className="flex flex-wrap gap-2">
                  {exampleTexts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setText(example)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors duration-300 ${
                        theme === "dark"
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      Example {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated Audio */}
            {audioUrl && generatedAudio && (
              <div
                className={`p-6 rounded-2xl border-2 transition-colors duration-300 ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">Generated Audio</h2>

                <div
                  className={`p-6 rounded-xl mb-4 transition-colors duration-300 ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={audio.togglePlay}
                        disabled={
                          !audio.canPlay || audio.isLoading || isGenerating
                        }
                        className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-black hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {audio.isLoading ? (
                          <Loader className="w-6 h-6 animate-spin" />
                        ) : audio.isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </button>
                      <div>
                        <div className="font-medium text-lg">
                          Generated Speech
                        </div>
                        <div
                          className={`text-sm transition-colors duration-300 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Voice:{" "}
                          {getAllVoices().find(
                            (v) => v.voice_id === selectedVoice
                          )?.name || "Unknown"}
                          {audio.duration > 0 && (
                            <span>
                              {" "}
                              • {audioUtils.formatDuration(audio.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {generatedAudio.characterCount} chars
                        </div>
                        <div className="text-xs text-gray-500">
                          {audioUtils.formatFileSize(generatedAudio.fileSize)}
                        </div>
                      </div>
                      <button
                        onClick={handleDownload}
                        disabled={!audioBlob}
                        className={`p-3 rounded-lg transition-colors duration-300 disabled:opacity-50 ${
                          theme === "dark"
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        title="Download Audio"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Audio Progress Bar */}
                  {audio.duration > 0 && (
                    <div className="space-y-2 mb-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                          audio.duration > 0
                            ? (audio.currentTime / audio.duration) * 100
                            : 0
                        }
                        onChange={(e) => {
                          const newTime =
                            (parseFloat(e.target.value) / 100) * audio.duration;
                          audio.seek(newTime);
                        }}
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>
                          {audioUtils.formatDuration(audio.currentTime)}
                        </span>
                        <span>{audioUtils.formatDuration(audio.duration)}</span>
                      </div>
                    </div>
                  )}

                  {/* Audio Waveform Visualization */}
                  <div className="h-16 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 bg-green-400 rounded-full transition-all duration-75 ${
                            audio.isPlaying ? "animate-pulse" : ""
                          }`}
                          style={{
                            height: `${Math.random() * 40 + 8}px`,
                            opacity: audio.isPlaying ? 0.8 : 0.3,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Voice Selection */}
            <div
              className={`p-6 rounded-2xl border-2 transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Voice Selection
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
                  className={`p-4 rounded-lg mb-4 transition-colors duration-300 ${
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
                      className={`w-full p-2 rounded-lg border transition-colors duration-300 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />

                    {/* Upload option */}
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleCustomVoiceUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 p-2 rounded-lg border-2 border-dashed transition-colors duration-300 ${
                          theme === "dark"
                            ? "border-gray-600 hover:border-green-500"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        <Upload className="w-4 h-4 inline mr-2" />
                        {customVoiceFile
                          ? customVoiceFile.name
                          : "Upload voice sample"}
                      </button>
                    </div>

                    {/* Recording option */}
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-2">OR</div>
                      <button
                        onClick={
                          audioRecorder.isRecording
                            ? audioRecorder.stopRecording
                            : audioRecorder.startRecording
                        }
                        disabled={!audioRecorder.isSupported}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
                          audioRecorder.isRecording
                            ? "bg-red-500 hover:bg-red-600 animate-pulse"
                            : "bg-gradient-to-r from-green-400 to-green-600 hover:shadow-lg hover:shadow-green-500/25"
                        }`}
                      >
                        {audioRecorder.isRecording ? (
                          <MicOff className="w-5 h-5 text-white" />
                        ) : (
                          <Mic className="w-5 h-5 text-black" />
                        )}
                      </button>

                      {audioRecorder.isRecording && (
                        <div className="mt-2 flex items-center justify-center space-x-2">
                          <Clock className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400">
                            Recording: {formatDuration(audioRecorder.duration)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={addCustomVoice}
                        disabled={
                          !customVoiceName.trim() ||
                          (!customVoiceFile && !audioRecorder.audioBlob)
                        }
                        className="flex-1 bg-green-500 text-black px-3 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Voice
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomVoiceUpload(false);
                          setCustomVoiceName("");
                          setCustomVoiceFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className={`px-3 py-2 rounded-lg transition-colors duration-300 ${
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

            {/* Language Selection */}
            <div
              className={`p-6 rounded-2xl border-2 transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4">Language</h3>
              <select
                className={`w-full p-3 rounded-xl border-2 transition-colors duration-300 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                } focus:border-green-500 focus:outline-none`}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Settings */}
            <div
              className={`p-6 rounded-2xl border-2 transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Voice Settings
              </h3>

              <div className="space-y-4">
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
                    Enhances similarity to the original voice
                  </p>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={
                !text.trim() ||
                !selectedVoice ||
                isGenerating ||
                isLoadingVoices ||
                text.length > 5000
              }
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Generate Speech</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechPage;
