// @format
import React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import { ThemeProvider } from "styled-components";
import Flex from "react-styled-flexbox";
import { Midi } from "@tonejs/midi";

import EnvelopePanel from "./EnvelopePanel";
import SynthAdapter from "../SynthAdapter";
import {
  theme,
  GlobalStyle,
  Content,
  Container,
  Logo,
  Footer,
  CustomReactPiano,
  ReactPianoStyle
} from "./UIComponents";
import queen from "../../assets/queen.mid";

const firstNote = MidiNumbers.fromNote("c4");
const lastNote = MidiNumbers.fromNote("b6");
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: firstNote,
  lastNote: lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW
});

let time = 0;
export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.synth = new SynthAdapter("./worklets/synth.js", "SynthWorklet");
    this.state = {
      active: []
    };
  }

  async componentDidMount() {
    const midi = await new Midi.fromUrl(queen);
    const piano = midi.tracks[2].notes;
    const mapped = piano.map(note => {
      return {
        midiNumber: note.midi,
        time: note.time,
        duration: note.duration
      };
    });

    setInterval(() => {
      const active = mapped.filter(note => {
        return time > note.time && time < note.time + note.duration;
      });
      time += 0.1;
      this.setState({ active });
    }, 100);
  }

  render() {
    const maxWidth =
      Math.max(document.documentElement.clientWidth, window.innerWidth || 0) -
      theme.horizontalPadding;
    const keys = this.state.active.map(note => note.midiNumber);

    return (
      <ThemeProvider theme={theme}>
        <Container>
          <GlobalStyle />
          <ReactPianoStyle />
          <CustomReactPiano />
          <Content>
            <Logo>
              <h1>WASM SYNTH</h1>
            </Logo>
            <EnvelopePanel synth={this.synth} />
          </Content>
          <Footer>
            <Piano
              noteRange={{ first: firstNote, last: lastNote }}
              playNote={this.synth.onNoteOn}
              stopNote={this.synth.onNoteOff}
              width={maxWidth + 100}
              keyboardShortcuts={keyboardShortcuts}
              activeNotes={keys}
            />
          </Footer>
        </Container>
      </ThemeProvider>
    );
  }
}
