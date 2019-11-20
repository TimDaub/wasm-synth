#include "voice_manager.h"

VoiceManager::VoiceManager(int sampleRate, int numOfVoices) : voices() {
  this->sampleRate = sampleRate;
  this->numOfVoices = numOfVoices;
  this->voices.reserve(this->numOfVoices);
  for (int i = 0; i < this->numOfVoices; i++) {
    this->voices.push_back(new Voice(sampleRate));
  }
}

// TODO:
// - Remove envelope values from OnNoteOn
// - Initialize Voice (Modulator) with standard values
// - On VoiceManager, have a method to query for these values
// - In Synth, on launch read these values and send them to the UI
// - Update envelope values through VoiceManager and make sure they end up
// being updated in all voices.

void VoiceManager::OnNoteOn(int key, float xa, float xd, float ys, float xr) {
  Voice *v = FindFreeVoice();
  v->key = key;
  v->isActive = true;
}

void VoiceManager::OnNoteOff(int key) {
  for (Voices::iterator it = this->voices.begin(); it != this->voices.end(); ++it) {
    Voice *v = *it;
    if (v->key == key && v->isActive) {
      v->isActive = false;
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

vector<float> VoiceManager::NextSample(int iteration, int bufferSize) {
  vector<float> sample(bufferSize, 0.0f);
  for (Voices::iterator it = this->voices.begin(); it != this->voices.end(); ++it) {
    Voice *v = *it;
    if (v->isActive) {
      vector<Point> voiceSample = v->o->NextSample(v->key, iteration, bufferSize);
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
    .function("nextSample", &VoiceManager::NextSample);;
  emscripten::register_vector<float>("vector<float>");
}
