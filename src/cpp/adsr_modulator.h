#pragma once
#include <vector>
#include <tuple>

#include "types.h"

using namespace std;

struct EnvelopePreset {
  float xa;
  float xd;
  float ys;
  float xr;
  float ya;
};

class ADSRModulator {
public:
  ADSRModulator();
  ADSRModulator(int sampleRate);

  enum EnvelopeStage {
    ENVELOPE_STAGE_OFF = 0,
    ENVELOPE_STAGE_ATTACK,
    ENVELOPE_STAGE_DECAY,
    ENVELOPE_STAGE_SUSTAIN,
    ENVELOPE_STAGE_RELEASE
  };

  // NOTE: `ModulateAmp` returns a bool to signalize if it's state is off.
  // Returning `true`, means that modulation has completed.
  bool ModulateAmp(vector<Point> &buffer);
  void SetXA(float xa);
  void SetXD(float xd);
  void SetYS(float ys);
  void SetXR(float xr);
  void SetYA(float ya);
  void SetStage(EnvelopeStage stage);
  EnvelopeStage GetStage();

private:
  EnvelopeStage stage;
  int sampleRate;
  bool sustainReached;
  float xa, ya, xd, ys, xr, level, xMax;
  float Modulate(float x);
  static const float DECAY_UPPER_LIMIT, RELEASE_LOWER_LIMIT;
};
