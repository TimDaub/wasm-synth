#include "voice.h"

Voice::Voice(int sampleRate) {
	this->o = new Oscillator(0, sampleRate);
	this->m = new ADSRModulator(sampleRate);
  this->isActive = false;
}

Voice::Voice() {
  this->isActive = false;
}

vector<Point> Voice::NextSample(int bufferSize) {
  vector<Point> buf = this->o->NextSample(this->key, this->iteration, bufferSize);
  this->m->ModulateAmp(buf);
  this->iteration++;
  return buf;
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(Voice) {
  emscripten::class_<Voice>("Voice")
    .constructor<>()
    .constructor<int>()
    .function("nextSample", &Voice::NextSample);
}
