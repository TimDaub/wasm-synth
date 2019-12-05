// @format
import React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import { ThemeProvider } from "styled-components";
import "react-piano/dist/styles.css";

import EnvelopePanel from "./EnvelopePanel";
import SynthAdapter from "../SynthAdapter";
import {
  theme,
  GlobalStyle,
  Content,
  Container,
  Header,
  Footer,
  CenteredSection,
  CustomReactPiano
} from "./UIComponents";

const firstNote = MidiNumbers.fromNote("c4");
const lastNote = MidiNumbers.fromNote("b6");
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: firstNote,
  lastNote: lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW
});

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.synth = new SynthAdapter("./worklets/synth.js", "SynthWorklet");
  }

  render() {
    const maxWidth =
      Math.max(document.documentElement.clientWidth, window.innerWidth || 0) -
      theme.horizontalPadding;

    return (
      <ThemeProvider theme={theme}>
        <Container>
          <GlobalStyle />
          <CustomReactPiano />
          <Content>
            <Header>
              <h1>WASM SYNTH</h1>
            </Header>
            <CenteredSection>
              <EnvelopePanel synth={this.synth} />
              />
            </CenteredSection>
          </Content>
          <Footer>
            <Piano
              noteRange={{ first: firstNote, last: lastNote }}
              playNote={this.synth.onNoteOn}
              stopNote={this.synth.onNoteOff}
              width={maxWidth + 100}
              keyboardShortcuts={keyboardShortcuts}
            />
          </Footer>
        </Container>
      </ThemeProvider>
    );
  }
}
