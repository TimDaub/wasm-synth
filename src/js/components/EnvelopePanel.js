// @format
import React from "react";
import EnvelopeGraph from "react-envelope-graph";

import { theme } from "./UIComponents";

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
    length: 2,
    stroke: theme.fg
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
    <EnvelopeGraph
      styles={styles}
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
        xr: 0.25
      }}
      onAttackChange={onEnvelopeChange("xa")}
      onDecayChange={onEnvelopeChange("xd")}
      onSustainChange={onEnvelopeChange("ys")}
      onReleaseChange={onEnvelopeChange("xr")}
    />
  );
};
