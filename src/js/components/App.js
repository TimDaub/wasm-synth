// @format
import React from "react";

import Graph from "./Graph";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };

    this.play = this.play.bind(this);
  }

  play() {
    const t = 1;
    const f = 261.6256;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioCtx.sampleRate * 2;
    const sinWave = Module.cwrap("SinWave", null, [
      "number",
      "number",
      "number",
      "number",
      "number"
    ]);

    let l = t * sampleRate;
    let ptr = _malloc(l);
    let heapBytes = new Uint8Array(Module.HEAPU8.buffer, ptr, l);
    heapBytes.set(new Uint8Array(l));
    sinWave(heapBytes.byteOffset, f, sampleRate, t, 0.1);
    let heapFloats = new Float32Array(
      heapBytes.buffer,
      heapBytes.byteOffset,
      l
    );

    let p = (f * 2 * Math.PI) / sampleRate;
    let data = [];
    for (let i = 0; i < t * sampleRate; i++) {
      data.push([p * i, heapFloats[i]]);
    }

    let channels = 2;
    var myArrayBuffer = audioCtx.createBuffer(
      channels,
      t * sampleRate,
      sampleRate
    );
    for (let i = 0; i < channels; i++) {
      myArrayBuffer.copyToChannel(heapFloats, i);
    }
    var source = audioCtx.createBufferSource();
    source.buffer = myArrayBuffer;
    source.connect(audioCtx.destination);
    source.start();
    _free(heapBytes.byteOffset);
    this.setState({ data });
  }

  render() {
    const { data } = this.state;

    return (
      <div>
        <button onClick={this.play}>Play</button>
        {data.length ? <Graph data={data} /> : null}
      </div>
    );
  }
}