#include <math.h>
#include <vector>
#include <tuple>

#include "adsr_modulator.h"

using namespace std;

const float ADSRModulator::DECAY_UPPER_LIMIT = 1.0f;
const float ADSRModulator::RELEASE_LOWER_LIMIT= 0.0f;

ADSRModulator::ADSRModulator(float xa, float ya, float xd, float ys, float xr) {
  this->xa = xa;
  this->ya = ya;
  this->xd = xd;
  this->ys = ys;
  this->xr = xr;
  this->stage = ENVELOPE_STAGE_ATTACK;
  this->xs = 0;
}

void ADSRModulator::SetStage(EnvelopeStage stage) {
  this->stage = stage;
}

float ADSRModulator::Modulate(float x, float prevX) {
    if (this->stage == ENVELOPE_STAGE_ATTACK) {
      float attack = pow(x / this->xa, 1.0f / 3.0f);

      if (attack <= this->ya) {
        return attack;
      } else {
        SetStage(ENVELOPE_STAGE_DECAY); 
      }
    }
  

    if (this->stage == ENVELOPE_STAGE_DECAY) {
		  float dx = ((this->ys - 1) / this->xd) * (x - this->xa) + 1;
		  float dl = this->ys;
		  float du = DECAY_UPPER_LIMIT;
		  float gf = pow((dx - dl) / (du - dl), 3);
		  float decay = gf * (du - dl) + dl;
      
      if (decay >= this->ys) {
        return decay;
      } else {
        SetStage(ENVELOPE_STAGE_SUSTAIN);
      }
    }

    if (this->stage == ENVELOPE_STAGE_SUSTAIN) {
      this->xs += x - prevX;
      return this->ys;
    }

    if (this->stage == ENVELOPE_STAGE_RELEASE) {
		  float rx = -1.0f * this->ys / this->xr * (x - (this->xa + this->xd + this->xs)) + this->ys;
		  float rl = RELEASE_LOWER_LIMIT;
		  float ru = this->ys;
		  float rf = pow((rx - rl) / (ru - rl), 3);
		  float release = rf * (ru - rl) + rl;
      if (release > rl) {
        return release;
      }
    }

    // NOTE: If release has successfully supplied fully, we want to
    // simply multiply by zero to create silence.
    SetStage(ENVELOPE_STAGE_OFF);
    return 0.0f;
}


void ADSRModulator::ModulateAmp(vector<Point> &buffer) {
  for (vector<int>::size_type i = 0; i < buffer.size(); i++) {
    float x = buffer[i].x;

    float prevX = 0.0f;
    if (i >= 1) {
      prevX = buffer[i - 1].x;
    }

    float y = buffer[i].y;
    buffer[i].y = y * Modulate(x, prevX);
  }
}

void ADSRModulator::SetXA(float xa) {
  this->xa = xa;
}

void ADSRModulator::SetXD(float xd) {
  this->xd = xd;
}

void ADSRModulator::SetYS(float ys) {
  this->ys = ys;
}

void ADSRModulator::SetXR(float xr) {
  this->xr = xr;
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(ADSRModulator) {
  emscripten::class_<ADSRModulator>("ADSRModulator")
    .constructor<float, float, float, float, float>()
    .function("modulateAmp", &ADSRModulator::ModulateAmp)
    .function("setXA", &ADSRModulator::SetXA)
    .function("setXD", &ADSRModulator::SetXD)
    .function("setYS", &ADSRModulator::SetYS)
    .function("setXR", &ADSRModulator::SetXR);
}

