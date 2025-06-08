/**
 * Audio Processor for Voice Stress Detection
 * Handles microphone input, audio analysis, and feature extraction
 */

class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.microphone = null;
        this.analyser = null;
        this.dataArray = null;
        this.sampleRate = 44100;
        this.fftSize = 2048;
        this.isRecording = false;

        // Audio buffer for processing
        this.audioBuffer = [];
        this.bufferSize = this.sampleRate * 2; // 2 seconds of audio

        // Feature extraction parameters
        this.features = {
            mfcc: new Array(13).fill(0),
            pitch: 0,
            intensity: 0,
            zcr: 0,
            spectralCentroid: 0,
            spectralRolloff: 0
        };
    }

    async initialize() {
        try {
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: this.sampleRate,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.sampleRate
            });

            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.analyser.smoothingTimeConstant = 0.3;

            // Connect microphone to analyser
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);

            // Initialize data array
            this.dataArray = new Float32Array(this.analyser.frequencyBinCount);

            console.log('Audio processor initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing audio processor:', error);
            throw new Error('Microphone access denied or not available');
        }
    }

    startRecording() {
        if (!this.audioContext) {
            throw new Error('Audio processor not initialized');
        }

        this.isRecording = true;
        this.audioBuffer = [];
        this.processAudio();
        console.log('Recording started');
    }

    stopRecording() {
        this.isRecording = false;
        console.log('Recording stopped');
    }

    processAudio() {
        if (!this.isRecording) return;

        // Get frequency domain data
        this.analyser.getFloatFrequencyData(this.dataArray);

        // Convert to time domain for additional analysis
        const timeDataArray = new Float32Array(this.analyser.fftSize);
        this.analyser.getFloatTimeDomainData(timeDataArray);

        // Add to buffer
        this.audioBuffer.push(...timeDataArray);

        // Keep buffer size manageable
        if (this.audioBuffer.length > this.bufferSize) {
            this.audioBuffer = this.audioBuffer.slice(-this.bufferSize);
        }

        // Extract features
        this.extractFeatures(this.dataArray, timeDataArray);

        // Continue processing
        requestAnimationFrame(() => this.processAudio());
    }

    extractFeatures(frequencyData, timeData) {
        // Calculate basic audio features
        this.features.intensity = this.calculateIntensity(timeData);
        this.features.zcr = this.calculateZeroCrossingRate(timeData);
        this.features.pitch = this.calculatePitch(frequencyData);
        this.features.spectralCentroid = this.calculateSpectralCentroid(frequencyData);
        this.features.spectralRolloff = this.calculateSpectralRolloff(frequencyData);

        // Calculate MFCC coefficients (simplified version)
        this.features.mfcc = this.calculateMFCC(frequencyData);
    }

    calculateIntensity(timeData) {
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
            sum += timeData[i] * timeData[i];
        }
        return Math.sqrt(sum / timeData.length);
    }

    calculateZeroCrossingRate(timeData) {
        let crossings = 0;
        for (let i = 1; i < timeData.length; i++) {
            if ((timeData[i] >= 0) !== (timeData[i - 1] >= 0)) {
                crossings++;
            }
        }
        return crossings / timeData.length;
    }

    calculatePitch(frequencyData) {
        // Simple pitch detection using autocorrelation
        let maxMagnitude = -Infinity;
        let maxIndex = 0;

        for (let i = 20; i < frequencyData.length / 2; i++) {
            if (frequencyData[i] > maxMagnitude) {
                maxMagnitude = frequencyData[i];
                maxIndex = i;
            }
        }

        // Convert bin to frequency
        const frequency = (maxIndex * this.sampleRate) / (2 * this.analyser.frequencyBinCount);
        return frequency;
    }

    calculateSpectralCentroid(frequencyData) {
        let weightedSum = 0;
        let magnitudeSum = 0;

        for (let i = 0; i < frequencyData.length; i++) {
            const magnitude = Math.pow(10, frequencyData[i] / 20); // Convert from dB
            const frequency = (i * this.sampleRate) / (2 * frequencyData.length);

            weightedSum += frequency * magnitude;
            magnitudeSum += magnitude;
        }

        return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    }

    calculateSpectralRolloff(frequencyData) {
        // Calculate total spectral energy
        let totalEnergy = 0;
        const magnitudes = [];

        for (let i = 0; i < frequencyData.length; i++) {
            const magnitude = Math.pow(10, frequencyData[i] / 20);
            magnitudes.push(magnitude);
            totalEnergy += magnitude;
        }

        // Find frequency where 85% of energy is contained
        const threshold = 0.85 * totalEnergy;
        let cumulativeEnergy = 0;

        for (let i = 0; i < magnitudes.length; i++) {
            cumulativeEnergy += magnitudes[i];
            if (cumulativeEnergy >= threshold) {
                return (i * this.sampleRate) / (2 * magnitudes.length);
            }
        }

        return 0;
    }

    calculateMFCC(frequencyData) {
        // Simplified MFCC calculation
        const mfcc = new Array(13).fill(0);
        const melFilters = this.createMelFilterBank(26, frequencyData.length);

        // Apply mel filter bank
        const melEnergies = new Array(26).fill(0);
        for (let i = 0; i < melFilters.length; i++) {
            for (let j = 0; j < frequencyData.length; j++) {
                const magnitude = Math.pow(10, frequencyData[j] / 20);
                melEnergies[i] += magnitude * melFilters[i][j];
            }
            melEnergies[i] = Math.log(melEnergies[i] + 1e-10);
        }

        // Apply DCT to get MFCC coefficients
        for (let i = 0; i < 13; i++) {
            for (let j = 0; j < 26; j++) {
                mfcc[i] += melEnergies[j] * Math.cos((i * (j + 0.5) * Math.PI) / 26);
            }
        }

        return mfcc;
    }

    createMelFilterBank(numFilters, fftSize) {
        const filters = [];
        const melMin = this.hzToMel(0);
        const melMax = this.hzToMel(this.sampleRate / 2);
        const melPoints = [];

        // Create mel-spaced frequency points
        for (let i = 0; i <= numFilters + 1; i++) {
            const mel = melMin + (i * (melMax - melMin)) / (numFilters + 1);
            melPoints.push(this.melToHz(mel));
        }

        // Create triangular filters
        for (let i = 1; i <= numFilters; i++) {
            const filter = new Array(fftSize).fill(0);
            const left = melPoints[i - 1];
            const center = melPoints[i];
            const right = melPoints[i + 1];

            for (let j = 0; j < fftSize; j++) {
                const freq = (j * this.sampleRate) / (2 * fftSize);

                if (freq >= left && freq <= center) {
                    filter[j] = (freq - left) / (center - left);
                } else if (freq > center && freq <= right) {
                    filter[j] = (right - freq) / (right - center);
                }
            }

            filters.push(filter);
        }

        return filters;
    }

    hzToMel(hz) {
        return 2595 * Math.log10(1 + hz / 700);
    }

    melToHz(mel) {
        return 700 * (Math.pow(10, mel / 2595) - 1);
    }

    getFeatures() {
        return { ...this.features };
    }

    getFrequencyData() {
        if (this.analyser && this.dataArray) {
            this.analyser.getFloatFrequencyData(this.dataArray);
            return this.dataArray;
        }
        return null;
    }

    getTimeData() {
        if (this.analyser) {
            const timeData = new Float32Array(this.analyser.fftSize);
            this.analyser.getFloatTimeDomainData(timeData);
            return timeData;
        }
        return null;
    }

    cleanup() {
        if (this.microphone) {
            this.microphone.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.isRecording = false;
    }
}
