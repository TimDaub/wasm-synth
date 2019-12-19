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

const styles = {
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

const listTheme = {
  a: {
    color: "#FAFAFA",
    bg: theme.secondary
  },
  b: {
    color: "#FAFAFA",
    bg: "#2274A5"
  },
  c: {
    color: "#FAFAFA",
    bg: "#F2D0A4"
  },
  d: {
    color: "#FAFAFA",
    bg: "#83B692"
  }
};

export default class EnvelopePanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // TODO: When finalizing the interface, make this state variable adjustable
      oscSelected: 0,
      envelope: null
    };
  }

  render() {
    const {
      synth: {
        onEnvelopeChange,
        onLevelChange,
        calcEnvelopeMapping,
        envelope: { xa: defaultXa, xd: defaultXd, ys: defaultYs, xr: defaultXr }
      }
    } = this.props;
    const { oscSelected, envelope } = this.state;
    const mappedEnvelope = calcEnvelopeMapping(
      envelope || this.props.synth.envelope
    );

    return (
      <Panel>
        <List width="10%" directionColumn>
          {/*https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2019/01/25-Bright-Neon-Color-Palettes11.jpg*/}
          {Object.keys(listTheme).map((k, i) => (
            <Element justifySpaceAround itemsCenter key={k}>
              <Knob
                onChange={v => onLevelChange(i)(Math.abs(v + 100) / 100)}
                name="Level"
                unit="dB"
                defaultPercentage={0.5}
                bg={listTheme[k].bg}
                fg={listTheme[k].color}
                mouseSpeed={5}
                transform={p => parseInt(p * 50, 10) - 50}
                style={{
                  fontSize: 35,
                  height: "1.1em",
                  color: listTheme[k].color
                }}
              />
              <Toggle bg={listTheme[k].bg} color={listTheme[k].color}>
                A
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
          defaultXa={defaultXa}
          defaultXd={defaultXd}
          defaultYs={defaultYs}
          defaultXr={defaultXr}
          ratio={{
            xa: 0.25,
            xd: 0.25,
            xr: 0.25
          }}
          onChange={envelope =>
            this.setState({ envelope }) ||
            onEnvelopeChange(oscSelected)(envelope)
          }
        />
        <BorderList width="20%" directionColumn>
          {/*https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2019/01/25-Bright-Neon-Color-Palettes11.jpg*/}
          <Row justifySpaceAround itemsCenter>
            <TimeKnob name="Attack" value={mappedEnvelope.xa} />
            <TimeKnob name="Decay" value={mappedEnvelope.xd} />
            <DecibelKnob name="Sustain" value={mappedEnvelope.ys} />
            <TimeKnob name="Release" value={mappedEnvelope.xr} />
          </Row>
          <Row justifySpaceAround itemsCenter>
            <WaveGraph />
          </Row>
        </BorderList>
      </Panel>
    );
  }
}
