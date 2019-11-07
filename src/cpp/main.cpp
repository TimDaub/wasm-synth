#include <math.h>

static const float PI = 3.14159265358979f;

// time in seconds
void _SinWave(float *buffer, float frequency, int sampleRate, int time, float gain) {
  float p = frequency * 2 * PI * time / sampleRate;
  for(int i = 0; i < sampleRate; i++) {
    buffer[i] = sin(p * i) * gain;
  }
}

extern "C" {
  void SinWave(float *buffer, float frequency, int sampleRate, int time, float gain) {
    _SinWave(buffer, frequency, sampleRate, time, gain);
  }
}
