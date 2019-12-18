#pragma once
#include <vector>
#include <tuple>

#include "types.h"
#include "voice_manager.h"

using namespace std;

enum WaveForm {
  SIN = 0,
  SQUARE_DIGITAL,
  SQUARE_3,
  SQUARE_4,
  SQUARE_6,
  SQUARE_8,
  SQUARE_16,
  SQUARE_32,
  SQUARE_64,
  SAW_DIGITAL,
  SAW_3,
  SAW_4,
  SAW_6,
  SAW_8,
  SAW_16,
  SAW_32,
  SAW_64,
  TRIANGLE
};

class Oscillator {
private:
  int sampleRate;
  WaveForm wave;
  float level;
  vector<Point> buffer;
  friend class VoiceManager;
  float DigitalSquareWave(float x);
  float SinoidSquareWave(float x, int factor);
  float SinoidSawWave(float x, int factor);
  float DigitalSawWave(float x);

public:
  Oscillator();
  Oscillator(WaveForm wave, int sampleRate);
  vector<Point> NextSample(int key, int iteration, int bufferSize);
  static float FrequencyConstant(int key);
  void SetLevel(float value);
};
