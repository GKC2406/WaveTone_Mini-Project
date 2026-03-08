// AudioWorklet processor — runs in a separate audio thread
// Implements a ring buffer with a controllable gate for profanity muting

class ProfanityGateProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Ring buffer: ~400ms at 48kHz = 19200 samples
    this.bufferSize = Math.floor(sampleRate * 0.4);
    this.ringBuffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
    this.readIndex = 0;
    this.filled = 0; // how many samples are in the buffer
    this.gateOpen = true;
    this.muteUntilSample = 0;
    this.totalSamples = 0;

    // Listen for mute commands from main thread
    this.port.onmessage = (event) => {
      if (event.data.type === 'mute') {
        const muteDuration = event.data.durationMs || 500;
        const muteSamples = Math.floor(sampleRate * muteDuration / 1000);
        this.gateOpen = false;
        this.muteUntilSample = this.totalSamples + muteSamples;
      }
    };
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || !input[0] || !output || !output[0]) return true;

    const inputChannel = input[0];
    const outputChannel = output[0];
    const blockSize = inputChannel.length; // typically 128 samples

    for (let i = 0; i < blockSize; i++) {
      // Write incoming sample to ring buffer
      this.ringBuffer[this.writeIndex] = inputChannel[i];
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
      this.filled = Math.min(this.filled + 1, this.bufferSize);
      this.totalSamples++;

      // Check if mute period has ended
      if (!this.gateOpen && this.totalSamples >= this.muteUntilSample) {
        this.gateOpen = true;
      }

      // Read from buffer (delayed output) once buffer has enough data
      if (this.filled >= this.bufferSize) {
        if (this.gateOpen) {
          outputChannel[i] = this.ringBuffer[this.readIndex];
        } else {
          outputChannel[i] = 0; // silence when gate is closed
        }
        this.readIndex = (this.readIndex + 1) % this.bufferSize;
      } else {
        // Buffer still filling — output silence during initial delay
        outputChannel[i] = 0;
      }
    }

    return true; // keep processor alive
  }
}

registerProcessor('profanity-gate', ProfanityGateProcessor);
