/**
 * Main Application for Voice Stress Detector
 * Handles UI interactions and coordinates audio processing with ML model
 */

class VoiceStressDetector {
    constructor() {
        this.audioProcessor = new AudioProcessor();
        this.mlModel = new VoiceStressModel();
        this.isRunning = false;
        this.updateInterval = null;

        // UI elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusText = document.getElementById('statusText');
        this.recordingIndicator = document.getElementById('recordingIndicator');

        // Result display elements
        this.stressValue = document.getElementById('stressValue');
        this.stressLabel = document.getElementById('stressLabel');
        this.normalBar = document.getElementById('normalBar');
        this.stressedBar = document.getElementById('stressedBar');
        this.normalProb = document.getElementById('normalProb');
        this.stressedProb = document.getElementById('stressedProb');

        // Feature display elements
        this.pitchValue = document.getElementById('pitchValue');
        this.intensityValue = document.getElementById('intensityValue');
        this.zcrValue = document.getElementById('zcrValue');
        this.centroidValue = document.getElementById('centroidValue');

        // Waveform canvas
        this.waveformCanvas = document.getElementById('waveformCanvas');
        this.waveformCtx = this.waveformCanvas.getContext('2d');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.startDetection());
        this.stopBtn.addEventListener('click', () => this.stopDetection());

        // Handle window resize for canvas
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }

    async startDetection() {
        try {
            this.updateStatus('Initializing audio...', false);
            this.startBtn.disabled = true;

            // Initialize audio processor
            await this.audioProcessor.initialize();

            // Start recording
            this.audioProcessor.startRecording();
            this.isRunning = true;

            // Update UI
            this.updateStatus('Analyzing voice...', true);
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.recordingIndicator.classList.add('active');

            // Start regular updates
            this.updateInterval = setInterval(() => this.updateResults(), 500);

            console.log('Voice stress detection started');
        } catch (error) {
            console.error('Failed to start detection:', error);
            this.updateStatus('Error: ' + error.message, false);
            this.resetUI();
        }
    }

    stopDetection() {
        this.isRunning = false;

        // Stop audio processing
        this.audioProcessor.stopRecording();

        // Clear update interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        // Update UI
        this.updateStatus('Ready to analyze', false);
        this.resetUI();

        console.log('Voice stress detection stopped');
    }

    updateResults() {
        if (!this.isRunning) return;

        try {
            // Get features from audio processor
            const features = this.audioProcessor.getFeatures();

            // Make prediction
            const prediction = this.mlModel.predict(features);

            // Update stress level display
            this.updateStressDisplay(prediction);

            // Update confidence bars
            this.updateConfidenceBars(prediction);

            // Update feature values
            this.updateFeatureDisplay(features);

            // Update waveform
            this.updateWaveform();

        } catch (error) {
            console.error('Error updating results:', error);
        }
    }

    updateStressDisplay(prediction) {
        const stressPercentage = Math.round(prediction.stressProbability * 100);
        this.stressValue.textContent = stressPercentage + '%';

        // Update stress label
        let labelText = 'Normal';
        let labelClass = 'normal';

        if (prediction.stressLevel === 'moderate') {
            labelText = 'Moderate Stress';
            labelClass = 'moderate';
        } else if (prediction.stressLevel === 'high') {
            labelText = 'High Stress';
            labelClass = 'high';
        }

        this.stressLabel.textContent = labelText;
        this.stressLabel.className = 'stress-label ' + labelClass;
    }

    updateConfidenceBars(prediction) {
        const normalPercentage = Math.round(prediction.normalProbability * 100);
        const stressedPercentage = Math.round(prediction.stressProbability * 100);

        this.normalBar.style.width = normalPercentage + '%';
        this.stressedBar.style.width = stressedPercentage + '%';

        this.normalProb.textContent = normalPercentage + '%';
        this.stressedProb.textContent = stressedPercentage + '%';
    }

    updateFeatureDisplay(features) {
        this.pitchValue.textContent = Math.round(features.pitch || 0) + ' Hz';
        this.intensityValue.textContent = (features.intensity || 0).toFixed(4);
        this.zcrValue.textContent = (features.zcr || 0).toFixed(4);
        this.centroidValue.textContent = Math.round(features.spectralCentroid || 0) + ' Hz';
    }

    updateWaveform() {
        const timeData = this.audioProcessor.getTimeData();
        if (!timeData) return;

        const width = this.waveformCanvas.width;
        const height = this.waveformCanvas.height;

        // Clear canvas
        this.waveformCtx.fillStyle = '#f8f9fa';
        this.waveformCtx.fillRect(0, 0, width, height);

        // Draw waveform
        this.waveformCtx.strokeStyle = '#4CAF50';
        this.waveformCtx.lineWidth = 2;
        this.waveformCtx.beginPath();

        const sliceWidth = width / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
            const y = (timeData[i] + 1) * height / 2;

            if (i === 0) {
                this.waveformCtx.moveTo(x, y);
            } else {
                this.waveformCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.waveformCtx.stroke();

        // Draw center line
        this.waveformCtx.strokeStyle = '#ddd';
        this.waveformCtx.lineWidth = 1;
        this.waveformCtx.beginPath();
        this.waveformCtx.moveTo(0, height / 2);
        this.waveformCtx.lineTo(width, height / 2);
        this.waveformCtx.stroke();
    }

    updateStatus(message, isRecording) {
        this.statusText.textContent = message;

        if (isRecording) {
            this.recordingIndicator.classList.add('active');
        } else {
            this.recordingIndicator.classList.remove('active');
        }
    }

    resetUI() {
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.recordingIndicator.classList.remove('active');

        // Reset displays to default values
        this.stressValue.textContent = '0%';
        this.stressLabel.textContent = 'Normal';
        this.stressLabel.className = 'stress-label normal';

        this.normalBar.style.width = '50%';
        this.stressedBar.style.width = '50%';
        this.normalProb.textContent = '50%';
        this.stressedProb.textContent = '50%';

        this.pitchValue.textContent = '---';
        this.intensityValue.textContent = '---';
        this.zcrValue.textContent = '---';
        this.centroidValue.textContent = '---';

        // Clear waveform
        this.waveformCtx.fillStyle = '#f8f9fa';
        this.waveformCtx.fillRect(0, 0, this.waveformCanvas.width, this.waveformCanvas.height);
    }

    resizeCanvas() {
        const rect = this.waveformCanvas.getBoundingClientRect();
        this.waveformCanvas.width = rect.width;
        this.waveformCanvas.height = rect.height;
    }

    // Cleanup when page is closed
    cleanup() {
        this.stopDetection();
        this.audioProcessor.cleanup();
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new VoiceStressDetector();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        app.cleanup();
    });

    // Display model information in console
    console.log('Voice Stress Detector initialized');
    console.log('Model Info:', app.mlModel.getModelInfo());
    console.log('Feature Importance:', app.mlModel.getFeatureImportance());

    // Check for browser compatibility
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Safari.');
    }
});

// Handle errors globally
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
