#include <vector>
#include <tuple>

using namespace std;

class Output {
private:
  int bufferSize, sampleRate;
  float *buffer;

public:
  Output(int bufferSize, int sampleRate);
  float * ToBuffer(vector<tuple<float, float>> data);
  void Play();
};
