#include <vector>
#include <tuple>
#include <AL/al.h>
#include <AL/alc.h>

using namespace std;

static void ToBuffer(ALuint *buff, vector<tuple<float, float>> data);
