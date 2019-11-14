#include <math.h>
#include <new>
#include <tuple>
#include <vector>

#include "oscillator.h"
#include "adsr_modulator.h"
#include "output.h"

std::vector<float> SinWave() {
  std::vector<std::tuple<float, float>> buffer;
  Oscillator* o = new Oscillator(0, 123.0, 44100, 44100);
  buffer = o->Compute(buffer);

  Output* op = new Output(44100, 44100);

  ADSRModulator* m = new ADSRModulator(200.0f, 1.0f, 200.0f, 50.0f, 0.8f,
                                       400.0f);
  buffer = m->ModulateAmp(buffer);

  float * buf = op->ToBuffer(buffer);
  op->Play();

  std::vector<float> vecBuf(buf, buf + 44100);
  return vecBuf;
}


#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(module) {
  emscripten::function("SinWave", &SinWave);
  emscripten::register_vector<float>("vector<float>");
}
