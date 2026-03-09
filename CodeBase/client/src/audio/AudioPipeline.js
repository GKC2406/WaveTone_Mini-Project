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
    this.lastInterimTranscript = '';
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
      let latestInterim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const cleanedTranscript = transcript?.replace(/\s+/g, ' ').trim() || '';
        // Check profanity on both interim and final results for faster detection
        if (cleanedTranscript.length > 0 && containsProfanity(cleanedTranscript)) {
          this._triggerMute();
          this.onProfanityDetected?.(cleanedTranscript);
          console.log('AudioPipeline: Profanity detected:', cleanedTranscript);
          break;
        }
        // Collect final (non-interim) transcripts for AI summary
        if (event.results[i].isFinal && cleanedTranscript.length > 2) {
          this.transcripts.push(cleanedTranscript);
          this.lastInterimTranscript = '';
        } else if (cleanedTranscript.length > 2) {
          latestInterim = cleanedTranscript;
        }
      }
      if (latestInterim) this.lastInterimTranscript = latestInterim;
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
    // Reduce restart delay from 300ms to 100ms for faster re-detection
    setTimeout(() => {
      if (this.isActive && this.recognition) {
        try { this.recognition.start(); } catch { /* may fail if already running */ }
      }
    }, 100);
  }

  getTranscripts() {
    const transcripts = [...this.transcripts];
    const fallbackInterim = this.lastInterimTranscript.replace(/\s+/g, ' ').trim();

    if (fallbackInterim.length > 2 && !transcripts.includes(fallbackInterim)) {
      transcripts.push(fallbackInterim);
    }

    console.log('AudioPipeline: transcript count for summary', transcripts.length);
    return transcripts;
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
