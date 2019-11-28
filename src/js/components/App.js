// @format
import React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import EnvelopeGraph from "react-envelope-graph";

import Graph from "./Graph";

const firstNote = MidiNumbers.fromNote("c4");
const lastNote = MidiNumbers.fromNote("f7");
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
      xa: 0,
      xd: 1,
      ys: 1,
      xr: 0.1,
      clicked: false,
      resume: false
    };

    this.onNoteOn = this.onNoteOn.bind(this);
    this.onNoteOff = this.onNoteOff.bind(this);
    this.onEnvelopeChange = this.onEnvelopeChange.bind(this);
    this.resume = this.resume.bind(this);
  }

  async resume() {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
      await context.audioWorklet.addModule("./worklets/synth.js");
      worklet = new AudioWorkletNode(context, "SynthWorklet");
      worklet.connect(context.destination);
    }

    if (context.state !== "running" && worklet) {
      await context.resume();
      this.initEnvelope();
    }

    // NOTE: On the first note, we launch the audioContext but want to trigger
    // a note right afterwards in Piano.playNote. Hence we return true here only
    // once the context is running and the worklet has been loaded.
    return context.state === "running" && worklet;
  }

  async onNoteOn(key) {
    await this.resume();

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

  initEnvelope() {
    const { xa, xd, ys, xr } = this.state;

    this.onEnvelopeChange("xa", xa);
    this.onEnvelopeChange("xd", xd);
    this.onEnvelopeChange("ys", ys);
    this.onEnvelopeChange("xr", xr);
  }

  onEnvelopeChange(key, value) {
    worklet.port.postMessage({
      name: "Envelope",
      key,
      value
    });
    this.setState({ key: value });
  }

  render() {
    const { data, xa, xd, ys, xr } = this.state;

    return (
      <div>
        <EnvelopeGraph
          width="100%"
          height="20%"
          defaultXa={xa}
          defaultXd={xd}
          defaultYs={ys}
          defaultXr={xr}
          ratio={{
            xa: 0.25,
            xd: 0.25,
            xs: 0.25,
            xr: 0.25
          }}
          onAttackChange={async a =>
            (await this.resume()) && this.onEnvelopeChange("xa", a)
          }
          onDecayChange={async xd =>
            (await this.resume()) && this.onEnvelopeChange("xd", xd)
          }
          onSustainChange={async ys =>
            (await this.resume()) && this.onEnvelopeChange("ys", ys)
          }
          onReleaseChange={async xr =>
            (await this.resume()) && this.onEnvelopeChange("xr", xr)
          }
        />
        <div style={{ marginTop: "-4px" }}>
          <Piano
            noteRange={{ first: firstNote, last: lastNote }}
            playNote={this.onNoteOn}
            stopNote={this.onNoteOff}
            width={Math.max(
              document.documentElement.clientWidth,
              window.innerWidth || 0
            )}
            keyboardShortcuts={keyboardShortcuts}
          />
        </div>
        {data.length ? <Graph data={data} /> : null}
      </div>
    );
  }
}
