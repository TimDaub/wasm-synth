// @format
import React from "react";
import EnvelopeGraph from "react-envelope-graph";
import Flex from "react-styled-flexbox";
import Knob from "react-simple-knob";

import { TimeKnob, DecibelKnob } from "./Knobs";
import WaveGraph from "./WaveGraph";
import {
  theme,
  BorderList,
  Panel,
  List,
  Element,
  Row,
  Toggle
} from "./UIComponents";

let styles = {
  line: {
    fill: "none",
    stroke: theme.secondary,
    strokeWidth: 2
  },
  dndBox: {
    fill: "none",
    stroke: theme.white,
    strokeWidth: 0.1,
    height: 1,
    width: 1
  },
  dndBoxActive: {
    fill: theme.white
  },
  corners: {
    strokeWidth: 0.1,
    length: 1.5,
    stroke: theme.white
  }
};

export default class EnvelopePanel extends React.Component {
  constructor(props) {
    super(props);

    const { envelope } = props.synth;

    this.state = {
      // TODO: When finalizing the interface, make this state variable adjustable
      oscSelected: 0,
      oscillators: [
        {
          label: "a",
          color: "#FAFAFA",
          bg: theme.secondary,
          envelope
        },
        {
          label: "b",
          color: "#FAFAFA",
          bg: "#2274A5",
          envelope
        },
        {
          label: "c",
          color: "#FAFAFA",
          bg: "#F2D0A4",
          envelope
        },
        {
          label: "d",
          color: "#FAFAFA",
          bg: "#83B692",
          envelope
        }
      ]
    };

    this.handleEnvelopeChange = this.handleEnvelopeChange.bind(this);
  }

  handleEnvelopeChange(envelope) {
    const {
      synth: { onEnvelopeChange }
    } = this.props;
    let { oscillators, oscSelected } = this.state;

    oscillators[oscSelected].envelope = envelope;
    onEnvelopeChange(oscSelected)(envelope);
    this.setState({ oscillators });
  }

  render() {
    const {
      synth: { onLevelChange, calcEnvelopeMapping }
    } = this.props;
    const { oscSelected, oscillators } = this.state;
    const selected = oscillators[oscSelected];
    const mappedEnvelope = calcEnvelopeMapping(selected.envelope);

    styles.line.stroke = selected.bg;

    return (
      <Panel>
        <List width="15%" directionColumn>
          {/*https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2019/01/25-Bright-Neon-Color-Palettes11.jpg*/}
          {oscillators.map((elem, i) => (
            <Element
              onMouseDown={() => this.setState({ oscSelected: i })}
              justifySpaceAround
              itemsCenter
              key={i}
              style={{
                border: i === oscSelected ? "1px solid #555" : "1px solid black"
              }}
            >
              <Knob
                onChange={v => onLevelChange(i)(Math.abs(v + 100) / 100)}
                name="Level"
                unit="dB"
                defaultPercentage={0.5}
                bg={elem.bg}
                fg={elem.color}
                mouseSpeed={5}
                transform={p => parseInt(p * 50, 10) - 50}
                style={{
                  fontSize: 35,
                  height: "1.1em",
                  color: elem.color
                }}
              />
              <Toggle bg={elem.bg} color={elem.color}>
                {elem.label.toUpperCase()}
              </Toggle>
            </Element>
          ))}
        </List>
        <EnvelopeGraph
          style={{
            minWidth: "68%",
            padding: ".5%",
            backgroundColor: theme.bg,
            borderRadius: theme.radius.light,
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderRight: "1px solid black",
            borderBottom: "3px solid black"
          }}
          styles={styles}
          defaultXa={selected.envelope.xa}
          defaultXd={selected.envelope.xd}
          defaultYs={selected.envelope.ys}
          defaultXr={selected.envelope.xr}
          ratio={{
            xa: 0.25,
            xd: 0.25,
            xr: 0.25
          }}
          onChange={this.handleEnvelopeChange}
        />
        <BorderList width="20%" directionColumn>
          {/*https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2019/01/25-Bright-Neon-Color-Palettes11.jpg*/}
          <Row justifySpaceAround itemsCenter>
            <TimeKnob
              color={selected.bg}
              name="Attack"
              value={mappedEnvelope.xa}
            />
            <TimeKnob
              color={selected.bg}
              name="Decay"
              value={mappedEnvelope.xd}
            />
            <DecibelKnob
              color={selected.bg}
              name="Sustain"
              value={mappedEnvelope.ys}
            />
            <TimeKnob
              color={selected.bg}
              name="Release"
              value={mappedEnvelope.xr}
            />
          </Row>
          <Row justifySpaceAround itemsFlexStart>
            <WaveGraph color={selected.bg} />
          </Row>
        </BorderList>
      </Panel>
    );
  }
}
