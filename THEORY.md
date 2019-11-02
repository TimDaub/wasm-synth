# Theory

This documents all the theory that went into creating the project.

## Math

### Sinus

#### Vertical Stretching

- [Good
  resource](https://www.sparknotes.com/math/trigonometry/graphs/section4/)
- To stretch a sinus function vertically, multiply input times a value e.g.
  `sin(2x)`
- This increases the amplitude of the sinus, making the output sound louder and
  "more or less jarring"
- [Interactive example](https://jsbin.com/likituxuji/edit?js,output)

#### Horizontal Stretching

- [Good
  resource](https://www.sparknotes.com/math/trigonometry/graphs/section4/) - To
  stretch a sinus horizontally, divide input by value e.g. sin(x/2) (doubling
  the size of a period)
- This increases the size of a period and hence the frequency. For the human
  ear, this results in hearing "high" or "low" tones
- [Interactive example](https://jsbin.com/likituxuji/edit?js,output)

#### Fun with Lasers

- By accident, I divided some constant by the input e.g. sin(2/x) - This
  results in  a laser-like sound as the function is compressed heavily
  initially
- [Interactive example](https://jsbin.com/likituxuji/edit?js,output)

#### Generating Frequencies

- [One sin period is `2*Pi`
  long](https://www.wolframalpha.com/input/?i=plot+sin%28x%29+x+between+0+and+2*pi)
- When generating a tone, we need to pass a buffer object to JavaScript's
  AudioContext. Additionally, we need to specify the AudioContext's sampling
  rate.
- Simply put, the [sampling
  rate](https://en.wikipedia.org/wiki/Sampling_(signal_processing)#Sampling_rate)
  is the amount of discrete data points we give to an output device over time
  (e.g. per seconds)
- In our interactive example, the sampling rate is `96000`
- This means, to e.g. generate the A note below middle C according to [concert
  pitch](https://en.wikipedia.org/wiki/Concert_pitch) for 1 second, we'll have
  to generate 96000 data samples from the sinus function at 440 Hertz
- To simplify our problem, let's try to generate a 1 Hertz frequency with 96000
  data points
- We already know that `sin(2*Pi*t)` where t = 1s. But since, we need to have
  96000 data points, we'll have to cut t into 96000 pieces and compute them
  individually: `sin(2*Pi*i*t/frameCount)`
  - We do this by splitting t into 96000 pieces (`i*t/frameCount`), and by
    inputting them into our wave function.
- [Interactive example](https://jsbin.com/zasunokodi/edit?html,js,output)
