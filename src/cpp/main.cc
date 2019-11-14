#include <math.h>
#include <new>
#include <tuple>
#include <vector>
#include <AL/al.h>
#include <AL/alc.h>

#include "oscillator.h"
#include "adsr_modulator.h"
#include "utils.h"

using namespace std;

void _SinWave(float *buffer) {
  int buf_size = 512;
  int sample_rate = 44100;

  Oscillator* o = new Oscillator(Wave::SIN, 123.0, sample_rate, buf_size);
  vector<tuple<float, float>> wave = o->Compute();
  ADSRModulator* m = new ADSRModulator(1000.0f, 1.0f, 200.0f, 0.1f, 100.0f,
                                       400.0f);
  wave = m->ModulateAmp(wave);

  short *samples;
  samples = new short[buf_size];
  for (vector<int>::size_type i = 0; i < wave.size(); i++) {
    samples[i] = static_cast<short>(get<1>(wave[i]));
  }

  ALCdevice *dev = NULL;
  ALCcontext *ctx = NULL;
  const char *defname = alcGetString(NULL, ALC_DEFAULT_DEVICE_SPECIFIER);
  dev = alcOpenDevice(defname);
  ctx = alcCreateContext(dev, NULL);
  alcMakeContextCurrent(ctx);
  ALuint buf;
  alGenBuffers(1, &buf);

  alBufferData(buf, AL_FORMAT_MONO16, samples, buf_size, sample_rate);
  ALuint src = 0;
  alGenSources(1, &src);
  alSourcei(src, AL_BUFFER, buf);
  alSourcePlay(src);

}

void _SinWaveOld(float *buffer, float frequency, int sampleRate, int time, float gain) {
  float PI = 3.41f;
  // TODO: Readd gain
  float p = frequency * 2 * PI / (float)sampleRate;

	// Math heavily inspired by:
	// https://www.desmos.com/calculator/nduy9l2pez
  float xa = 1000.0f;
  float xd = 200.5f;
  float ys = 0.1f;
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
  void SinWave(float *buffer) {
    _SinWave(buffer);
  }
}
