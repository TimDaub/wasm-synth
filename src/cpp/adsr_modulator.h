#include <vector>
#include <tuple>

using namespace std;

class ADSRModulator {
private:
  float elapsedSustain, xa, ya, xd, xs, ys, xr;
  float Modulate(float x);
  static const float DECAY_UPPER_LIMIT, RELEASE_LOWER_LIMIT;
public:
  ADSRModulator(float xa, float ya, float xd, float xs, float ys, float xr);
  // NOTE: We want to implement a `modulatePitch` function here too, but to do
  // that we most likely need to manipulate the x value before calculating y...
  // So not sure if a chain like Oscillator <=> Modulator makes sense...
  vector<tuple<float, float>> ModulateAmp(vector<tuple<float, float>>);
  // TODO: Implement setter methods
};
