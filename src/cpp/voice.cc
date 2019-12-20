#include "voice.h"

Voice::Voice(int sampleRate, int numOfOscillators) : oscillators(), modulators() {
  this->isActive = false;
  this->numOfOscillators = numOfOscillators;

  this->oscillators.reserve(this->numOfOscillators);
  this->modulators.reserve(this->numOfOscillators);
  for (int i = 0; i < this->numOfOscillators; i++) {
    this->oscillators.push_back(new Oscillator(Oscillator::SINE, sampleRate));
    this->modulators.push_back(new ADSRModulator(sampleRate));
  }
}

Voice::Voice() {
  this->isActive = false;
}

void Voice::SetLevel(int i, float value) {
  Oscillator *o = oscillators[i];
  o->SetLevel(value);
}

void Voice::SetStage(ADSRModulator::EnvelopeStage stage) {
  for (int i = 0; i < numOfOscillators; ++i) {
    ADSRModulator *m = modulators[i];
    m->SetStage(stage);
  }
}

vector<float> Voice::NextSample(int bufferSize) {
  vector<float> buf(bufferSize, 0.0);
  vector<bool> modsOn(numOfOscillators, false);

  for (int i = 0; i < numOfOscillators; ++i) {
    Oscillator *o = oscillators[i];
    if (!o->GetStatus()) {
      // NOTE: If the oscillator is deactivated, we do not compute any values.
      continue;
    }
    ADSRModulator *m = modulators[i];
    vector<Point> newFrame = o->NextSample(key, iteration, bufferSize);
    modsOn[i] = m->GetStage() != ADSRModulator::ENVELOPE_STAGE_OFF;

    if (modsOn[i]) {
      m->ModulateAmp(newFrame);
      for (int j = 0; j < bufferSize; ++j) {
        buf[j] += newFrame[j].y;
      }
    }
  }

  int sum = accumulate(modsOn.begin(), modsOn.end(), 0);
  isActive = sum != 0;
  this->iteration++;
  return buf;
}

void Voice::SetEnvelope(int i, EnvelopePreset envelope) {
  ADSRModulator *m = modulators[i];
  // TODO: Put in const file
  const float microseconds = 1000.0 * 1000.0;
  // TODO: When adding tuning, we probably need to adjust FrequencyConstant
  float c = Oscillator::FrequencyConstant(this->key);
  m->SetXA(c * envelope.xa / microseconds);
  m->SetXD(c * envelope.xd / microseconds);
  m->SetXR(c * envelope.xr / microseconds);
  m->SetYS(envelope.ys);
  m->SetYA(envelope.ya);
}

void Voice::SetWaveForm(int i, Oscillator::WaveForm w) {
  Oscillator *o = oscillators[i];
  o->SetWaveForm(w);
}

void Voice::EnableOscillator(int i, bool b) {
  Oscillator *o = oscillators[i];
  o->SetStatus(b);
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(Voice) {
  emscripten::class_<Voice>("Voice")
    .constructor<>()
    .constructor<int, int>()
    .function("nextSample", &Voice::NextSample)
    .function("setEnvelope", &Voice::SetEnvelope)
    .function("setLevel", &Voice::SetLevel)
    .function("setStage", &Voice::SetStage)
    .function("setWaveForm", &Voice::SetWaveForm)
    .function("enableOscillator", &Voice::EnableOscillator);
}
