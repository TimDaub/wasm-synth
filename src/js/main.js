// @format
import Dygraph from 'dygraphs';

Module.onRuntimeInitialized = function() {
  var button = document.querySelector("button");

  button.onclick = () => {
    play();
  };

  function play() {
    const t = 1;
    const f = 261.6256;

    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let sinWave = Module.cwrap("SinWave", null, [
      "number",
      "number",
      "number",
      "number",
      "number"
    ]);
    let l = t * audioCtx.sampleRate;
    let ptr = _malloc(l);
    let heapBytes = new Uint8Array(Module.HEAPU8.buffer, ptr, l);
    heapBytes.set(new Uint8Array(l));
    sinWave(heapBytes.byteOffset, f, audioCtx.sampleRate, t, 0.1);
    let heapFloats = new Float32Array(
      heapBytes.buffer,
      heapBytes.byteOffset,
      l
    );

    let p = (f * 2 * Math.PI) / audioCtx.sampleRate;
    let data = [];
    for (let i = 0; i < t * audioCtx.sampleRate; i++) {
      data.push([p * i, heapFloats[i]]);
    }

    plot(data);

    let channels = 2;
    var myArrayBuffer = audioCtx.createBuffer(
      channels,
      t * audioCtx.sampleRate,
      audioCtx.sampleRate
    );
    for (let i = 0; i < channels; i++) {
      myArrayBuffer.copyToChannel(heapFloats, i);
    }
    var source = audioCtx.createBufferSource();
    source.buffer = myArrayBuffer;
    source.connect(audioCtx.destination);
    source.start();
    _free(heapBytes.byteOffset);
  }

  function plot(data) {
		new Dygraph(document.getElementById("myChart"), data);
  }
};
