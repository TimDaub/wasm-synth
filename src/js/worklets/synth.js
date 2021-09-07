//@format

class SynthWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.kernel = Module();
    const numOfVoices = 64;
    const numOfOscillators = 4;
    this.voiceManager = new this.kernel.VoiceManager(
      sampleRate,
      numOfVoices,
      numOfOscillators
    );

    this.port.onmessage = this.handleEvents.bind(this);
    console.log("Worklet launched successfully");
  }

  handleEvents({ data }) {
    if (data.name === "NoteOn") {
      this.voiceManager.onNoteOn(data.key);
    } else if (data.name === "NoteOff") {
      this.voiceManager.onNoteOff(data.key);
    } else if (data.name === "Envelope") {
      const { index, xa, xd, ys, xr, ya } = data.values;
      this.voiceManager.updateEnvelope(index, xa, xd, ys, xr, ya);
    } else if (data.name === "Level") {
      const { index, value } = data.values;
      this.voiceManager.updateLevel(index, value);
    } else if (data.name === "WaveForm") {
      const { index, value } = data.values;
      this.voiceManager.updateWaveForm(index, value);
    } else if (data.name === "Enable") {
      const { index, value } = data.values;
      this.voiceManager.enableOscillator(index, value);
    }
  }

  process(inputs, outputs, parameters) {
    // NOTE: We only use a single channel to generate our sounds, will be up-mixed to stereo.
    const outputChannel = outputs[0][0];
    const sample = this.voiceManager.nextSample(outputChannel.length);
    for (let i = 0; i < sample.size(); i++) {
      outputChannel[i] = sample.get(i);
    }
    return true;
  }
}

registerProcessor("SynthWorklet", SynthWorklet);
