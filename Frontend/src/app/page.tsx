"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Play,
  Pause,
  Star,
  Sparkles,
  Volume2,
  Mic,
  FileText,
  Waves,
  Zap,
  Shield,
  Globe,
  Users,
  CheckCircle,
  TrendingUp,
  Award,
  Headphones,
  Cpu,
  Brain,
  Rocket,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Clock,
  Layers,
  MessageSquare,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { demoApi, type DemoAudio } from "@/lib/api";
import { useAudio } from "@/hooks/useAudio";

// Platform features - comprehensive list
const platformFeatures = [
  {
    id: "text-to-speech",
    title: "Text to Speech",
    icon: FileText,
    description: "Convert written text into natural-sounding speech with 150+ AI voices",
    features: [
      "150+ Premium Voices",
      "50+ Languages", 
      "SSML Support",
      "Custom Voice Upload",
    ],
    color: "from-green-400 to-green-600",
    href: "/text-to-speech",
  },
  {
    id: "speech-to-speech",
    title: "Speech to Speech",
    icon: Waves,
    description: "Transform existing audio with different voices while preserving emotion",
    features: [
      "Voice Cloning",
      "Emotion Preservation",
      "Real-time Processing",
      "High Quality Output",
    ],
    color: "from-blue-400 to-blue-600",
    href: "/speech-to-speech",
  },
  {
    id: "speech-to-text",
    title: "Speech to Text",
    icon: Mic,
    description: "Convert spoken words into accurate written text with advanced AI",
    features: [
      "99% Accuracy",
      "Speaker Detection",
      "Timestamps",
      "Multiple Formats",
    ],
    color: "from-purple-400 to-purple-600",
    href: "/speech-to-text",
  },
  {
    id: "voice-studio",
    title: "Voice Studio",
    icon: Settings,
    description: "Create custom AI voices from just one audio sample",
    features: [
      "1-Click Voice Cloning",
      "Professional Quality",
      "Custom Training",
      "Voice Library",
    ],
    color: "from-pink-400 to-pink-600",
    href: "/voice-studio",
  },
  {
    id: "voice-effects",
    title: "Voice Effects",
    icon: Layers,
    description: "Add professional effects and filters to any voice",
    features: [
      "Real-time Effects",
      "Voice Modulation",
      "Audio Enhancement",
      "Background Removal",
    ],
    color: "from-orange-400 to-orange-600",
    href: "/voice-effects",
  },
];

// Trust indicators
const trustIndicators = [
  { metric: "99.9%", label: "Uptime", icon: Zap },
  { metric: "150+", label: "Languages", icon: Globe },
];

