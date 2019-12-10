// @format
import React from "react";
import EnvelopeGraph from "react-envelope-graph";
import Flex from "react-styled-flexbox";

import {
  theme,
  BorderList,
  Panel,
  StyledGraph,
  List,
  Element,
  Row
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
    length: 3,
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

  return (
    <Panel>
      <List width="50%" directionColumn={true}>
        <Element />
        <Element />
        <Element />
        <Element />
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
