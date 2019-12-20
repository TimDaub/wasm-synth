#pragma once
#include <vector>
#include <map>

#include "voice.h"
#include "oscillator.h"

class Voice;
struct EnvelopePreset;

using namespace std;

typedef vector<Voice*> Voices;

class VoiceManager {
private:
  int numOfVoices, sampleRate, numOfOscillators;
  Voices voices;
  Voice * FindFreeVoice();
  map<int, EnvelopePreset> envelopes;
  map<int, float> levels;
  void SetEnvelope(int i);
  void SetAllEnvelopes();
  void SetLevel(int i);
  void SetAllLevels();

public:
  VoiceManager(int sampleRate, int numOfVoices, int numOfOscillators);
	void OnNoteOn(int key);
	void OnNoteOff(int key);
  vector<float> NextSample(int bufferSize);
  void UpdateLevel(int i, float value);
  void UpdateEnvelope(int i, float xa, float xd, float ys, float xr, float ya);
  void UpdateWaveForm(int i, int w);
  void EnableOscillator(int i, bool b);
};
