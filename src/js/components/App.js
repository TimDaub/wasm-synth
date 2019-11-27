// @format
import React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import EnvelopeGraph from "react-envelope-graph";

import Graph from "./Graph";

const firstNote = MidiNumbers.fromNote("c4");
const lastNote = MidiNumbers.fromNote("f5");
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: firstNote,
  lastNote: lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW
});

let data = [];
let worklet, context;

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      a: 0,
      d: 5,
      s: 0.999,
      r: (1 / 4) * 50,
      clicked: false,
      resume: false
    };

    this.onNoteOn = this.onNoteOn.bind(this);
    this.onNoteOff = this.onNoteOff.bind(this);
  }

  async resume() {
    const { clicked, resume } = this.state;

    if (!clicked) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
      await context.audioWorklet.addModule("./worklets/synth.js");
      worklet = new AudioWorkletNode(context, "SynthWorklet");
      worklet.connect(context.destination);
      this.setState({ clicked: true });
    }

    if (!resume) {
      await context.resume();
      this.setState({ resume: true });
    }

    // NOTE: On the first note, we launch the audioContext but want to trigger
    // a note right afterwards in Piano.playNote. Hence we return true here to
    // continue the chain of execution.
    return true;
  }

  onNoteOn(key) {
    worklet.port.postMessage({
      name: "NoteOn",
      key
    });
  }

  onNoteOff(key) {
    worklet.port.postMessage({
      name: "NoteOff",
      key
    });
  }

  render() {
    const { data, a, d, s, r } = this.state;

    return (
      <div>
        <EnvelopeGraph height={20} width={100} a={a} d={d} s={s} r={r} />
        <Piano
          noteRange={{ first: firstNote, last: lastNote }}
          playNote={async key =>
            (await this.resume.bind(this)()) && this.onNoteOn(key)
          }
          stopNote={this.onNoteOff}
          width={1000}
          keyboardShortcuts={keyboardShortcuts}
        />
        {data.length ? <Graph data={data} /> : null}
      </div>
    );
  }
}
