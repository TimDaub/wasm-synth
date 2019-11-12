// @format
import React from "react";
import Dygraph from "dygraphs";

export default class Graph extends React.Component {
  componentDidMount() {
    const { data } = this.props;
    new Dygraph(this.refs.chart, data);
  }
  render() {
    return <div ref="chart" style={{ width: "1000px", height: "600px" }} />;
  }
}
