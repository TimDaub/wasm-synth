#include "voice.h"

Voice::Voice(int sampleRate) {
	this->o = new Oscillator(0, sampleRate);
  this->isActive = false;
}

Voice::Voice() {
  this->isActive = false;
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(Voice) {
  emscripten::class_<Voice>("Voice")
    .constructor<>()
    .constructor<int>();
}
