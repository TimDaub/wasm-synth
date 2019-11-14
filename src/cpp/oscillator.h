#include <vector>
#include <tuple>

enum class Wave { SIN };

class Oscillator {
private:
  Wave wave;
  float frequency, sampleRate, bufferSize;

public:
  Oscillator(Wave wave, float frequency, float sampleRate, float bufferSize);
  void SetWave(Wave wave);
  void SetFrequency(float frequency);
  void SetSampleRate(float sampleRate);
  void SetBufferSize(float bufferSize);
  std::vector<std::tuple<float, float>> Compute();
};
