// Setting up firebase now so doesn't need to be done in another test
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fTest = require("firebase-functions-test")(
  {
    apiKey: "----",
    authDomain: "----",
    projectId: "----",
    storageBucket: "----",
    messagingSenderId: "----",
    appId: "----",
    measurementId: "----",
  },
  "./tengdu-testing.json",
);

import * as myFunctions from "./src/index";

// These are functions that we want to re-use in multiple tests
// just call global.myFunctionName = myFunctionName
global.fTest = fTest;
global.myFunctions = myFunctions;
