#pragma once
#include <vector>
#include <tuple>

#include "types.h"
#include "adsr_modulator.h"
#include "voice_manager.h"

using namespace std;

class Oscillator {
private:
  int wave, sampleRate;
  vector<Point> buffer;
  ADSRModulator *m;
  friend class VoiceManager;

public:
  Oscillator(int wave, int sampleRate);
  vector<Point> NextSample(int scale, int iteration, int bufferSize);
  void Connect(ADSRModulator *m);
};
