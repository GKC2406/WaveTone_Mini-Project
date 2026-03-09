import { containsProfanity } from './profanityWordList';

export class AudioPipeline {
  constructor({ rawStream, onProfanityDetected, onPipelineReady, onError }) {
    this.rawStream = rawStream;
    this.onProfanityDetected = onProfanityDetected;
    this.onPipelineReady = onPipelineReady;
    this.onError = onError;
    this.audioContext = null;
    this.sourceNode = null;
    this.workletNode = null;
    this.destinationNode = null;
    this.processedStream = null;
    this.recognition = null;
    this.isActive = true;
    this.transcripts = []; // collected final transcripts for AI summary
  }

  async init() {
    try {
      // Create audio processing graph
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (!this.audioContext.audioWorklet) {
        throw new Error('AudioWorklet is not supported in this browser');
      }
      if (typeof this.audioContext.createMediaStreamDestination !== 'function') {
        throw new Error('MediaStreamDestination is not supported in this browser');
      }

      await this.audioContext.audioWorklet.addModule('/profanity-worklet.js');

      this.sourceNode = this.audioContext.createMediaStreamSource(this.rawStream);
      this.workletNode = new AudioWorkletNode(this.audioContext, 'profanity-gate');
      this.destinationNode = this.audioContext.createMediaStreamDestination();

      // Wire: mic → worklet (ring buffer + gate) → destination
      this.sourceNode.connect(this.workletNode);
      this.workletNode.connect(this.destinationNode);

      this.processedStream = this.destinationNode.stream;

      // Start speech recognition in parallel
      this._startSpeechRecognition();

      console.log('AudioPipeline: initialized (400ms buffer active)');
      this.onPipelineReady(this.processedStream);
    } catch (err) {
      console.warn('AudioPipeline: failed to initialize, falling back to raw stream', err.message);
      this.processedStream = this.rawStream;
      this._startSpeechRecognition(); // still try speech detection even without worklet
      this.onError?.(err);
      this.onPipelineReady(this.rawStream);
    }
  }

  _startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('AudioPipeline: SpeechRecognition not available in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        // Collect final (non-interim) transcripts for AI summary
        if (event.results[i].isFinal && transcript.trim().length > 2) {
          this.transcripts.push(transcript.trim());
        }
        if (containsProfanity(transcript)) {
          this._triggerMute();
          this.onProfanityDetected?.(transcript);
          break;
        }
      }
    };

    this.recognition.onerror = (event) => {
      // no-speech and aborted are normal — restart silently
      if (event.error === 'no-speech' || event.error === 'aborted') {
        this._restartRecognition();
      }
    };

    this.recognition.onend = () => {
      if (this.isActive) this._restartRecognition();
    };

    try {
      this.recognition.start();
      console.log('AudioPipeline: SpeechRecognition started');
    } catch {
      console.warn('AudioPipeline: SpeechRecognition failed to start');
    }
  }

  _triggerMute() {
    if (this.workletNode) {
      this.workletNode.port.postMessage({ type: 'mute', durationMs: 500 });
    }
  }

  _restartRecognition() {
    if (!this.isActive) return;
    try { this.recognition?.stop(); } catch { /* already stopped */ }
    setTimeout(() => {
      if (this.isActive && this.recognition) {
        try { this.recognition.start(); } catch { /* may fail if already running */ }
      }
    }, 300);
  }

  getTranscripts() {
    return this.transcripts;
  }

  destroy() {
    this.isActive = false;
    try { this.recognition?.stop(); } catch { /* ok */ }
    this.workletNode?.disconnect();
    this.sourceNode?.disconnect();
    this.audioContext?.close().catch(() => {});
    this.recognition = null;
    console.log('AudioPipeline: destroyed');
  }
}
