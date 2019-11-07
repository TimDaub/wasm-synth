// @format
Module.onRuntimeInitialized = function() {
  var button = document.querySelector("button");

  button.onclick = () => {
    play();
  };

  function play() {
    const t = 1;

    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let sinWave = Module.cwrap("SinWave", null, [
      "number",
      "number",
      "number",
      "number",
      "number"
    ]);
    let l = 1 * audioCtx.sampleRate;
    let ptr = _malloc(l);
    let heapBytes = new Uint8Array(Module.HEAPU8.buffer, ptr, l);
    heapBytes.set(new Uint8Array(l));
    sinWave(heapBytes.byteOffset, 440, audioCtx.sampleRate, 1, 0.1);
    let heapFloats = new Float32Array(
      heapBytes.buffer,
      heapBytes.byteOffset,
      l
    );

    let channels = 2;
    var myArrayBuffer = audioCtx.createBuffer(
      channels,
      // TODO: Adjust towards sampleRate * seconds
      audioCtx.sampleRate,
      audioCtx.sampleRate
    );
    for (let i = 0; i < channels; i++) {
      myArrayBuffer.copyToChannel(heapFloats, i);
    }
    var source = audioCtx.createBufferSource();
    source.buffer = myArrayBuffer;
    source.connect(audioCtx.destination);
    source.start();
  }
};
