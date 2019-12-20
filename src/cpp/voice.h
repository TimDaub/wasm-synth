#pragma once
#include <numeric>

#include "oscillator.h"
#include "adsr_modulator.h"

typedef vector<Oscillator *> Oscillators;
typedef vector<ADSRModulator *> ADSRModulators;

class Voice {
private:
  Oscillators oscillators;
  ADSRModulators modulators;

public:
  // TODO: Make all parameters private again
  int key, iteration, numOfOscillators;
  bool isActive;
  Voice();
  Voice(int sampleRate, int numOfOscillators);
  vector<float> NextSample(int bufferSize);
  void SetEnvelope(int i, EnvelopePreset envelope);
  void SetLevel(int i, float value);
  void SetStage(ADSRModulator::EnvelopeStage stage);
  void SetWaveForm(int i, Oscillator::WaveForm w);
  void EnableOscillator(int i, bool b);
};
