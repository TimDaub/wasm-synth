// @format
import React from "react";
import Dygraph from "dygraphs";

let graph;

export default class Graph extends React.Component {
  shouldComponentUpdate(nextProps) {
    graph.destroy();
    graph = new Dygraph(this.refs.chart, nextProps.data);
  }
  componentDidMount() {
    const { data } = this.props;
    graph = new Dygraph(this.refs.chart, data);
  }
  render() {
    return <div ref="chart" style={{ width: "1000px", height: "600px" }} />;
  }
}
