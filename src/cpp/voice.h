#pragma once
#include <numeric>

#include "oscillator.h"
#include "voice_manager.h"
#include "adsr_modulator.h"

class Oscillator;

typedef vector<Oscillator *> Oscillators;
typedef vector<ADSRModulator *> ADSRModulators;

class Voice {
private:
  Oscillators oscillators;
  ADSRModulators modulators;
  friend class VoiceManager;

public:
  int key, iteration, numOfOscillators;
  bool isActive;
  Voice();
  Voice(int sampleRate, int numOfOscillators);
  vector<float> NextSample(int bufferSize);
  void SetEnvelope(int i, EnvelopePreset envelope);
  void SetLevel(int i, float value);
  void SetStage(ADSRModulator::EnvelopeStage stage);
};
