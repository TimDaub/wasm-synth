#include <math.h>
#include <tuple>
#include <vector>

#include "oscillator.h"

#define _USE_MATH_DEFINES

Oscillator::Oscillator() {}

Oscillator::Oscillator(int wave, int sampleRate) {
  this->wave = wave;
  this->sampleRate = sampleRate;
  level = 0;
}

vector<Point> Oscillator::NextSample(int key, int iteration, int bufferSize) {
  vector<Point> buffer;
  for (int i = 0; i < bufferSize; i++) {
    float n = i + iteration * bufferSize;
    float x = FrequencyConstant(key) * n / this->sampleRate;
    // TODO: Integrate tuning later, this might be helpful: https://forum.cockos.com/archive/index.php/t-177881.html
    //float tuning = pow(2.0, 1000/ 1200.0);
    buffer.push_back({x, sin(x) * level});
  }
  
  return buffer;
}

float Oscillator::FrequencyConstant(int key) {
  return 2.0 * M_PI * pow(2.0, (key - 69.0) / 12.0) * 440.0;
}

void Oscillator::SetLevel(float value) {
  level = value;
}


#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(Oscillator) {
  emscripten::class_<Oscillator>("Oscillator")
    .constructor<>()
    .constructor<int, int>()
    .function("nextSample", &Oscillator::NextSample)
    .function("frequencyConstant", &Oscillator::FrequencyConstant)
    .function("setLevel", &Oscillator::SetLevel);
}