export default function LandingPage() {
  const { theme, mounted } = useTheme();

  // Demo audio states
  const [demoAudios, setDemoAudios] = useState<DemoAudio[]>([]);
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);
  const [isLoadingDemo, setIsLoadingDemo] = useState(true);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  const isHeroInView = useInView(heroRef, { once: true });
  const isFeaturesInView = useInView(featuresRef, { once: true });

  // Get current demo audio URL
  const currentAudioUrl = demoAudios[currentDemoIndex]?.file_url
    ? `${process.env.NEXT_PUBLIC_API_URL}${demoAudios[currentDemoIndex].file_url}`
    : null;

  // Use audio hook for real playback
  const audio = useAudio(currentAudioUrl);

  // Load demo audio on component mount
  useEffect(() => {
    loadDemoAudio();
  }, []);

  // Auto-rotate demo text every 4 seconds (only when not playing)
  useEffect(() => {
    if (demoAudios.length === 0 || audio.isPlaying) return;

    const interval = setInterval(() => {
      setCurrentDemoIndex((prev) => (prev + 1) % demoAudios.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [demoAudios.length, audio.isPlaying]);

  // Handle audio initialization on first user interaction
  const initializeAudio = async () => {
    if (!audioInitialized && currentAudioUrl) {
      setAudioInitialized(true);
      console.log("🎵 Audio system initialized");
    }
  };

  const loadDemoAudio = async () => {
    try {
      setIsLoadingDemo(true);
      setDemoError(null);

      console.log("📡 Loading demo audio from backend...");
      const response = await demoApi.getDemoAudio();

      if (response.success && response.data.demos.length > 0) {
        setDemoAudios(response.data.demos);
        console.log(`✅ Loaded ${response.data.demos.length} demo audio files`);
        console.log("🎤 Voice used:", response.data.voice_used);
      } else {
        throw new Error("No demo audio available");
      }
    } catch (error) {
      console.error("❌ Failed to load demo audio:", error);
      setDemoError(
        error instanceof Error ? error.message : "Failed to load demo audio"
      );

      // Fallback to generating demo audio
      await generateDemoAudio();
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const generateDemoAudio = async () => {
    try {
      console.log("🎙️ Generating demo audio...");
      setDemoError(null);

      const response = await demoApi.generateDemoAudio();

      if (response.success) {
        setDemoAudios(response.data.generated);
        console.log(`✅ Generated ${response.data.total} demo audio files`);
      } else {
        throw new Error("Failed to generate demo audio");
      }
    } catch (error) {
      console.error("❌ Failed to generate demo audio:", error);
      setDemoError(
        "Failed to generate demo audio. Please check your backend connection."
      );
    }
  };

  // Handle voice playback
  const handlePlayVoice = async () => {
    await initializeAudio();

    if (audio.isPlaying) {
      audio.pause();
    } else {
      await audio.play();
    }
  };

  // Get current demo text
  const getCurrentDemoText = () => {
    if (demoAudios.length === 0) {
      return "Transform your words into powerful speech with AI";
    }
    return demoAudios[currentDemoIndex]?.text || "Loading demo text...";
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 mt-5 ${
        theme === "dark"
          ? "bg-gradient-to-br from-black via-gray-900 to-black text-white"
          : "bg-gradient-to-br from-white via-gray-50 to-white text-gray-900"
      } overflow-hidden`}
    >
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20"
        style={{ opacity: heroOpacity }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div
            className={`absolute top-20 left-10 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 rounded-full blur-3xl animate-pulse-glow ${
              theme === "dark" ? "bg-green-500/20" : "bg-green-500/10"
            }`}
          ></div>
          <div
            className={`absolute bottom-20 right-10 sm:right-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-3xl animate-float ${
              theme === "dark" ? "bg-blue-500/10" : "bg-blue-500/5"
            }`}
          ></div>
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] rounded-full ${
              theme === "dark"
                ? "bg-gradient-radial from-green-500/5 to-transparent"
                : "bg-gradient-radial from-green-500/3 to-transparent"
            }`}
          ></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side - Content */}
            <motion.div
              className="text-center lg:text-left space-y-6 lg:space-y-8 order-1 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Badge */}
              <motion.div
                className={`inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full border text-sm sm:text-base ${
                  theme === "dark"
                    ? "glass border-green-500/30"
                    : "bg-white border-green-500/30 shadow-lg"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="font-semibold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  #1 AI Voice Platform
                </span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </motion.div>

              {/* Main Headline */}
              <div className="space-y-4">
                <motion.h1
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Transform{" "}
                  <span className="gradient-neon animate-pulse-glow">
                    Voice
                  </span>
                  <br />
                  with AI Magic
                </motion.h1>

                <motion.p
                  className={`text-base sm:text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto lg:mx-0 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  Experience the future of voice technology. Create natural
                  speech, clone voices, and transform audio with cutting-edge AI
                  powered by VoxWave.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <Link href="/text-to-speech" className="w-full sm:w-auto">
                  <button className="btn-primary group w-full sm:w-auto">
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                    Start Creating Now
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>

                <button
                  onClick={handlePlayVoice}
                  disabled={isLoadingDemo || !currentAudioUrl}
                  className={`btn-secondary group w-full sm:w-auto ${
                    theme === "dark"
                      ? "bg-gray-800/50 border-green-500 text-white hover:bg-green-500 hover:text-black"
                      : "bg-white border-green-500 text-gray-900 hover:bg-green-500 hover:text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoadingDemo ? (
                    <Loader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : audio.isPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="hidden sm:inline">
                    {isLoadingDemo
                      ? "Loading..."
                      : audio.isPlaying
                      ? "Stop Demo"
                      : "Hear Elon's Voice"}
                  </span>
                  <span className="sm:hidden">
                    {isLoadingDemo
                      ? "Loading..."
                      : audio.isPlaying
                      ? "Stop"
                      : "Demo"}
                  </span>
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-2 gap-4 lg:gap-6 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                {trustIndicators.map((item, index) => (
                  <div key={index} className="text-center">
                    <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl sm:text-3xl font-bold gradient-text">
                      {item.metric}
                    </div>
                    <div
                      className={`text-xs sm:text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side - Interactive Demo */}
            <motion.div
              className="relative order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Main Demo Container */}
              <div
                className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden ${
                  theme === "dark"
                    ? "glass-strong"
                    : "bg-white border-2 border-gray-200 shadow-2xl"
                }`}
              >
                {/* Background Pattern */}
                <div
                  className={`absolute inset-0 rounded-2xl sm:rounded-3xl ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-green-500/10 to-blue-500/5"
                      : "bg-gradient-to-br from-green-500/5 to-blue-500/3"
                  }`}
                ></div>

                <div className="relative space-y-4 sm:space-y-6">
                  {/* Demo Header */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Live Voice Synthesis
                      </h3>
                      <p
                        className={`text-sm sm:text-base ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Experience Elon Musk's AI voice in real-time
                      </p>
                    </div>
                    <motion.button
                      onClick={handlePlayVoice}
                      disabled={isLoadingDemo || !currentAudioUrl}
                      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-green-400 to-green-500 text-black rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isLoadingDemo ? (
                        <Loader className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 animate-spin" />
                      ) : audio.isLoading ? (
                        <Loader className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 animate-spin" />
                      ) : audio.isPlaying ? (
                        <Pause className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                      ) : (
                        <Play className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ml-0.5 sm:ml-1" />
                      )}
                    </motion.button>
                  </div>

                  {/* Error Display */}
                  {(demoError || audio.error) && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center space-x-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                      <span className="text-red-400 text-xs sm:text-sm">
                        {demoError || audio.error}
                      </span>
                    </div>
                  )}

                  {/* Demo Text Display */}
                  <div
                    className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] flex items-center ${
                      theme === "dark"
                        ? "glass"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <motion.p
                      key={currentDemoIndex}
                      className={`text-sm sm:text-base lg:text-lg font-medium leading-relaxed ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      "{getCurrentDemoText()}"
                    </motion.p>
                  </div>

                  {/* Audio Visualizer */}
                  <div
                    className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 ${
                      theme === "dark"
                        ? "glass"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="audio-visualizer">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div
                          key={i}
                          className={`audio-bar ${
                            audio.isPlaying ? "active" : ""
                          }`}
                          style={{
                            height: audio.isPlaying
                              ? `${Math.random() * 30 + 8}px`
                              : "6px",
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Voice Info */}
                  <div className="grid grid-cols-1 gap-3">
                    <div
                      className={`p-3 sm:p-4 rounded-lg sm:rounded-xl text-center ${
                        theme === "dark"
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-green-50 border border-green-200"
                      }`}
                    >
                      <div
                        className={`font-medium text-sm sm:text-base ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        🎤 Elon Musk's Voice
                      </div>
                      <div
                        className={`text-xs sm:text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Generated using VoxWave
                      </div>
                      {audio.duration > 0 && (
                        <div className="text-xs text-green-400 mt-1">
                          Duration: {Math.round(audio.duration)}s
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Feature Cards - Hidden on mobile for cleaner look */}
              <motion.div
                className={`hidden sm:block absolute -top-4 -right-4 lg:-top-6 lg:-right-6 rounded-xl lg:rounded-2xl p-3 lg:p-4 border ${
                  theme === "dark"
                    ? "glass border-green-500/30"
                    : "bg-white border-green-500/30 shadow-lg"
                }`}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400" />
                  <div>
                    <div
                      className={`font-bold text-sm lg:text-base ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Instant
                    </div>
                    <div
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      &lt; 2 seconds
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={`hidden sm:block absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 rounded-xl lg:rounded-2xl p-3 lg:p-4 border ${
                  theme === "dark"
                    ? "glass border-blue-500/30"
                    : "bg-white border-blue-500/30 shadow-lg"
                }`}
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  <Brain className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400" />
                  <div>
                    <div
                      className={`font-bold text-sm lg:text-base ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      AI-Powered
                    </div>
                    <div
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      VoxWave
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Platform Features Section */}
      <motion.section
        ref={featuresRef}
        className={`section-padding px-4 sm:px-6 lg:px-8 relative ${
          theme === "dark" ? "bg-gray-900/50" : "bg-gray-50/50"
        }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Complete <span className="gradient-neon">AI Voice</span> Platform
            </h2>
            <p
              className={`text-lg sm:text-xl max-w-3xl mx-auto ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Everything you need to create, transform, and perfect voice
              content with cutting-edge AI technology
            </p>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  className={`group relative overflow-hidden rounded-xl lg:rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gray-800/50 border border-gray-700 hover:border-green-500/50"
                      : "bg-white border border-gray-200 hover:border-green-500/50 shadow-lg hover:shadow-xl"
                  }`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  ></div>

                  <div className="relative z-10">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-6 bg-gradient-to-br ${feature.color}`}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                    </div>

                    <h3
                      className={`text-xl lg:text-2xl font-bold mb-3 lg:mb-4 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </h3>

                    <p
                      className={`mb-4 lg:mb-6 leading-relaxed text-sm sm:text-base ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {feature.description}
                    </p>

                    {/* Feature highlights */}
                    <div className="space-y-2 mb-4 lg:mb-6">
                      {feature.features.map((featureItem, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                          <span
                            className={`text-xs sm:text-sm ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                            }`}
                          >
                            {featureItem}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link href={feature.href} className="block">
                      <button
                        className={`w-full py-3 rounded-lg sm:rounded-xl font-semibold transition-all group-hover:scale-105 text-sm sm:text-base ${
                          theme === "dark"
                            ? "bg-gray-700 hover:bg-green-500/20 text-white border border-gray-600 hover:border-green-500"
                            : "bg-gray-100 hover:bg-green-500/10 text-gray-900 border border-gray-200 hover:border-green-500"
                        }`}
                      >
                        Try {feature.title}
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 inline ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section
        className={`section-padding px-4 sm:px-6 lg:px-8 relative overflow-hidden ${
          theme === "dark" ? "" : "bg-white"
        }`}
      >
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-gradient-to-r from-green-500/10 via-blue-500/5 to-purple-500/10"
              : "bg-gradient-to-r from-green-500/5 via-blue-500/3 to-purple-500/5"
          }`}
        ></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Ready to Transform Your{" "}
              <span className="gradient-neon">Voice?</span>
            </h2>
            <p
              className={`text-lg sm:text-xl mb-6 lg:mb-8 max-w-2xl mx-auto ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Join millions of creators, businesses, and developers who trust
              VoxWave for their voice AI needs. Start creating today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link href="/text-to-speech" className="w-full sm:w-auto">
                <button className="btn-primary group text-lg px-6 lg:px-8 py-4 lg:py-5 w-full sm:w-auto">
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                  Start Creating for Free
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { motion, useScroll, useTransform, useInView } from "framer-motion";
// import {
//   ArrowRight,
//   Play,
//   Pause,
//   Star,
//   Sparkles,
//   Volume2,
//   Mic,
//   FileText,
//   Waves,
//   Zap,
//   Shield,
//   Globe,
//   Users,
//   CheckCircle,
//   TrendingUp,
//   Award,
//   Headphones,
//   Cpu,
//   Brain,
//   Rocket,
//   RefreshCw,
//   Settings,
//   Download,
//   Upload,
//   Clock,
//   Layers,
//   MessageSquare,
// } from "lucide-react";
// import { useTheme } from "@/components/ThemeProvider";

// // Demo voice options with realistic examples
// const demoVoices = [
//   {
//     id: "elon",
//     name: "Elon Musk",
//     description: "Tech Visionary",
//     accent: "South African-American",
//     isDefault: true,
//   },
//   {
//     id: "trump",
//     name: "Donald Trump",
//     description: "Political Leader",
//     accent: "American",
//     isDefault: true,
//   },
//   {
//     id: "sarah",
//     name: "Sarah",
//     description: "Professional & Clear",
//     accent: "American",
//     isDefault: false,
//   },
//   {
//     id: "david",
//     name: "David",
//     description: "Warm & Friendly",
//     accent: "British",
//     isDefault: false,
//   },
// ];

// // Demo text options
// const demoTexts = [
//   "Welcome to VoxWave, the future of AI voice technology.",
//   "Transform any text into natural, human-like speech instantly.",
//   "Experience the power of artificial intelligence in voice generation.",
//   "Create custom voices that sound incredibly realistic and engaging.",
//   "The possibilities are endless with VoxWave's advanced AI platform.",
// ];

// // Platform features - comprehensive list
// const platformFeatures = [
//   {
//     id: "text-to-speech",
//     title: "Text to Speech",
//     icon: FileText,
//     description: "Convert written text into natural-sounding speech with 150+ AI voices",
//     features: ["150+ Premium Voices", "50+ Languages", "SSML Support", "Custom Voice Upload"],
//     color: "from-green-400 to-green-600",
//     href: "/text-to-speech"
//   },
//   {
//     id: "speech-to-speech",
//     title: "Speech to Speech",
//     icon: Waves,
//     description: "Transform existing audio with different voices while preserving emotion",
//     features: ["Voice Cloning", "Emotion Preservation", "Real-time Processing", "High Quality Output"],
//     color: "from-blue-400 to-blue-600",
//     href: "/speech-to-speech"
//   },
//   {
//     id: "speech-to-text",
//     title: "Speech to Text",
//     icon: Mic,
//     description: "Convert spoken words into accurate written text with advanced AI",
//     features: ["99% Accuracy", "Speaker Detection", "Timestamps", "Multiple Formats"],
//     color: "from-purple-400 to-purple-600",
//     href: "/speech-to-text"
//   },
//   {
//     id: "voice-studio",
//     title: "Voice Studio",
//     icon: Settings,
//     description: "Create custom AI voices from just one audio sample",
//     features: ["1-Click Voice Cloning", "Professional Quality", "Custom Training", "Voice Library"],
//     color: "from-pink-400 to-pink-600",
//     href: "/voice-studio"
//   },
//   {
//     id: "voice-effects",
//     title: "Voice Effects",
//     icon: Layers,
//     description: "Add professional effects and filters to any voice",
//     features: ["Real-time Effects", "Voice Modulation", "Audio Enhancement", "Background Removal"],
//     color: "from-orange-400 to-orange-600",
//     href: "/voice-effects"
//   },
//   {
//     id: "api-integration",
//     title: "API Integration",
//     icon: Cpu,
//     description: "Integrate VoxWave's power directly into your applications",
//     features: ["REST API", "WebSocket Support", "SDKs Available", "Scalable Infrastructure"],
//     color: "from-indigo-400 to-indigo-600",
//     href: "/api"
//   }
// ];

// // Trust indicators
// const trustIndicators = [
//   { metric: "50M+", label: "Voices Generated", icon: Volume2 },
//   { metric: "99.9%", label: "Uptime", icon: Zap },
//   { metric: "150+", label: "Languages", icon: Globe },
//   { metric: "500K+", label: "Happy Users", icon: Users },
// ];

// export default function LandingPage() {
//   const { theme, mounted } = useTheme();
//   const [currentDemoText, setCurrentDemoText] = useState(0);
//   const [selectedVoice, setSelectedVoice] = useState("elon");
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
//   const [userHasInteracted, setUserHasInteracted] = useState(false);
//   const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

//   const heroRef = useRef<HTMLElement>(null);
//   const featuresRef = useRef<HTMLElement>(null);

//   const { scrollYProgress } = useScroll();
//   const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
//   const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

//   const isHeroInView = useInView(heroRef, { once: true });
//   const isFeaturesInView = useInView(featuresRef, { once: true });

//   // Rotate demo text every 4 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentDemoText((prev) => (prev + 1) % demoTexts.length);
//     }, 4000);
//     return () => clearInterval(interval);
//   }, []);

//   // Initialize audio context on first user interaction
//   const initializeAudio = async () => {
//     if (!audioContext && !userHasInteracted) {
//       try {
//         const ctx = new (window.AudioContext ||
//           (window as any).webkitAudioContext)();
//         setAudioContext(ctx);
//         setUserHasInteracted(true);
//       } catch (error) {
//         console.log("Audio not supported");
//       }
//     }
//   };

//   // Handle voice playback with proper pause functionality
//   const handlePlayVoice = async () => {
//     await initializeAudio();

//     if (isPlaying && currentAudio) {
//       // Pause current audio
//       currentAudio.pause();
//       setIsPlaying(false);
//       return;
//     }

//     // Stop any existing audio
//     if (currentAudio) {
//       currentAudio.pause();
//       currentAudio.currentTime = 0;
//     }

//     try {
//       setIsPlaying(true);

//       // Create mock audio for demo (in real app, this would call TTS API)
//       const audio = new Audio();

//       // Mock audio generation based on voice selection
//       const mockAudioDuration = 3000; // 3 seconds

//       // Simulate voice generation
//       console.log(`Playing voice: ${selectedVoice} - "${demoTexts[currentDemoText]}"`);

//       setCurrentAudio(audio);

//       // Simulate audio playback
//       setTimeout(() => {
//         setIsPlaying(false);
//         setCurrentAudio(null);
//       }, mockAudioDuration);

//     } catch (error) {
//       console.error("Error playing voice:", error);
//       setIsPlaying(false);
//     }
//   };

//   // Cleanup audio on unmount
//   useEffect(() => {
//     return () => {
//       if (currentAudio) {
//         currentAudio.pause();
//       }
//     };
//   }, [currentAudio]);

//   if (!mounted) {
//     return (
//       <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
//         <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen transition-colors duration-300 ${
//       theme === "dark"
//         ? "bg-gradient-to-br from-black via-gray-900 to-black text-white"
//         : "bg-gradient-to-br from-white via-gray-50 to-white text-gray-900"
//     } overflow-hidden`}>

//       {/* Hero Section */}
//       <motion.section
//         ref={heroRef}
//         className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
//         style={{ opacity: heroOpacity }}
//       >
//         {/* Background Effects */}
//         <div className="absolute inset-0">
//           <div className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl animate-pulse-glow ${
//             theme === "dark"
//               ? "bg-green-500/20"
//               : "bg-green-500/10"
//           }`}></div>
//           <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl animate-float ${
//             theme === "dark"
//               ? "bg-blue-500/10"
//               : "bg-blue-500/5"
//           }`}></div>
//           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full ${
//             theme === "dark"
//               ? "bg-gradient-radial from-green-500/5 to-transparent"
//               : "bg-gradient-radial from-green-500/3 to-transparent"
//           }`}></div>
//         </div>

//         <div className="relative z-10 max-w-[100rem] mx-auto">
//           <div className="grid lg:grid-cols-2 gap-16 items-center">
//             {/* Left Side - Content */}
//             <motion.div
//               className="text-center lg:text-left space-y-8"
//               initial={{ opacity: 0, x: -50 }}
//               animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
//               transition={{ duration: 0.8, delay: 0.2 }}
//             >
//               {/* Badge */}
//               <motion.div
//                 className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full border ${
//                   theme === "dark"
//                     ? "glass border-green-500/30"
//                     : "bg-white border-green-500/30 shadow-lg"
//                 }`}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
//                 transition={{ duration: 0.6, delay: 0.4 }}
//               >
//                 <Star className="w-5 h-5 text-yellow-400" />
//                 <span className="text-sm font-semibold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
//                   #1 AI Voice Platform
//                 </span>
//                 <Sparkles className="w-5 h-5 text-green-400" />
//               </motion.div>

//               {/* Main Headline */}
//               <div className="space-y-4">
//                 <motion.h1
//                   className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight ${
//                     theme === "dark" ? "text-white" : "text-gray-900"
//                   }`}
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
//                   transition={{ duration: 0.8, delay: 0.6 }}
//                 >
//                   Transform{" "}
//                   <span className="gradient-neon animate-pulse-glow">
//                     Voice
//                   </span>
//                   <br />
//                   with AI Magic
//                 </motion.h1>

//                 <motion.p
//                   className={`text-xl md:text-2xl max-w-2xl ${
//                     theme === "dark" ? "text-gray-300" : "text-gray-600"
//                   }`}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
//                   transition={{ duration: 0.6, delay: 0.8 }}
//                 >
//                   Experience the future of voice technology. Create natural
//                   speech, clone voices, and transform audio with cutting-edge AI
//                   powered by VoxWave.
//                 </motion.p>
//               </div>

//               {/* CTA Buttons */}
//               <motion.div
//                 className="flex flex-col sm:flex-row gap-6"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
//                 transition={{ duration: 0.6, delay: 1 }}
//               >
//                 <Link href="/text-to-speech">
//                   <button className="btn-primary group">
//                     <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
//                     Start Creating Now
//                     <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
//                   </button>
//                 </Link>

//                 <button
//                   onClick={handlePlayVoice}
//                   className={`btn-secondary group ${
//                     theme === "dark"
//                       ? "bg-gray-800/50 border-green-500 text-white hover:bg-green-500 hover:text-black"
//                       : "bg-white border-green-500 text-gray-900 hover:bg-green-500 hover:text-white"
//                   }`}
//                 >
//                   {isPlaying ? (
//                     <Pause className="w-6 h-6" />
//                   ) : (
//                     <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
//                   )}
//                   {isPlaying ? "Stop Demo" : "Hear the Magic"}
//                 </button>
//               </motion.div>

//               {/* Trust Indicators */}
//               <motion.div
//                 className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
//                 transition={{ duration: 0.6, delay: 1.2 }}
//               >
//                 {trustIndicators.map((item, index) => (
//                   <div key={index} className="text-center">
//                     <item.icon className="w-8 h-8 text-green-400 mx-auto mb-2" />
//                     <div className="text-3xl font-bold gradient-text">
//                       {item.metric}
//                     </div>
//                     <div className={`text-sm ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-600"
//                     }`}>
//                       {item.label}
//                     </div>
//                   </div>
//                 ))}
//               </motion.div>
//             </motion.div>

//             {/* Right Side - Interactive Demo */}
//             <motion.div
//               className="relative"
//               initial={{ opacity: 0, x: 50 }}
//               animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
//               transition={{ duration: 0.8, delay: 0.4 }}
//             >
//               {/* Main Demo Container */}
//               <div className={`rounded-3xl p-8 relative overflow-hidden ${
//                 theme === "dark"
//                   ? "glass-strong"
//                   : "bg-white border-2 border-gray-200 shadow-2xl"
//               }`}>
//                 {/* Background Pattern */}
//                 <div className={`absolute inset-0 rounded-3xl ${
//                   theme === "dark"
//                     ? "bg-gradient-to-br from-green-500/10 to-blue-500/5"
//                     : "bg-gradient-to-br from-green-500/5 to-blue-500/3"
//                 }`}></div>

//                 <div className="relative space-y-6">
//                   {/* Demo Header */}
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className={`text-2xl font-bold mb-2 ${
//                         theme === "dark" ? "text-white" : "text-gray-900"
//                       }`}>
//                         Live Voice Synthesis
//                       </h3>
//                       <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
//                         Experience AI voice generation in real-time
//                       </p>
//                     </div>
//                     <motion.button
//                       onClick={handlePlayVoice}
//                       className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 text-black rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25"
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                     >
//                       {isPlaying ? (
//                         <Pause className="w-8 h-8" />
//                       ) : (
//                         <Play className="w-8 h-8 ml-1" />
//                       )}
//                     </motion.button>
//                   </div>

//                   {/* Demo Text Display */}
//                   <div className={`rounded-2xl p-6 min-h-[120px] flex items-center ${
//                     theme === "dark"
//                       ? "glass"
//                       : "bg-gray-50 border border-gray-200"
//                   }`}>
//                     <motion.p
//                       key={currentDemoText}
//                       className={`text-lg font-medium leading-relaxed ${
//                         theme === "dark" ? "text-white" : "text-gray-900"
//                       }`}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -20 }}
//                       transition={{ duration: 0.5 }}
//                     >
//                       "{demoTexts[currentDemoText]}"
//                     </motion.p>
//                   </div>

//                   {/* Audio Visualizer */}
//                   <div className={`rounded-2xl p-6 ${
//                     theme === "dark"
//                       ? "glass"
//                       : "bg-gray-50 border border-gray-200"
//                   }`}>
//                     <div className="audio-visualizer">
//                       {Array.from({ length: 20 }).map((_, i) => (
//                         <div
//                           key={i}
//                           className={`audio-bar ${isPlaying ? "active" : ""}`}
//                           style={{
//                             height: isPlaying
//                               ? `${Math.random() * 40 + 10}px`
//                               : "8px",
//                             animationDelay: `${i * 0.1}s`,
//                           }}
//                         />
//                       ))}
//                     </div>
//                   </div>

//                   {/* Voice Options */}
//                   <div className="grid grid-cols-2 gap-3">
//                     {demoVoices.map((voice) => (
//                       <button
//                         key={voice.id}
//                         onClick={() => setSelectedVoice(voice.id)}
//                         className={`p-4 rounded-xl text-left transition-all ${
//                           selectedVoice === voice.id
//                             ? "bg-green-500/20 border-2 border-green-500"
//                             : theme === "dark"
//                             ? "glass border border-gray-600 hover:border-green-500/50"
//                             : "bg-white border-2 border-gray-200 hover:border-green-500/50 shadow-sm"
//                         }`}
//                       >
//                         <div className={`font-medium ${
//                           theme === "dark" ? "text-white" : "text-gray-900"
//                         }`}>
//                           {voice.name}
//                         </div>
//                         <div className={`text-sm ${
//                           theme === "dark" ? "text-gray-400" : "text-gray-600"
//                         }`}>
//                           {voice.description}
//                         </div>
//                         <div className="text-xs text-green-400">
//                           {voice.accent}
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Floating Feature Cards */}
//               <motion.div
//                 className={`absolute -top-6 -right-6 rounded-2xl p-4 border ${
//                   theme === "dark"
//                     ? "glass border-green-500/30"
//                     : "bg-white border-green-500/30 shadow-lg"
//                 }`}
//                 animate={{ y: [0, -10, 0] }}
//                 transition={{
//                   duration: 4,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                 }}
//               >
//                 <div className="flex items-center gap-3">
//                   <Zap className="w-8 h-8 text-yellow-400" />
//                   <div>
//                     <div className={`font-bold ${
//                       theme === "dark" ? "text-white" : "text-gray-900"
//                     }`}>
//                       Instant
//                     </div>
//                     <div className={`text-xs ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-600"
//                     }`}>
//                       &lt; 2 seconds
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               <motion.div
//                 className={`absolute -bottom-6 -left-6 rounded-2xl p-4 border ${
//                   theme === "dark"
//                     ? "glass border-blue-500/30"
//                     : "bg-white border-blue-500/30 shadow-lg"
//                 }`}
//                 animate={{ y: [0, 10, 0] }}
//                 transition={{
//                   duration: 3,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                   delay: 1,
//                 }}
//               >
//                 <div className="flex items-center gap-3">
//                   <Brain className="w-8 h-8 text-blue-400" />
//                   <div>
//                     <div className={`font-bold ${
//                       theme === "dark" ? "text-white" : "text-gray-900"
//                     }`}>
//                       Premium
//                     </div>
//                     <div className={`text-xs ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-600"
//                     }`}>
//                       Studio Grade
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </motion.div>
//           </div>
//         </div>
//       </motion.section>

//       {/* Platform Features Section */}
//       <motion.section
//         ref={featuresRef}
//         className={`py-20 px-4 sm:px-6 lg:px-8 relative ${
//           theme === "dark"
//             ? "bg-gray-900/50"
//             : "bg-gray-50/50"
//         }`}
//         initial={{ opacity: 0 }}
//         whileInView={{ opacity: 1 }}
//         transition={{ duration: 0.8 }}
//         viewport={{ once: true }}
//       >
//         <div className="max-w-[100rem] mx-auto">
//           <motion.div
//             className="text-center mb-16"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
//               theme === "dark" ? "text-white" : "text-gray-900"
//             }`}>
//               Complete <span className="gradient-neon">AI Voice</span> Platform
//             </h2>
//             <p className={`text-xl max-w-3xl mx-auto ${
//               theme === "dark" ? "text-gray-400" : "text-gray-600"
//             }`}>
//               Everything you need to create, transform, and perfect voice content with cutting-edge AI technology
//             </p>
//           </motion.div>

//           {/* Feature Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {platformFeatures.map((feature, index) => {
//               const Icon = feature.icon;
//               return (
//                 <motion.div
//                   key={feature.id}
//                   className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${
//                     theme === "dark"
//                       ? "bg-gray-800/50 border border-gray-700 hover:border-green-500/50"
//                       : "bg-white border border-gray-200 hover:border-green-500/50 shadow-lg hover:shadow-xl"
//                   }`}
//                   initial={{ opacity: 0, y: 50 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.8, delay: index * 0.1 }}
//                   viewport={{ once: true }}
//                 >
//                   <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

//                   <div className="relative z-10">
//                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color}`}>
//                       <Icon className="w-8 h-8 text-white" />
//                     </div>

//                     <h3 className={`text-2xl font-bold mb-4 ${
//                       theme === "dark" ? "text-white" : "text-gray-900"
//                     }`}>
//                       {feature.title}
//                     </h3>

//                     <p className={`mb-6 leading-relaxed ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-600"
//                     }`}>
//                       {feature.description}
//                     </p>

//                     {/* Feature highlights */}
//                     <div className="space-y-2 mb-6">
//                       {feature.features.map((featureItem, idx) => (
//                         <div key={idx} className="flex items-center space-x-2">
//                           <CheckCircle className="w-4 h-4 text-green-400" />
//                           <span className={`text-sm ${
//                             theme === "dark" ? "text-gray-300" : "text-gray-700"
//                           }`}>
//                             {featureItem}
//                           </span>
//                         </div>
//                       ))}
//                     </div>

//                     <Link href={feature.href}>
//                       <button className={`w-full py-3 rounded-xl font-semibold transition-all group-hover:scale-105 ${
//                         theme === "dark"
//                           ? "bg-gray-700 hover:bg-green-500/20 text-white border border-gray-600 hover:border-green-500"
//                           : "bg-gray-100 hover:bg-green-500/10 text-gray-900 border border-gray-200 hover:border-green-500"
//                       }`}>
//                         Try {feature.title}
//                         <ArrowRight className="w-4 h-4 inline ml-2 group-hover:translate-x-1 transition-transform" />
//                       </button>
//                     </Link>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </div>
//       </motion.section>

//       {/* CTA Section */}
//       <section className={`py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${
//         theme === "dark"
//           ? ""
//           : "bg-white"
//       }`}>
//         <div className={`absolute inset-0 ${
//           theme === "dark"
//             ? "bg-gradient-to-r from-green-500/10 via-blue-500/5 to-purple-500/10"
//             : "bg-gradient-to-r from-green-500/5 via-blue-500/3 to-purple-500/5"
//         }`}></div>
//         <div className="max-w-4xl mx-auto text-center relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
//               theme === "dark" ? "text-white" : "text-gray-900"
//             }`}>
//               Ready to Transform Your{" "}
//               <span className="gradient-neon">Voice?</span>
//             </h2>
//             <p className={`text-xl mb-8 max-w-2xl mx-auto ${
//               theme === "dark" ? "text-gray-400" : "text-gray-600"
//             }`}>
//               Join millions of creators, businesses, and developers who trust
//               VoxWave for their voice AI needs. Start creating today.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-6 justify-center">
//               <Link href="/text-to-speech">
//                 <button className="btn-primary group text-lg px-8 py-4">
//                   <Rocket className="w-6 h-6" />
//                   Start Creating for Free
//                   <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
//                 </button>
//               </Link>
//             </div>
//           </motion.div>
//         </div>
//       </section>
//     </div>
//   );
// }
