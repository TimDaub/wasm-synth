#pragma once
#include <vector>

#include "voice.h"

class Voice;

using namespace std;

typedef vector<Voice*> Voices;

class VoiceManager {
private:
  int numOfVoices, sampleRate;
  Voices voices;
  Voice * FindFreeVoice();

public:
  VoiceManager(int sampleRate, int numOfVoices);
	void OnNoteOn(int key, float xa, float xd, float ys, float xr);
	void OnNoteOff(int key);
  vector<float> NextSample(int iteration, int bufferSize);
};
