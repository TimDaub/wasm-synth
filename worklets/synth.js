//@format
import Module from "../bundle-wasm.js";

class SynthWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.kernel = Module();
    this.voiceManager = new this.kernel.VoiceManager(sampleRate, 64);

    this.port.onmessage = this.handleEvents.bind(this);
    console.log("Worklet launched successfully");
  }

  handleEvents({ data }) {
    console.log(data);
    if (data.name === "NoteOn") {
      this.voiceManager.onNoteOn(data.key);
    } else if (data.name === "NoteOff") {
      this.voiceManager.onNoteOff(data.key);
    } else if (data.name === "Envelope") {
      if (data.key === "xa") {
        this.voiceManager.setXA(data.value.xa);
      } else if (data.key === "xd") {
        this.voiceManager.setXD(data.value);
      } else if (data.key === "ys") {
        this.voiceManager.setYS(data.value);
      } else if (data.key === "xr") {
        this.voiceManager.setXR(data.value);
      }
    }
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    for (
      let channel = 0, numberOfChannels = output.length;
      channel < numberOfChannels;
      channel++
    ) {
      const outputChannel = output[channel];

      const sample = this.voiceManager.nextSample(outputChannel.length);
      for (let i = 0; i < sample.size(); i++) {
        outputChannel[i] = sample.get(i);
      }
    }
    return true;
  }
}

registerProcessor("SynthWorklet", SynthWorklet);
