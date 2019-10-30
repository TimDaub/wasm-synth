#include <iostream>
#include <emscripten/bind.h>

using namespace emscripten;

std::string hello() {
  return "hello world";
}

EMSCRIPTEN_BINDINGS(my_module) {
  function("hello", &hello);
}
