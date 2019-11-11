#include <math.h>

static const float PI = 3.14159265358979f;

void _SinWave(float *buffer, float frequency, int sampleRate, int time, float gain) {
  // TODO: Readd gain
  float p = frequency * 2 * PI / (float)sampleRate;

	// Math heavily inspired by:
	// https://www.desmos.com/calculator/nduy9l2pez
  float xa = 100.0f;
  float xd = 200.5f;
  float ys = 0.8f;
	float xs = 100.0f;
	float xr = 400.3f;

	float elapsedSustain = 0.0f;
  for(int i = 0; i < time * sampleRate; i++) {
    float x = p * i;
    float attack = pow(x/xa, 1.0/3.0f);

		float dx = ((ys - 1) / xd) * (x - xa) + 1;
		float dl = ys;
		float du = 1.0;
		float gf = pow((dx - dl) / (du - dl), 3);
		float decay = gf * (du - dl) + dl;

		float rx = -1.0f * ys / xr * (x - (xa + xd + xs)) + ys;
		float rl = 0.0f;
		float ru = ys;
		float rf = pow((rx - rl) / (ru - rl), 3);
		float release = rf * (ru - rl) + rl;

    buffer[i] = sin(x);

    if (attack <= 1) {
      buffer[i] *= attack;
    } else if (decay >= ys) {
      buffer[i] *= decay;
    } else if (elapsedSustain < xs) {
			buffer[i] *= ys;
			elapsedSustain += x - (p * (i - 1));
		} else if (release > 0) {
			buffer[i] *= release;
		} else {
			// NOTE: It's important to set the last sample to zero and hence overwrite
			// the sin value. As otherwise we get an ugly click in our sound.
			buffer[i] = 0;
			break;
		}
  }
}


extern "C" {
  void SinWave(float *buffer, float frequency, int sampleRate, int time, float gain) {
    _SinWave(buffer, frequency, sampleRate, time, gain);
  }
}
