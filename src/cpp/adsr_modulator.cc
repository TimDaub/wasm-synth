#include <math.h>
#include <vector>
#include <tuple>

#include "adsr_modulator.h"

using namespace std;

const float ADSRModulator::DECAY_UPPER_LIMIT = 1.0f;
const float ADSRModulator::RELEASE_LOWER_LIMIT= 0.0f;

ADSRModulator::ADSRModulator(float xa, float ya, float xd, float xs, float ys,
                             float xr) {
  this->xa = xa;
  this->ya = ya;
  this->xd = xd;
  this->xs = xs;
  this->ys = ys;
  this->xr = xr;
  this->elapsedSustain = 0.0f;
}

float ADSRModulator::Modulate(float x, float prevX) {
    float attack = pow(x / this->xa, 1.0f / 3.0f);

		float dx = ((this->ys - 1) / this->xd) * (x - this->xa) + 1;
		float dl = this->ys;
		float du = DECAY_UPPER_LIMIT;
		float gf = pow((dx - dl) / (du - dl), 3);
		float decay = gf * (du - dl) + dl;

		float rx = -1.0f * this->ys / this->xr * (x - (this->xa + this->xd + this->xs)) + this->ys;
		float rl = RELEASE_LOWER_LIMIT;
		float ru = this->ys;
		float rf = pow((rx - rl) / (ru - rl), 3);
		float release = rf * (ru - rl) + rl;

    if (attack <= this->ya) {
      return attack;
    } else if (decay >= this->ys) {
      return decay;
    } else if (elapsedSustain < this->xs) {
      this->elapsedSustain += x - prevX;
			return this->ys;
		} else if (release > rl) {
			return release;
		} else {
      // NOTE: If release has successfully supplied fully, we want to simply
      // multiply by zero to create silence.
      return 0.0f;
		}
}


vector<tuple<float, float>> ADSRModulator::ModulateAmp(vector<tuple<float, float>> buffer) {
  for (vector<int>::size_type i = 0; i < buffer.size(); i++) {
    float x = get<0>(buffer[i]);
    float prevX = get<0>(buffer[i - 1]);
    float y = get<1>(buffer[i]);
    get<1>(buffer[i]) = y * Modulate(x, prevX);
  }

  return buffer;
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(ADSRModulator) {
  emscripten::class_<ADSRModulator>("ADSRModulator")
    .constructor<float, float, float, float, float, float>()
    .function("ModulateAmp", &ADSRModulator::ModulateAmp);
}

