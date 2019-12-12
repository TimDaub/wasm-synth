// @format
import React from "react";
import EnvelopeGraph from "react-envelope-graph";
import Flex from "react-styled-flexbox";
import Knob from "react-simple-knob";

import {
  theme,
  BorderList,
  Panel,
  StyledGraph,
  List,
  Element,
  Row,
  Toggle,
  OscillatorElement
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

export default props => {
  const {
    synth: {
      onEnvelopeChange,
      envelope: { xa, xd, ys, xr }
    }
  } = props;

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

  return (
    <Panel>
      <List width="15%" directionColumn={true}>
        {/*https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2019/01/25-Bright-Neon-Color-Palettes11.jpg*/}
        {Object.keys(listTheme).map(k => (
          <OscillatorElement key={k}>
            <Knob
              onChange={console.log}
              name="Volume"
              unit="dB"
              defaultPercentage={0.7}
              bg={listTheme[k].bg}
              fg={listTheme[k].color}
              mouseSpeed={5}
              transform={p => parseInt(p * 50, 10) - 50}
              style={{
                fontSize: 35,
                height: "80%",
                color: listTheme[k].color
              }}
            />
            <Toggle bg={listTheme[k].bg} color={listTheme[k].color}>
              A
            </Toggle>
          </OscillatorElement>
        ))}
      </List>
      <StyledGraph>
        <EnvelopeGraph
          styles={styles}
          width="100%"
          height="100%"
          defaultXa={xa}
          defaultXd={xd}
          defaultYs={ys}
          defaultXr={xr}
          ratio={{
            xa: 0.25,
            xd: 0.25,
            xr: 0.25
          }}
          onAttackChange={onEnvelopeChange("xa")}
          onDecayChange={onEnvelopeChange("xd")}
          onSustainChange={onEnvelopeChange("ys")}
          onReleaseChange={onEnvelopeChange("xr")}
        />
      </StyledGraph>
      <BorderList width="40%" directionColumn={true}>
        <Row />
        <Row />
        <Row />
        <Row />
      </BorderList>
    </Panel>
  );
};
