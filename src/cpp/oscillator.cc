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
  status = true;
}

void Oscillator::SetStatus(bool s) {
  status = s;
}

vector<Point> Oscillator::NextSample(int key, int iteration, int bufferSize) {
  vector<Point> buffer;
  for (int i = 0; i < bufferSize; i++) {
    float n = i + iteration * bufferSize;
    float f = FrequencyConstant(key);
    float x = (n * f) / sampleRate;
    // TODO: Integrate tuning later, this might be helpful: https://forum.cockos.com/archive/index.php/t-177881.html
    //float tuning = pow(2.0, 1000/ 1200.0);
    float y = 0.0;
    switch(wave) {
      case SINE:
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
      case SAW_DIGITAL:
        y = DigitalSawWave(x);
        break;
      case SAW_3:
        y = SinoidSawWave(x, 3);
        break;
      case SAW_4:
        y = SinoidSawWave(x, 4);
        break;
      case SAW_6:
        y = SinoidSawWave(x, 6);
        break;
      case SAW_8:
        y = SinoidSawWave(x, 8);
        break;
      case SAW_16:
        y = SinoidSawWave(x, 16);
        break;
      case SAW_32:
        y = SinoidSawWave(x, 32);
        break;
      case SAW_64:
        y = SinoidSawWave(x, 64);
        break;
      case TRIANGLE:
        y = DigitalTriangleWave(x);
        break;
      default:
        // TODO: Throw error here
        break;
    }
    buffer.push_back({x, y * level});
  }
  
  return buffer;
}

float Oscillator::DigitalTriangleWave(float x) {
  return abs(DigitalSawWave(x));
}

// NOTE: In the spectrum analyzer, this wave has some minor frequencies too,
// while Live seems to filter those out. Not sure why that is but I like it
// this way too.
float Oscillator::DigitalSawWave(float x) {
  return 2 * ((x / M_PI) - floor(0.5 + (x / M_PI)));
}

// NOTE: https://en.wikipedia.org/wiki/Sawtooth_wave
float Oscillator::SinoidSawWave(float x, int factor) {
  factor *= 2;
  float y = 0.0;
  for (int i = 1; i <= factor; ++i) {
    // TODO: This might not be correct and we should remove the modulo opperation
    if (i % 2 == 1) {
      y += pow(-1, i) * (sin(x * i) / i);
    }
  }
  return (1/2) - ((1/M_PI) * y);
}

// NOTE: https://www.quora.com/What-is-the-equation-of-the-square-wave
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

void Oscillator::SetWaveForm(WaveForm w) {
  wave = w;
}

bool Oscillator::GetStatus() {
  return status;
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(Oscillator) {
  emscripten::class_<Oscillator>("Oscillator")
    .constructor<>()
    .constructor<Oscillator::WaveForm, int>()
    .function("nextSample", &Oscillator::NextSample)
    .function("frequencyConstant", &Oscillator::FrequencyConstant)
    .function("setLevel", &Oscillator::SetLevel)
    .function("setWaveForm", &Oscillator::SetWaveForm)
    .function("setStatus", &Oscillator::SetStatus)
    .function("getStatus", &Oscillator::GetStatus);
}
