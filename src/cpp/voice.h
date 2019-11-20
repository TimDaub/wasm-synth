#pragma once
#include "oscillator.h"
#include "voice_manager.h"
#include "adsr_modulator.h"

class Oscillator;

class Voice {
private:
  // NOTE: For now, we only allow a single Oscillator. In the future, we
  // can add an array here.
  Oscillator *o;
  ADSRModulator *m;
  friend class VoiceManager;

public:
  int key;
  bool isActive;
  Voice();
  Voice(int sampleRate);
};
