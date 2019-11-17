#include <math.h>
#include <new>
#include <tuple>
#include <vector>

#include "oscillator.h"
#include "adsr_modulator.h"
#include "utils.h"

using namespace std;

void SinWave(float *buffer) {
  int buf_size = 512;
  int sample_rate = 44100;

  Oscillator* o = new Oscillator(0, 123.0, sample_rate, buf_size);
  vector<tuple<float, float>> wave = o->Compute();
  ADSRModulator* m = new ADSRModulator(1000.0f, 1.0f, 200.0f, 0.1f, 100.0f,
                                       400.0f);
  wave = m->ModulateAmp(wave);

  short *samples;
  samples = new short[buf_size];
  for (vector<int>::size_type i = 0; i < wave.size(); i++) {
    samples[i] = static_cast<short>(get<1>(wave[i]));
  }
}
