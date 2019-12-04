// @format
import React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import EnvelopeGraph from "react-envelope-graph";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import "react-piano/dist/styles.css";

import Plexifont from "../../assets/plexifont-webfont.woff";

const firstNote = MidiNumbers.fromNote("c4");
const lastNote = MidiNumbers.fromNote("b6");
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: firstNote,
  lastNote: lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW
});

// For reference: https://visme.co/blog/wp-content/uploads/2016/09/website10.jpg
const theme = {
  black: "black",
  bg: "#19191c",
  bg2: "#131415",
  fg: "#4e4e50",
  primary: "#c3063f",
  secondary: "#940641",
  horizontalPadding: 300
};

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Plexifont';
    src: url(${Plexifont}) format('woff');
    font-weight: normal;
    font-style: normal;
  }
	.body, html {
		background-color: ${props => props.theme.bg};
	}
	.ReactPiano__Key--active.ReactPiano__Key--natural {
		background: ${props => props.theme.secondary};
		border: none;
	}
	.ReactPiano__Key--accidental {
		background-color: ${props => props.theme.bg};
		border: none;
	}
	.ReactPiano__Key--active.ReactPiano__Key--accidental {
		background-color: ${props => props.theme.secondary};
		border: none;
	}
	.ReactPiano__Key--natural {
		border: none;
	}
  .ReactPiano__Key--natural {
    box-shadow: inset 0 2px 3px rgba(0,0,0,0.75);
  }
  .ReactPiano__Key--accidental {
    box-shadow: 0px 5px 7px 1px rgba(0, 0, 0, 0.4);
  }
  .ReactPiano__Key--active.ReactPiano__Key--accidental {
    box-shadow: 0px 5px 2px 1px rgba(0, 0, 0, 0.2);
    box-shadow: inset 0px 5px 5px 0px rgba(0,0,0,.25);
  }
  .ReactPiano__Keyboard {
    font-family: Arial;
    padding: 0 2px 0 2px;
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
  margin: 0 ${props => props.theme.horizontalPadding / 2}px 0
    ${props => props.theme.horizontalPadding / 2}px;
  background-color: ${props => props.theme.bg2};
  border-left: 10px solid black;
  border-right: 10px solid black;
`;

const CenteredSection = styled.section`
  display: flex;
  justify-content: center;
`;

const Header = styled.header`
  & > h1 {
    margin-top: 20px;
    margin-left: 20px;
    font-family: "Plexifont";
    font-size: 3em;
    font-weight: bold;
    color: ${theme.primary};
    background-image: url(https://media.giphy.com/media/f4IjBQupqojhqQzKk2/giphy.gif),
      linear-gradient(rgb(185, 6, 63), rgb(185, 6, 63));
    background-blend-mode: saturation;
    background-attachment: fixed;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }
`;

const Footer = styled.footer`
  min-height: 20vh;
  background-color: black;
  border-top: 15px solid black;

  // NOTE: This matches the react-piano container and centers the whole
  // component on the page.
  div {
    display: flex;
    justify-content: center;
    padding-bottom: 5px;
  }
`;

const envelopeStyles = {
  line: {
    fill: "none",
    stroke: theme.secondary,
    strokeWidth: 2
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
  },
  corners: {
    strokeWidth: 0.1,
    length: 2,
    stroke: theme.fg
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
    const maxWidth =
      Math.max(document.documentElement.clientWidth, window.innerWidth || 0) -
      theme.horizontalPadding;

    return (
      <ThemeProvider theme={theme}>
        <Container>
          <GlobalStyle />
          <Content>
            <Header>
              <h1>WASM SYNTH</h1>
            </Header>
            <CenteredSection>
              <EnvelopeGraph
                styles={envelopeStyles}
                style={{ background: theme.bg2, padding: "5%" }}
                width={"90%"}
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
            </CenteredSection>
          </Content>
          <Footer>
            <Piano
              noteRange={{ first: firstNote, last: lastNote }}
              playNote={this.onNoteOn}
              stopNote={this.onNoteOff}
              width={maxWidth + 100}
              keyboardShortcuts={keyboardShortcuts}
            />
          </Footer>
        </Container>
      </ThemeProvider>
    );
  }
}
