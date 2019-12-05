#pragma once
#include <vector>

#include "voice.h"

class Voice;

using namespace std;

typedef vector<Voice*> Voices;

class VoiceManager {
private:
  int numOfVoices, sampleRate, activeVoices;
  Voices voices;
  Voice * FindFreeVoice();
  float xa, xd, ys, xr;
  void UpdateEnvelope();

public:
  VoiceManager(int sampleRate, int numOfVoices);
	void OnNoteOn(int key);
	void OnNoteOff(int key);
  vector<float> NextSample(int bufferSize);
  void SetXA(float xa);
  void SetXD(float xd);
  void SetYS(float ys);
  void SetXR(float xr);
};
