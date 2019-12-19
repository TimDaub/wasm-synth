// @format
import React from "react";

import { StyledKnob } from "./UIComponents";

export class TimeKnob extends React.Component {
  render() {
    let unit = "ms";
    let { value, name, color } = this.props;
    // TODO: Put into constants file
    const milliseconds = 1000;

    value = value / milliseconds;

    if (value >= 1) {
      value = parseInt(value, 10);
    } else {
      value = value.toFixed(2);
    }

    if (value >= 1000) {
      unit = "s";
      value = (value / milliseconds).toFixed(2);
    }

    return (
      <StyledKnob
        justifySpaceAround
        itemsCenter
        name={name}
        color={color}
      >{`${value} ${unit}`}</StyledKnob>
    );
  }
}

export class DecibelKnob extends React.Component {
  render() {
    let { value, name, color } = this.props;

    value = parseInt((value - 1) * 100, 10);

    return (
      <StyledKnob
        justifySpaceAround
        itemsCenter
        name={name}
        color={color}
      >{`${value} dB`}</StyledKnob>
    );
  }
}
