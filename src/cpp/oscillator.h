#include <vector>
#include <tuple>

class Oscillator {
private:
  int wave, bufferSize;
  float frequency, sampleRate;
  float *buffer;

public:
  Oscillator(int wave, float frequency, float sampleRate, int bufferSize);
  //void SetWave(Wave wave);
  //void SetFrequency(float frequency);
  //void SetSampleRate(float sampleRate);
  //void SetBufferSize(float bufferSize);
  std::vector<std::tuple<float, float>> Compute(std::vector<std::tuple<float, float>>);
};
