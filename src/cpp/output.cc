#include <AL/al.h>
#include <AL/alc.h>

#include "output.h"

// NOTE: emscripten's openAL implementation currently doesn't define
// `AL_FORMAT_STEREO_FLOAT32`
// (https://github.com/emscripten-core/emscripten/issues/9851), hence we
// define it ourselves.
#define AL_FORMAT_STEREO_FLOAT32 0x10011

Output::Output(int bufferSize, int sampleRate) {
  this->bufferSize = bufferSize;
  this->sampleRate = sampleRate;
  this->buffer = new float[bufferSize];
}

float * Output::ToBuffer(vector<tuple<float, float>> data) {
  for (vector<int>::size_type i = 0; i < data.size(); i++) {
    this->buffer[i] = get<1>(data[i]);
  }

  return this->buffer;
}

void Output::Play() {
  ALCdevice *dev = NULL;
  ALCcontext *ctx = NULL;
  const char *defname = alcGetString(NULL, ALC_DEFAULT_DEVICE_SPECIFIER);
  dev = alcOpenDevice(defname);
  ctx = alcCreateContext(dev, NULL);
  alcMakeContextCurrent(ctx);
  ALuint buf;
  alGenBuffers(1, &buf);

  alBufferData(buf, AL_FORMAT_STEREO_FLOAT32, this->buffer, this->bufferSize, this->sampleRate);
  ALuint src = 0;
  alGenSources(1, &src);
  alSourcei(src, AL_BUFFER, buf);
  alSourcePlay(src);
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(Output) {
  emscripten::class_<Output>("Output")
    .constructor<int, int>()
    .function("ToBuffer", &Output::ToBuffer, emscripten::allow_raw_pointers())
    .function("Play", &Output::Play);
}
