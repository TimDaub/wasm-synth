#include <math.h>
#include <tuple>
#include <vector>

#include "oscillator.h"

#define _USE_MATH_DEFINES

Oscillator::Oscillator(int wave, float frequency, float sampleRate,
                       int bufferSize) {
  this->wave = wave;
  this->frequency = frequency;
  this->sampleRate = sampleRate;
  this->bufferSize = bufferSize;
}

// void Oscillator::SetWave(Wave wave) {
//   this->wave = wave;
// } 
// 
// void Oscillator::SetFrequency(float frequency) {
//   this->frequency = frequency;
// } 
// 
// void Oscillator::SetSampleRate(float sampleRate) {
//   this->sampleRate = sampleRate;
// } 
// 
// void Oscillator::SetBufferSize(float bufferSize) {
//   this->bufferSize = bufferSize;
// } 

std::vector<std::tuple<float, float>> Oscillator::Compute(std::vector<std::tuple<float, float>> buffer) {
  float c = 2 * M_PI * this->frequency / this->sampleRate;

  for (int i = 0; i < this->bufferSize; i++) {
		float x = c * i;
		buffer.emplace_back(x, sin(x));
  }

	return buffer;
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(Oscillator) {
  emscripten::class_<Oscillator>("Oscillator")
    .constructor<int, float, float, int>()
    .function("Compute", &Oscillator::Compute);
}
