#include "voice_manager.h"

VoiceManager::VoiceManager(int sampleRate, int numOfVoices) : voices() {
  this->sampleRate = sampleRate;
  this->numOfVoices = numOfVoices;
  this->voices.reserve(this->numOfVoices);
  for (int i = 0; i < this->numOfVoices; i++) {
    this->voices.push_back(new Voice(sampleRate));
  }
}

void VoiceManager::SetXA(float xa) {
  this->xa = xa;
  UpdateEnvelope();
}

void VoiceManager::SetXD(float xd) {
  this->xd = xd;
  UpdateEnvelope();
}

void VoiceManager::SetYS(float ys) {
  this->ys = ys;
  UpdateEnvelope();
}

void VoiceManager::SetXR(float xr) {
  this->xr = xr;
  UpdateEnvelope();
}

void VoiceManager::UpdateEnvelope() {
  for (Voices::iterator it = this->voices.begin(); it != this->voices.end(); ++it) {
    Voice *v = *it;
    if (v->isActive) {
      v->SetEnvelope(this->xa, this->xd, this->ys, this->xr);
    }
  }
}

void VoiceManager::OnNoteOn(int key) {
  Voice *v = FindFreeVoice();
  v->key = key;
  v->iteration = 0;
  v->isActive = true;
  v->m->ya = 1.0;
  UpdateEnvelope();
  v->m->stage = ADSRModulator::ENVELOPE_STAGE_ATTACK;
}

void VoiceManager::OnNoteOff(int key) {
  for (Voices::iterator it = this->voices.begin(); it != this->voices.end(); ++it) {
    Voice *v = *it;
    if (v->key == key && v->isActive) {
      v->m->stage = ADSRModulator::ENVELOPE_STAGE_RELEASE;
    }
  }
}

Voice * VoiceManager::FindFreeVoice() {
  for (Voices::iterator it = this->voices.begin(); it != this->voices.end(); ++it) {
    Voice *v = *it;
    if (!v->isActive) {
      return v;
    }
  }
  return NULL;
}

vector<float> VoiceManager::NextSample(int bufferSize) {
  vector<float> sample(bufferSize, 0.0f);
  for (Voices::iterator it = this->voices.begin(); it != this->voices.end(); ++it) {
    Voice *v = *it;
  
    if (v->m->stage == ADSRModulator::ENVELOPE_STAGE_OFF) {
      v->isActive = false;
      continue;
    }

    if (v->isActive) {
      vector<Point> voiceSample = v->NextSample(bufferSize);
        for (int i = 0; i < bufferSize; i++) {
          sample[i] += voiceSample[i].y;
        }
    }
  }

  return sample;
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(VoiceManager) {
  emscripten::class_<VoiceManager>("VoiceManager")
    .constructor<int, int>()
    .function("onNoteOn", &VoiceManager::OnNoteOn)
    .function("onNoteOff", &VoiceManager::OnNoteOff)
    .function("nextSample", &VoiceManager::NextSample)
    .function("setXA", &VoiceManager::SetXA)
    .function("setXD", &VoiceManager::SetXD)
    .function("setYS", &VoiceManager::SetYS)
    .function("setXR", &VoiceManager::SetXR);
  emscripten::register_vector<float>("vector<float>");
}
