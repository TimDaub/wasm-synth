# Resources

This document mostly contains interesting links on how to build a
synthesizer using web technologies.

## WebAssembly

- https://emscripten.org
- https://medium.com/@tdeniffel/pragmatic-compiling-from-c-to-webassembly-a-guide-a496cc5954b8
- [How to manage memory in
  WebAssembly](https://marcoselvatici.github.io/WASM_tutorial/)
- [Nice example on passing a `Float32Array` back and forth between JS and
  C++](https://gist.github.com/automata/5832104)

### Continous Deployment

- https://emscripten.org/docs/compiling/Travis.html

## Digital Audio

### Math and Physics

- https://en.wikipedia.org/wiki/Piano_key_frequencies
- https://www.sparknotes.com/math/trigonometry/graphs/section4/
- https://www.logicprohelp.com/forum/viewtopic.php?t=79553
- https://stackoverflow.com/questions/1073606/is-there-a-one-line-function-that-generates-a-triangle-wave/1073634#1073634
- https://www.codeproject.com/Articles/30180/Simple-Signal-Generator
- [Summing up frequencies to play chords?](http://shallowsky.com/blog/programming/python-play-chords.html)
- [Article on why we hear a clicking sound when suddenly stop outputting a sound wave](https://alemangui.github.io/blog//2015/12/26/ramp-to-value.html)
- https://en.wikipedia.org/wiki/Damped_sine_wave
- https://www.dsprelated.com
- https://docs.cycling74.com/max5/tutorials/msp-tut/mspdigitalaudio.html
- https://issuu.com/petergoldsborough/docs/thesis
- https://www.reddit.com/r/synthesizers/comments/544gfd/lets_say_i_want_to_design_and_build_synths_as_a/
- https://docs.juce.com/master/tutorial_sine_synth.html
- https://www.researchgate.net/publication/2889345_Envelope_Model_Of_Isolated_Musical_Sounds
- https://web.eecs.umich.edu/~fessler/course/100/l/l10-synth.pdf
- https://dsp.stackexchange.com/questions/2555/help-with-equations-for-exponential-adsr-envelope
- https://www.desmos.com/calculator/nduy9l2pez

### MIDI

- https://www.midi.org/specifications/item/table-1-summary-of-midi-message
- http://www.personal.kent.edu/~sbirch/Music_Production/MP-II/MIDI/midi_protocol.htm
- [It's possible to send MIDI from Ableton Live to the Web MIDI API in OS X](https://stackoverflow.com/questions/43544357/how-to-connect-web-midi-api-to-native-application-like-ableton-live)
- [Demo of using MIDI in the browser](https://codepen.io/peteranglea/pen/KZrGxo?editors=1111)

### Misc

- https://www.szynalski.com/tone-generator/

## Web Audio API

- https://marcgg.com/blog/2016/11/01/javascript-audio/
- https://github.com/cwilso/midi-synth
- https://webaudiodemos.appspot.com/slides/index.html#/23
- https://www.webaudiomodules.org/
- http://zachberry.com/talks/2014/lets-build-a-synth-with-js/#24
- Using
[`createBufferSource`](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBufferSource)
- http://teropa.info/blog/2016/08/04/sine-waves.html
we might be able to build our own oscillator in CPP
- https://www.keithmcmillen.com/blog/making-music-in-the-browser-web-audio-api-part-1/
- [WebAudio API implementation for Node.js detailing gain up and down ramping](https://github.com/audiojs/web-audio-api/blob/f80aaa6bfaaa41d418f3316d767ac0f88f6bc4e0/lib/AudioParam.js#L172)
- [Explaination on the relationship of Gain and Decibels in the WebAudio API](http://teropa.info/blog/2016/08/30/amplitude-and-loudness.html)
