const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

// Audio validation and processing utilities
class AudioProcessor {
  // Validate audio file for general use
  static validateAudioFile(file) {
    const allowedMimeTypes = [
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

    const allowedExtensions = [
      ".mp3",
      ".wav",
      ".m4a",
      ".flac",
      ".aac",
      ".ogg",
      ".webm",
    ];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Unsupported audio format: ${file.mimetype}. Supported formats: MP3, WAV, M4A, FLAC, AAC, OGG`,
      };
    }

    // Check file extension
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: `Unsupported file extension: ${fileExtension}. Supported extensions: ${allowedExtensions.join(
          ", "
        )}`,
      };
    }

    // Check file size (25MB max for general use)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(
          2
        )}MB. Maximum size: 25MB`,
      };
    }

    // Check minimum file size (1KB to ensure it's not empty)
    if (file.size < 1024) {
      return {
        valid: false,
        error: "File too small. Minimum size: 1KB",
      };
    }

    return { valid: true };
  }

  // Enhanced validation for voice cloning
  static validateAudioForVoiceCloning(file) {
    const baseValidation = this.validateAudioFile(file);
    if (!baseValidation.valid) {
      return baseValidation;
    }

    // Voice cloning specific checks
    const minSizeForCloning = 0.5 * 1024 * 1024; // 500KB minimum for decent quality
    if (file.size < minSizeForCloning) {
      return {
        valid: false,
        error:
          "Audio file too small for voice cloning. Minimum recommended size: 500KB (about 30 seconds of speech)",
      };
    }

    return { valid: true };
  }

  // Get audio metadata using ffprobe
  static async getAudioMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new Error(`Failed to read audio metadata: ${err.message}`));
          return;
        }

        const audioStream = metadata.streams.find(
          (stream) => stream.codec_type === "audio"
        );
        if (!audioStream) {
          reject(new Error("No audio stream found in file"));
          return;
        }

        resolve({
          duration: parseFloat(metadata.format.duration) || 0,
          bitrate: parseInt(metadata.format.bit_rate) || 0,
          size: parseInt(metadata.format.size) || 0,
          format: metadata.format.format_name,
          codec: audioStream.codec_name,
          sampleRate: parseInt(audioStream.sample_rate) || 0,
          channels: parseInt(audioStream.channels) || 0,
          channelLayout: audioStream.channel_layout,
        });
      });
    });
  }

  // Convert audio to optimal format for voice cloning
  static async optimizeForVoiceCloning(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec("pcm_s16le") // Uncompressed for best quality
        .audioFrequency(44100) // Standard sample rate
        .audioChannels(1) // Mono for voice cloning
        .audioBitrate("128k") // Good quality
        .format("wav") // Standard format
        .on("end", () => {
          console.log(`✅ Audio optimized: ${outputPath}`);
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error(`❌ Audio optimization failed: ${err.message}`);
          reject(new Error(`Audio optimization failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  // Convert audio to web-optimized format
  static async optimizeForWeb(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec("libmp3lame")
        .audioFrequency(44100)
        .audioBitrate("128k")
        .format("mp3")
        .on("end", () => {
          console.log(`✅ Audio web-optimized: ${outputPath}`);
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error(`❌ Web optimization failed: ${err.message}`);
          reject(new Error(`Web optimization failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  // Normalize audio levels
  static async normalizeAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters("loudnorm=I=-16:TP=-1.5:LRA=11") // EBU R128 normalization
        .on("end", () => {
          console.log(`✅ Audio normalized: ${outputPath}`);
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error(`❌ Audio normalization failed: ${err.message}`);
          reject(new Error(`Audio normalization failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  // Remove silence from beginning and end
  static async trimSilence(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters([
          "silenceremove=start_periods=1:start_duration=0.5:start_threshold=-50dB",
          "areverse",
          "silenceremove=start_periods=1:start_duration=0.5:start_threshold=-50dB",
          "areverse",
        ])
        .on("end", () => {
          console.log(`✅ Silence trimmed: ${outputPath}`);
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error(`❌ Silence trimming failed: ${err.message}`);
          reject(new Error(`Silence trimming failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  static async removeBackgroundNoise(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters([
          // High-pass filter to remove low-frequency noise
          "highpass=f=80",
          // Low-pass filter to remove high-frequency noise
          "lowpass=f=8000",
          // Dynamic range compression to reduce background noise
          "compand=attacks=0.3:decays=0.8:points=-80/-80|-65/-65|-35/-35|-10/-10:soft-knee=6:gain=0:volume=-5",
          // Gate to remove quiet background noise
          "agate=threshold=0.003:ratio=10:attack=3:release=100",
        ])
        .on("end", () => {
          console.log(`✅ Background noise removed: ${outputPath}`);
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error(`❌ Noise removal failed: ${err.message}`);
          reject(new Error(`Noise removal failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  // NEW: Enhance voice frequencies
  static async enhanceVoiceFrequencies(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters([
          // Boost mid frequencies where human voice is prominent (300Hz-3kHz)
          "equalizer=f=300:width_type=h:width=1000:g=2",
          "equalizer=f=1000:width_type=h:width=1000:g=3",
          "equalizer=f=2000:width_type=h:width=1000:g=2",
          // Slightly reduce very low and very high frequencies
          "equalizer=f=100:width_type=h:width=100:g=-2",
          "equalizer=f=8000:width_type=h:width=2000:g=-1",
        ])
        .on("end", () => {
          console.log(`✅ Voice frequencies enhanced: ${outputPath}`);
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error(`❌ Voice enhancement failed: ${err.message}`);
          reject(new Error(`Voice enhancement failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  // Complete processing pipeline for voice cloning
  static async processForVoiceCloning(inputPath, options = {}) {
    try {
      const {
        normalize = true,
        trimSilence = true,
        optimize = true,
        outputDir = path.dirname(inputPath),
      } = options;

      const fileName = path.basename(inputPath, path.extname(inputPath));
      const timestamp = Date.now();

      let currentPath = inputPath;
      let processedPath;

      // Step 1: Remove background noise
      if (options.removeNoise !== false) {
        processedPath = path.join(
          outputDir,
          `${fileName}_denoised_${timestamp}.wav`
        );
        await this.removeBackgroundNoise(currentPath, processedPath);
        if (currentPath !== inputPath) fs.unlinkSync(currentPath);
        currentPath = processedPath;
        console.log("✅ Background noise removed");
      }

      // Step 2: Enhance voice frequencies
      if (options.enhanceVoice !== false) {
        processedPath = path.join(
          outputDir,
          `${fileName}_enhanced_${timestamp}.wav`
        );
        await this.enhanceVoiceFrequencies(currentPath, processedPath);
        if (currentPath !== inputPath) fs.unlinkSync(currentPath);
        currentPath = processedPath;
        console.log("✅ Voice frequencies enhanced");
      }

      // Step 3: Normalize audio levels
      if (normalize) {
        processedPath = path.join(
          outputDir,
          `${fileName}_normalized_${timestamp}.wav`
        );
        await this.normalizeAudio(currentPath, processedPath);
        if (currentPath !== inputPath) fs.unlinkSync(currentPath);
        currentPath = processedPath;
        console.log("✅ Audio normalized");
      }

      // Step 2: Trim silence
      if (trimSilence) {
        processedPath = path.join(
          outputDir,
          `${fileName}_trimmed_${timestamp}.wav`
        );
        await this.trimSilence(currentPath, processedPath);
        if (currentPath !== inputPath) fs.unlinkSync(currentPath);
        currentPath = processedPath;
      }

      // Step 3: Optimize for voice cloning
      if (optimize) {
        processedPath = path.join(
          outputDir,
          `${fileName}_optimized_${timestamp}.wav`
        );
        await this.optimizeForVoiceCloning(currentPath, processedPath);
        if (currentPath !== inputPath) fs.unlinkSync(currentPath);
        currentPath = processedPath;
      }

      // Get final metadata
      const metadata = await this.getAudioMetadata(currentPath);

      console.log(`✅ Voice cloning processing complete: ${currentPath}`);
      console.log(
        `📊 Final audio: ${metadata.duration.toFixed(2)}s, ${
          metadata.sampleRate
        }Hz, ${metadata.channels}ch`
      );

      return {
        processedPath: currentPath,
        metadata,
        success: true,
      };
    } catch (error) {
      console.error("❌ Voice cloning processing failed:", error.message);
      throw error;
    }
  }

  // Quality analysis for uploaded audio
  static async analyzeAudioQuality(filePath) {
    try {
      const metadata = await this.getAudioMetadata(filePath);

      let quality = "good";
      let recommendations = [];

      // Check duration
      if (metadata.duration < 10) {
        quality = "poor";
        recommendations.push(
          "Audio should be at least 10 seconds long for voice cloning"
        );
      } else if (metadata.duration < 30) {
        quality = "fair";
        recommendations.push(
          "For best results, use audio that is at least 30 seconds long"
        );
      }

      // Check sample rate
      if (metadata.sampleRate < 22050) {
        quality = "poor";
        recommendations.push(
          "Sample rate too low. Use audio with at least 22kHz sample rate"
        );
      } else if (metadata.sampleRate < 44100) {
        if (quality === "good") quality = "fair";
        recommendations.push(
          "For best quality, use audio with 44.1kHz or higher sample rate"
        );
      }

      // Check bitrate (if available)
      if (metadata.bitrate && metadata.bitrate < 64000) {
        quality = "poor";
        recommendations.push(
          "Bitrate too low. Use higher quality audio (128kbps or higher)"
        );
      }

      // Check if stereo (mono is better for voice cloning)
      if (metadata.channels > 1) {
        recommendations.push(
          "Mono audio works better for voice cloning than stereo"
        );
      }

      return {
        quality,
        metadata,
        recommendations,
        score: quality === "good" ? 85 : quality === "fair" ? 65 : 35,
      };
    } catch (error) {
      return {
        quality: "unknown",
        metadata: null,
        recommendations: ["Could not analyze audio quality"],
        score: 0,
        error: error.message,
      };
    }
  }
}

// Middleware function for audio file validation
const validateAudioMiddleware = (options = {}) => {
  const { forVoiceCloning = false } = options;

  return async (req, res, next) => {
    try {
      const files = req.files || (req.file ? [req.file] : []);

      if (files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No audio files provided",
          message: "Please upload at least one audio file",
        });
      }

      // Validate each file
      for (const file of files) {
        const validation = forVoiceCloning
          ? AudioProcessor.validateAudioForVoiceCloning(file)
          : AudioProcessor.validateAudioFile(file);

        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            error: "Invalid audio file",
            message: `${file.originalname}: ${validation.error}`,
            file: file.originalname,
          });
        }
      }

      // Add metadata to request for further processing
      req.audioFiles = files;
      req.audioValidation = "passed";

      next();
    } catch (error) {
      console.error("Audio validation middleware error:", error.message);
      res.status(500).json({
        success: false,
        error: "Audio validation failed",
        message: error.message,
      });
    }
  };
};

module.exports = {
  AudioProcessor,
  validateAudioMiddleware,
};
