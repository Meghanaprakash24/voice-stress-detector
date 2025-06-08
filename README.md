🎤 Real-Time Voice Stress Detector
A sophisticated web application that analyzes voice patterns in real-time to detect stress levels with 79% accuracy using machine learning. Built with modern web technologies and privacy-first design principles.

✨ Features:
Real-time voice analysis using Web Audio API
79% accuracy stress detection with logistic regression
18 audio features including MFCC coefficients and spectral analysis
Privacy-first design - all processing happens locally in your browser
Visual feedback with live waveforms and stress level gauges
Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
Responsive design for desktop and mobile devices

🚀 Live Demo:
Open index.html in a modern web browser or deploy to GitHub Pages for a live demonstration.
Requirements:
Modern web browser with Web Audio API support
Microphone access permission
HTTPS connection (for production deployment)

🔬 How It Works:
Machine Learning Model
Algorithm: Logistic Regression
Training Data: 1,000 synthetic samples based on voice stress research
Features: 18 audio characteristics
13 Mel-Frequency Cepstral Coefficients (MFCC)
Fundamental frequency (pitch)
Signal intensity
Zero-crossing rate
Spectral centroid
Spectral rolloff
Performance: 79% accuracy, 85% precision, 82% recall
Audio Processing Pipeline
Capture: Microphone input via getUserMedia API
Buffer: 2048-sample windows at 44.1kHz
Transform: FFT analysis for frequency domain data
Extract: Real-time feature extraction
Normalize: Z-score normalization using training statistics
Predict: Logistic regression classification
Display: Real-time visual feedback

Project structure:
voice-stress-detector/
├── index.html              # Main application page
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── audioProcessor.js   # Audio capture and feature extraction
│   ├── mlModel.js         # Machine learning model
│   └── main.js            # Main application logic
├── README.md              # Project documentation
├── LICENSE                # MIT License
└── .gitignore            # Git ignore rules

🛠️ Installation & Setup:
Local Development
Clone the repository

1)bash
git clone https://github.com/Meghanaprakash24/voice-stress-detector.git
cd voice-stress-detector

2)Open in browser

bash
# Using Python (if available)
python -m http.server 8000

# Using Node.js (if available)
npx http-server

# Or simply open index.html in your browser

3)Grant microphone permission when prompted

4)Click "Start Detection" to begin voice analysis

GitHub Pages Deployment:
Push code to your GitHub repository

Go to repository Settings → Pages

Select "Deploy from a branch" → "main"

Access your app at https://yourusername.github.io/voice-stress-detector

🎯 Usage Instructions
Getting Started
Open the application in a supported browser
Allow microphone access when prompted
Click "Start Detection" to begin analysis
Speak normally - the system analyzes your voice in real-time
View results in the stress gauge and confidence meters
Click "Stop Detection" when finished

Optimizing Accuracy
Quiet environment: Minimize background noise
Proper distance: Maintain 6-12 inches from microphone
Natural speech: Speak at normal volume and pace
Good positioning: Keep microphone level and stable

Understanding Results:
Stress Level: Visual gauge showing 0-100% stress probability
Confidence Bars: Separate probabilities for normal vs. stressed states
Audio Features: Real-time display of extracted voice characteristics
Live Waveform: Visual representation of audio input

🔒 Privacy & Security:
Data Protection
✅ No data transmission - all processing happens locally
✅ No storage - voice data is not saved or recorded
✅ No tracking - no analytics or third-party services
✅ Explicit consent - microphone access requires user permission

Security Features:
Browser sandbox protection
HTTPS requirement for production
Secure microphone access protocols
No persistent data storage

📊 Technical Specifications
Performance Metrics:
Accuracy: 79%
Precision: 85%
Recall: 82%
F1 Score: 83%
Processing Latency: <100ms
Update Frequency: 2Hz (500ms intervals)

Browser Support:
Chrome 66+ ✅
Firefox 60+ ✅
Safari 11.1+ ✅
Edge 79+ ✅


🤝 Contributing
I welcome contributions! Here's how to get involved:
Development Setup:
1)Fork the repository
2)Create a feature branch: git checkout -b feature-name
3)Make your changes and test thoroughly
4)Commit with descriptive messages: git commit -m "Add feature description"
5)Push to your fork: git push origin feature-name
6)Create a Pull Request

Areas for Contribution:
Model improvement: Training with larger datasets
Feature enhancement: Additional audio analysis features
UI/UX improvements: Better visualizations and user experience
Performance optimization: Faster processing algorithms
Browser compatibility: Support for older browsers
Documentation: Improved guides and examples
Code Style
Use ES6+ JavaScript features
Follow consistent indentation (2 spaces)
Add meaningful comments for complex algorithms
Maintain responsive design principles

🔮 Future Enhancements:
Planned Features
Deep learning models: CNN-LSTM architectures for improved accuracy
Speaker adaptation: Personalized calibration for individual users
Multi-modal analysis: Combining audio and visual stress indicators
Temporal modeling: Long-term stress pattern analysis
Real dataset training: Training on established voice emotion datasets
Research Opportunities
Integration with RAVDESS, TESS, and CREMAD datasets
Cross-language stress detection capabilities
Real-time stress intervention recommendations
Integration with health monitoring systems

📚 Scientific Background:
Voice Stress Indicators
Research shows that stress affects voice characteristics in measurable ways:
Pitch elevation: Increased fundamental frequency under stress
Vocal tension: Higher zero-crossing rates and harmonics
Spectral changes: Altered frequency distributions
Temporal patterns: Modified speaking rhythms and pauses

References:
Stress and emotion recognition in speech signals
MFCC feature extraction for voice analysis
Logistic regression for binary classification
Web Audio API best practices

📄 License:
This project is licensed under the MIT License - see the LICENSE file for detail
