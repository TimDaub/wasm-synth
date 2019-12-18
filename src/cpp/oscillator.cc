#include <math.h>
#include <tuple>
#include <vector>

#include "oscillator.h"

#define _USE_MATH_DEFINES

Oscillator::Oscillator() {}

Oscillator::Oscillator(WaveForm wave, int sampleRate) {
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
    float y = 0.0;
    switch(wave) {
      case SIN:
        y = sin(x);
        break;
      case SQUARE_DIGITAL:
        y = DigitalSquareWave(x);
        break;
      case SQUARE_3:
        y = SinoidSquareWave(x, 3);
        break;
      case SQUARE_4:
        y = SinoidSquareWave(x, 4);
        break;
      case SQUARE_6:
        y = SinoidSquareWave(x, 6);
        break;
      case SQUARE_8:
        y = SinoidSquareWave(x, 8);
        break;
      case SQUARE_16:
        y = SinoidSquareWave(x, 16);
        break;
      case SQUARE_32:
        y = SinoidSquareWave(x, 32);
        break;
      case SQUARE_64:
        y = SinoidSquareWave(x, 64);
        break;
      default:
        // TODO: Throw error here
        break;
    }
    buffer.push_back({x, y * level});
  }
  
  return buffer;
}

float Oscillator::SinoidSquareWave(float x, int factor) {
  factor *= 2;
  float y = 0.0;
  for (int i = 1; i <= factor; ++i) {
    if (i % 2 == 1) {
      y += sin(x * i) / (i * M_PI);
    }
  }
  return y;
}

float Oscillator::DigitalSquareWave(float x) {
  // Digital Square Wave
  float y = sin(x);
  if (y >= 0) {
    y = 1;
  } else {
    y = -1;
  }
  return y;
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
    .constructor<WaveForm, int>()
    .function("nextSample", &Oscillator::NextSample)
    .function("frequencyConstant", &Oscillator::FrequencyConstant)
    .function("setLevel", &Oscillator::SetLevel);
}
