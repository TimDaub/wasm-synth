// @format
import React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import EnvelopeGraph from "react-envelope-graph";

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
  }

  keyToFrequency(num) {
    // NOTE: From https://en.wikipedia.org/wiki/Piano_key_frequencies
    return Math.pow(2, (num - 49) / 12) * 440;
  }

  playMIDI(key) {
    const freq = this.keyToFrequency(key);
    const vals = Module.SinWave();

    let p = (123 * 2 * Math.PI) / 44100;
    let data = [];
    for (let i = 0; i < 44100; i++) {
      data.push([p * i, vals.get(i)]);
    }
    this.setState({ data });
  }

  render() {
    const { data } = this.state;

    return (
      <div>
        <EnvelopeGraph
          height={20}
          width={100}
          a={0}
          d={5}
          s={1}
          r={(1 / 4) * 50}
        />
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
