// @format
const AudioContext = window.AudioContext || window.webkitAudioContext;

export default class SynthAdapter {
  constructor(path, moduleId, envelope) {
    this.path = path;
    this.moduleId = moduleId;

    if (
      envelope &&
      typeof envelope.xa === "number" &&
      typeof envelope.xd === "number" &&
      typeof envelope.ys === "number" &&
      typeof envelope.xr === "number"
    ) {
      this.envelope = envelope;
    } else if (!envelope) {
      this.envelope = {
        xa: 0,
        xd: 0,
        ys: 1,
        xr: 0.5
      };
    } else {
      throw new Error(
        "Parameter 'envelope' need values of type 'number': xa, xd, ys, xr"
      );
    }

    this.worklet = null;
    this.context = null;

    this.onEnvelopeChange = this.onEnvelopeChange.bind(this);
    this.onNoteOn = this.onNoteOn.bind(this);
    this.onNoteOff = this.onNoteOff.bind(this);
  }

  async init() {
    if (!this.context) {
      this.context = new AudioContext();
      await this.context.audioWorklet.addModule(this.path);
      this.worklet = new AudioWorkletNode(this.context, this.moduleId);
      this.worklet.connect(this.context.destination);

      const { xa, xd, ys, xr } = this.envelope;
      this.onEnvelopeChange("xa")({ xa });
      this.onEnvelopeChange("xd")(xd);
      this.onEnvelopeChange("ys")(ys);
      this.onEnvelopeChange("xr")(xr);
    }

    if (this.context.state !== "running" && this.worklet) {
      await this.context.resume();
    }

    // NOTE: On the first note, we launch the audioContext but want to trigger
    // a note right afterwards in Piano.playNote. Hence we return true here only
    // once the context is running and the worklet has been loaded.
    return this.context.state === "running" && this.worklet;
  }

  async onNoteOn(key) {
    await this.init();

    this.worklet.port.postMessage({
      name: "NoteOn",
      key
    });
  }

  onNoteOff(key) {
    this.worklet.port.postMessage({
      name: "NoteOff",
      key
    });
  }

  onEnvelopeChange(key) {
    return async value => {
      if (!(await this.init())) return;

      value = SynthAdapter.calcEnvelopeMapping(key, value);
      this.worklet.port.postMessage({
        name: "Envelope",
        key,
        value
      });
    };
  }

  static calcEnvelopeMapping(key, value) {
    const microseconds = 1000 * 1000;

    if (key === "xa") {
      const limit = 20 * microseconds;
      return {
        xa: Math.round(Math.exp(Math.log(limit) * value.xa))
      };
    } else if (key === "xd" || key === "xr") {
      const limit = 60 * microseconds;
      return Math.round(Math.exp(Math.log(limit) * value));
    } else {
      return value;
    }
  }
}
