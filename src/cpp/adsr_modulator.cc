#include <math.h>
#include <vector>
#include <tuple>

#include "adsr_modulator.h"

using namespace std;

const float ADSRModulator::DECAY_UPPER_LIMIT = 1.0f;
const float ADSRModulator::RELEASE_LOWER_LIMIT= 0.0f;

ADSRModulator::ADSRModulator() {}

ADSRModulator::ADSRModulator(int sampleRate) {
  this->sampleRate = sampleRate;
  this->stage = ENVELOPE_STAGE_ATTACK;
  this->sustainReached = false;
  this->level = 0.0;
  this->xMax = 0.0;
}

void ADSRModulator::SetStage(EnvelopeStage stage) {
  this->stage = stage;
}

ADSRModulator::EnvelopeStage ADSRModulator::GetStage() {
  return stage;
}

float ADSRModulator::Modulate(float x) {
    if (this->stage == ENVELOPE_STAGE_ATTACK) {
      float attack = pow(x / this->xa, 1.0f / 3.0f);

      this->level = attack;
      if (attack <= this->ya) {
        this->xMax = x;
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
      
      this->level = decay;
      if (decay >= this->ys) {
        this->xMax = x;
        return decay;
      } else {
        this->sustainReached = true;
        SetStage(ENVELOPE_STAGE_SUSTAIN);
      }
    }

    if (this->stage == ENVELOPE_STAGE_SUSTAIN) {
      this->xMax = x;
      this->level = this->ys;
      return this->ys;
    }

    if (this->stage == ENVELOPE_STAGE_RELEASE) {
		  float rx = -1.0f * this->level / this->xr * (x - this->xMax) + this->level;
		  float rl = RELEASE_LOWER_LIMIT;
      float ru = this->level;
		  float rf = pow((rx - rl) / (ru - rl), 3);
		  float release = rf * (ru - rl) + rl;
      if (release > rl) {
        return release;
      } else {
        this->xMax = 0.0;
        this->level = 0.0;
        this->sustainReached = false;
        SetStage(ENVELOPE_STAGE_OFF);
      }
    }
    
    if(this->stage == ENVELOPE_STAGE_OFF) {
      return 0.0;
    }
}


bool ADSRModulator::ModulateAmp(vector<Point> &buffer) {
  for (vector<int>::size_type i = 0; i < buffer.size(); i++) {
    float x = buffer[i].x;
    float y = buffer[i].y;

    buffer[i].y = y * Modulate(x);
  }
  return ADSRModulator::ENVELOPE_STAGE_OFF == stage;
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

void ADSRModulator::SetYA(float ya) {
  this->ya = ya;
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(ADSRModulator) {
  emscripten::class_<ADSRModulator>("ADSRModulator")
    .constructor<>()
    .constructor<int>()
    .function("modulateAmp", &ADSRModulator::ModulateAmp)
    .function("setXA", &ADSRModulator::SetXA)
    .function("setXD", &ADSRModulator::SetXD)
    .function("setYS", &ADSRModulator::SetYS)
    .function("setXR", &ADSRModulator::SetXR)
    .function("setYA", &ADSRModulator::SetYA)
    .function("setStage", &ADSRModulator::SetStage)
    .function("getStage", &ADSRModulator::GetStage);
}
