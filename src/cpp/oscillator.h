#include <vector>
#include <tuple>

class Oscillator {
private:
  int wave;
  float frequency, sampleRate, bufferSize;

public:
  Oscillator(int wave, float frequency, float sampleRate, float bufferSize);
  void SetFrequency(float frequency);
  void SetSampleRate(float sampleRate);
  void SetBufferSize(float bufferSize);
  std::vector<std::tuple<float, float>> Compute();
};
