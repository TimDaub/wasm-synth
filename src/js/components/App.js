// @format
import React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import EnvelopeGraph from "react-envelope-graph";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";

import "react-piano/dist/styles.css";

const firstNote = MidiNumbers.fromNote("c4");
const lastNote = MidiNumbers.fromNote("f7");
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: firstNote,
  lastNote: lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW
});

// For reference: https://visme.co/blog/wp-content/uploads/2016/09/website10.jpg
const theme = {
  black: "black",
  bg: "#19191c",
  fg: "#4e4e50",
  primary: "#c3063f",
  secondary: "#940641"
};

const GlobalStyle = createGlobalStyle`
	.body, html {
		background-color: ${props => props.theme.bg};
	}
	.ReactPiano__Key--active.ReactPiano__Key--natural {
		background: ${props => props.theme.primary};
		border: none;
	}
	.ReactPiano__Key--accidental {
		border-right-color: ${props => props.theme.fg};
		border-bottom-color: ${props => props.theme.fg};
		border-left-color: ${props => props.theme.fg};
		background-color: ${props => props.theme.fg};
		border-top: none;
	}
	.ReactPiano__Key--active.ReactPiano__Key--accidental {
		background-color: ${props => props.theme.primary};
		border-right-color: ${props => props.theme.black};
		border-bottom-color: ${props => props.theme.black};
		border-left-color: ${props => props.theme.black};
		border-top: none;
	}
	.ReactPiano__Key--natural {
		border: none;
	}
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  margin-bottom: -4px;
`;

const Footer = styled.footer`
  background-color: ${props => props.theme.bg};

  // NOTE: This matches the react-piano container and centers the whole
  // component on the page.
  div {
    display: flex;
    justify-content: center;
    margin-bottom: 5px;
  }
`;

const envelopeStyles = {
  line: {
    fill: "none",
    stroke: theme.primary,
    strokeWidth: 2
  },
  background: {
    fill: theme.bg
  },
  dndBox: {
    fill: "none",
    stroke: "white",
    strokeWidth: 0.1,
    height: 1,
    width: 1
  },
  dndBoxActive: {
    fill: "white"
  }
};

let worklet, context;

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      xa: 0,
      xd: 0,
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
      this.initEnvelope();
    }

    if (context.state !== "running" && worklet) {
      await context.resume();
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

    this.onEnvelopeChange("xa", { xa });
    this.onEnvelopeChange("xd", xd);
    this.onEnvelopeChange("ys", ys);
    this.onEnvelopeChange("xr", xr);
  }

  onEnvelopeChange(key, value) {
    value = this.calcEnvelopeMapping(key, value);
    worklet.port.postMessage({
      name: "Envelope",
      key,
      value
    });
    this.setState({ key: value });
  }

  calcEnvelopeMapping(key, value) {
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

  render() {
    const { xa, xd, ys, xr } = this.state;

    return (
      <ThemeProvider theme={theme}>
        <Container>
          <GlobalStyle />
          <Content>
            <EnvelopeGraph
              styles={envelopeStyles}
              width="100%"
              height="20%"
              defaultXa={xa}
              defaultXd={xd}
              defaultYs={ys}
              defaultXr={xr}
              marginTop={3}
              marginLeft={3}
              marginBottom={3}
              marginRight={3}
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
          </Content>
          <Footer>
            <Piano
              noteRange={{ first: firstNote, last: lastNote }}
              playNote={this.onNoteOn}
              stopNote={this.onNoteOff}
              width={
                Math.max(
                  document.documentElement.clientWidth,
                  window.innerWidth || 0
                ) - 200
              }
              keyboardShortcuts={keyboardShortcuts}
            />
          </Footer>
        </Container>
      </ThemeProvider>
    );
  }
}
