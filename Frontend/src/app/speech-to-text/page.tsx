"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Play,
  Pause,
  Download,
  Upload,
  Mic,
  MicOff,
  FileText,
  Copy,
  Settings,
  Trash2,
  Clock,
  Users,
  Loader,
  CheckCircle,
  Volume2,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAudio } from "@/hooks/useAudio";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { audioUtils } from "@/lib/api";

// Updated API functions for STT
const sttApi = {
  async transcribeAudio(formData: FormData) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
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
  },

  async getTranscriptionInfo() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${API_BASE_URL}/api/stt/info`);
    
    if (!response.ok) {
      throw new Error('Failed to get transcription info');
    }
    
    return await response.json();
  }
};

const SpeechToTextPage = () => {
  const { theme, mounted } = useTheme();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [includeTimestamps, setIncludeTimestamps] = useState(false);
  const [speakerDiarization, setSpeakerDiarization] = useState(false);
  const [enhanceAudio, setEnhanceAudio] = useState(true);
  const [confidence, setConfidence] = useState(0);
  const [transcriptionResult, setTranscriptionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState<any[]>([]);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio hooks
  const audio = useAudio(audioUrl);
  const audioRecorder = useAudioRecorder({
    audioBitsPerSecond: 128000
  });

  // Load supported languages and info on mount
  useEffect(() => {
    loadTranscriptionInfo();
  }, []);

  // Handle recorded audio
  useEffect(() => {
    if (audioRecorder.audioBlob && audioRecorder.audioUrl) {
      setUploadedFile(null); // Clear uploaded file when recording
      setAudioUrl(audioRecorder.audioUrl);
      clearTranscriptionResults();
      setError(null);
    }
  }, [audioRecorder.audioBlob, audioRecorder.audioUrl]);

  const loadTranscriptionInfo = async () => {
    try {
      setIsLoadingInfo(true);
      const response = await sttApi.getTranscriptionInfo();
      
      if (response.success) {
        setSupportedLanguages(response.data.supportedLanguages);
      }
    } catch (error) {
      console.error('Error loading transcription info:', error);
      // Fallback languages
      setSupportedLanguages([
        { code: "en-US", name: "English (US)", flag: "🇺🇸" },
        { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
        { code: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸" },
        { code: "fr-FR", name: "French (France)", flag: "🇫🇷" },
        { code: "de-DE", name: "German", flag: "🇩🇪" },
      ]);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = audioUtils.validateAudioFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      
      setUploadedFile(file);
      audioRecorder.clearRecording(); // Clear recording when uploading
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      clearTranscriptionResults();
      setError(null);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      const validation = audioUtils.validateAudioFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      
      setUploadedFile(file);
      audioRecorder.clearRecording();
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      clearTranscriptionResults();
      setError(null);
    }
  }, [audioRecorder]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleTranscribe = async () => {
    if (!audioUrl) {
      setError('Please upload an audio file or record your voice');
      return;
    }

    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Add the audio file
      if (uploadedFile) {
        formData.append('audio', uploadedFile);
      } else if (audioRecorder.audioBlob) {
        formData.append('audio', audioRecorder.audioBlob, 'recorded-audio.webm');
      } else {
        throw new Error('No audio file available');
      }
      
      // Add transcription options
      formData.append('language', selectedLanguage);
      formData.append('includeTimestamps', includeTimestamps.toString());
      formData.append('speakerDiarization', speakerDiarization.toString());
      formData.append('enhanceAudio', enhanceAudio.toString());
      
      console.log('Transcribing audio with options:', {
        language: selectedLanguage,
        includeTimestamps,
        speakerDiarization,
        enhanceAudio
      });
      
      const response = await sttApi.transcribeAudio(formData);
      
      if (response.success) {
        setTranscriptionResult(response.data);
        setTranscription(response.data.transcription);
        setConfidence(response.data.confidence);
        setError(null);
        
        console.log('Transcription completed successfully');
      } else {
        throw new Error('Transcription failed');
      }
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setError(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyTranscription = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy transcription:', error);
    }
  };

  const downloadTranscription = () => {
    if (!transcription) return;
    
    const blob = new Blob([transcription], { type: "text/plain" });
    audioUtils.downloadBlob(blob, `voxwave-transcription-${Date.now()}.txt`);
  };

  const clearTranscriptionResults = () => {
    setTranscription("");
    setTranscriptionResult(null);
    setConfidence(0);
    setError(null);
  };

  const clearAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setUploadedFile(null);
    setAudioUrl(null);
    audioRecorder.clearRecording();
    clearTranscriptionResults();
  };

  const clearError = () => {
    setError(null);
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Speech to Text</h1>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Convert spoken words into accurate written text
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              className={`p-4 rounded-xl ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-400">
                {transcription.length}
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Characters
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-400">
                {transcription.split(" ").filter((w) => w).length}
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Words
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-400">
                {Math.round(confidence * 100)}%
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Confidence
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-400">
                {supportedLanguages.find((l) => l.code === selectedLanguage)?.flag ||
                  "🌐"}
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Language
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {(error || audio.error || audioRecorder.error) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">
                {error || audio.error || audioRecorder.error}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h2 className="text-xl font-semibold mb-6">Audio Input</h2>

              {!audioUrl ? (
                <div className="space-y-6">
                  {/* File Upload */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? 'border-green-500 bg-green-500/10' 
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
                          onClick={audioRecorder.isRecording ? audioRecorder.stopRecording : audioRecorder.startRecording}
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
                              <span>Recording: {formatDuration(audioRecorder.duration)}</span>
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
                /* Audio Player */
                <div
                  className={`p-6 rounded-xl ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={audio.play}
                        disabled={!audio.canPlay || audio.isLoading}
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
                        <div className="font-medium text-lg">Audio File</div>
                        <div
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {uploadedFile ? uploadedFile.name : "Recorded Audio"}
                          {audio.duration > 0 && (
                            <span> • {audioUtils.formatDuration(audio.duration)}</span>
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
                  {audio.duration > 0 && (
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0}
                        onChange={(e) => audio.seek((parseFloat(e.target.value) / 100) * audio.duration)}
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>{audioUtils.formatDuration(audio.currentTime)}</span>
                        <span>{audioUtils.formatDuration(audio.duration)}</span>
                      </div>
                    </div>
                  )}

                  {/* Waveform Visualization */}
                  <div className="h-20 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 bg-green-400 rounded-full transition-all duration-75 ${
                            audio.isPlaying ? 'animate-pulse' : ''
                          }`}
                          style={{ 
                            height: `${Math.random() * 50 + 10}px`,
                            opacity: audio.isPlaying ? 0.8 : 0.4
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

            {/* Transcription Results */}
            <div
              className={`p-6 rounded-2xl border-2 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Transcription</h2>
                {transcription && (
                  <div className="flex space-x-2">
                    <button
                      onClick={copyTranscription}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      } transition-colors`}
                      title="Copy transcription"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={downloadTranscription}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      } transition-colors`}
                      title="Download transcription"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div
                className={`min-h-48 p-4 rounded-xl border-2 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                {isTranscribing ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center space-x-3">
                      <Loader className="w-6 h-6 animate-spin text-green-400" />
                      <span
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Transcribing audio...
                      </span>
                    </div>
                  </div>
                ) : transcription ? (
                  <div className="space-y-4">
                    <div
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      } leading-relaxed whitespace-pre-wrap`}
                    >
                      {transcription}
                    </div>

                    {/* Result Info */}
                    {transcriptionResult && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-300">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-medium">
                            Transcription Complete
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>
                            Confidence: {Math.round(confidence * 100)}%
                          </span>
                          <span>
                            Words: {transcriptionResult.wordCount || 0}
                          </span>
                          {transcriptionResult.duration && (
                            <span>
                              Duration: {audioUtils.formatDuration(transcriptionResult.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }
                    >
                      Upload an audio file or record your voice to start
                      transcription
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Language Selection */}
            <div
              className={`p-6 rounded-2xl border-2 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4">Language</h3>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isLoadingInfo}
                className={`w-full p-3 rounded-xl border-2 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                } focus:border-green-500 focus:outline-none disabled:opacity-50`}
              >
                {isLoadingInfo ? (
                  <option>Loading languages...</option>
                ) : (
                  supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Transcription Options */}
            <div
              className={`p-6 rounded-2xl border-2 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Options
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <label className="text-sm font-medium">
                      Include Timestamps
                    </label>
                  </div>
                  <button
                    onClick={() => setIncludeTimestamps(!includeTimestamps)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      includeTimestamps ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        includeTimestamps ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <label className="text-sm font-medium">
                      Speaker Identification
                    </label>
                  </div>
                  <button
                    onClick={() => setSpeakerDiarization(!speakerDiarization)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      speakerDiarization ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        speakerDiarization ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <label className="text-sm font-medium">
                      Enhance Audio
                    </label>
                  </div>
                  <button
                    onClick={() => setEnhanceAudio(!enhanceAudio)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      enhanceAudio ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        enhanceAudio ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Transcribe Button */}
            <button
              onClick={handleTranscribe}
              disabled={!audioUrl || isTranscribing}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isTranscribing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Transcribing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Start Transcription</span>
                </>
              )}
            </button>

            {/* Success Message */}
            {transcriptionResult && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="text-green-400 text-sm">
                  <div>Transcription completed!</div>
                  <div className="text-xs text-green-400/70">
                    {transcriptionResult.wordCount} words • {Math.round(confidence * 100)}% confidence
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToTextPage;