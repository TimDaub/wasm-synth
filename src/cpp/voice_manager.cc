#include "voice_manager.h"

VoiceManager::VoiceManager(int sampleRate, int numOfVoices,
                           int numOfOscillators) : voices() {
  this->sampleRate = sampleRate;
  this->numOfVoices = numOfVoices;
  this->numOfOscillators = numOfOscillators;
  this->voices.reserve(this->numOfVoices);

  for (int i = 0; i < this->numOfVoices; i++) {
    this->voices.push_back(new Voice(sampleRate, this->numOfOscillators));
  }
}

void VoiceManager::UpdateEnvelope(int i, float xa, float xd, float ys, float xr,
                                  float ya) {
  envelopes[i] = { xa, xd, ys, xr, ya };
  SetEnvelope(i);
}

void VoiceManager::SetEnvelope(int i) {
  for (Voices::iterator it = this->voices.begin(); it != this->voices.end(); ++it) {
    Voice *v = *it;
    if (v->isActive) {
      v->SetEnvelope(i, envelopes[i]);
    }
  }
}

void VoiceManager::SetAllEnvelopes() {
  for (int i = 0; i < numOfOscillators; ++i) {
    SetEnvelope(i);
  }
}

void VoiceManager::OnNoteOn(int key) {
  Voice *v = FindFreeVoice();
  v->key = key;
  v->iteration = 0;
  v->isActive = true;
  SetAllEnvelopes();
  SetAllLevels();
  v->SetStage(ADSRModulator::ENVELOPE_STAGE_ATTACK);
}

void VoiceManager::OnNoteOff(int key) {
  for (Voices::iterator it = this->voices.begin(); it != this->voices.end(); ++it) {
    Voice *v = *it;
    if (v->key == key && v->isActive) {
      v->SetStage(ADSRModulator::ENVELOPE_STAGE_RELEASE);
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
  
    if (v->isActive) {
      vector<float> voiceSample = v->NextSample(bufferSize);
        for (int i = 0; i < bufferSize; i++) {
          // TODO: Make total gain a UI element
          sample[i] += voiceSample[i] * 0.1;
        }
    }
  }

  return sample;
}

void VoiceManager::UpdateLevel(int i, float value) {
  levels[i] = value;
  SetLevel(i);
}

void VoiceManager::SetLevel(int i) {
  for (Voices::iterator it = this->voices.begin(); it != this->voices.end(); ++it) {
    Voice *v = *it;
    if (v->isActive) {
      v->SetLevel(i, levels[i]);
    }
  }
}

void VoiceManager::SetAllLevels() {
  for (int i = 0; i < numOfOscillators; ++i) {
    SetLevel(i);
  }
}

void VoiceManager::UpdateWaveForm(int i, int w) {
  Oscillator::WaveForm wCast = static_cast<Oscillator::WaveForm>(w);
  for (Voices::iterator it = this->voices.begin(); it != this->voices.end(); ++it) {
    Voice *v = *it;
    v->SetWaveForm(i, wCast);
  }
}

void VoiceManager::EnableOscillator(int i, bool b) {
  for (Voices::iterator it = this->voices.begin(); it != this->voices.end(); ++it) {
    Voice *v = *it;
    v->EnableOscillator(i, b);
  }
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(VoiceManager) {
  emscripten::class_<VoiceManager>("VoiceManager")
    .constructor<int, int, int>()
    .function("onNoteOn", &VoiceManager::OnNoteOn)
    .function("onNoteOff", &VoiceManager::OnNoteOff)
    .function("nextSample", &VoiceManager::NextSample)
    .function("updateLevel", &VoiceManager::UpdateLevel)
    .function("updateEnvelope", &VoiceManager::UpdateEnvelope)
    .function("updateWaveForm", &VoiceManager::UpdateWaveForm)
    .function("enableOscillator", &VoiceManager::EnableOscillator);
  emscripten::register_vector<float>("vector<float>");
}
