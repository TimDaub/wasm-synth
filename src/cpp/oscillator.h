#pragma once
#include <vector>
#include <tuple>

#include "types.h"
#include "voice_manager.h"

using namespace std;


class Oscillator {
private:
  int wave, sampleRate;
  vector<Point> buffer;
  friend class VoiceManager;

public:
  Oscillator(int wave, int sampleRate);
  vector<Point> NextSample(int key, int iteration, int bufferSize);
  static float FrequencyConstant(int key);
};
