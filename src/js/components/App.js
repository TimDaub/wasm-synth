// @format
import React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";

import Graph from "./Graph";

const firstNote = MidiNumbers.fromNote("c3");
const lastNote = MidiNumbers.fromNote("f5");
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: firstNote,
  lastNote: lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW
});

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };

    this.playMIDI = this.playMIDI.bind(this);
    this.keyToFrequency = this.keyToFrequency.bind(this);
    this.play = this.play.bind(this);
  }

  keyToFrequency(num) {
    // NOTE: From https://en.wikipedia.org/wiki/Piano_key_frequencies
    return Math.pow(2, (num - 49) / 12) * 440;
  }

  playMIDI(key) {
    const freq = this.keyToFrequency(key);
    this.play(freq);
  }

  play(f) {
    const t = 1;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioCtx.sampleRate * 2;
    const sinWave = Module.cwrap("SinWave", null, [
      "number",
      "number",
      "number",
      "number",
      "number"
    ]);

    let l = t * sampleRate;
    let ptr = _malloc(l);
    let heapBytes = new Uint8Array(Module.HEAPU8.buffer, ptr, l);
    heapBytes.set(new Uint8Array(l));
    sinWave(heapBytes.byteOffset);
    let heapFloats = new Float32Array(
      heapBytes.buffer,
      heapBytes.byteOffset,
      l
    );

    let p = (f * 2 * Math.PI) / sampleRate;
    let data = [];
    for (let i = 0; i < t * sampleRate; i++) {
      data.push([p * i, heapFloats[i]]);
    }

    let channels = 2;
    var myArrayBuffer = audioCtx.createBuffer(
      channels,
      t * sampleRate,
      sampleRate
    );
    for (let i = 0; i < channels; i++) {
      myArrayBuffer.copyToChannel(heapFloats, i);
    }
    var source = audioCtx.createBufferSource();
    source.buffer = myArrayBuffer;
    source.connect(audioCtx.destination);
    source.start();
    _free(heapBytes.byteOffset);
    this.setState({ data });
  }

  render() {
    const { data } = this.state;

    return (
      <div>
        <Piano
          noteRange={{ first: firstNote, last: lastNote }}
          playNote={this.playMIDI}
          stopNote={midiNumber => {
            // Stop playing a given note - see notes below
          }}
          width={1000}
          keyboardShortcuts={keyboardShortcuts}
        />
        {data.length ? <Graph data={data} /> : null}
      </div>
    );
  }
}
