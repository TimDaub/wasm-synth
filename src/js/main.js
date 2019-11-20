// @format
import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App";

// NOTE: We only initialize the react app once our wasm modules were
// successfully loaded.
ReactDOM.render(<App />, document.getElementById("root"));
