#include <vector>
#include <tuple>
#include <AL/al.h>
#include <AL/alc.h>

using namespace std;

// TODO: For this file, do I create it's own namespace?
static void ToBuffer(ALuint *buff, vector<tuple<float, float>> data) {
  for (vector<int>::size_type i = 0; i < data.size(); i++) {
    buffer[i] = get<1>(data[i]);
  }
}
