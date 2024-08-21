var fs = require("fs");

console.log("Checking GoogleService-Info.plist...");
var plistPath =
  process.env.GOOGLESERVICE_INFO_PLIST || "./GoogleService-Info.plist";
try {
  var plistContents = fs.readFileSync(plistPath, "utf8");
  console.log(plistContents);
} catch (err) {
  console.error(`Failed to read ${plistPath}: ${err.message}`);
}

console.log("Checking google-services.json...");
var jsonPath = process.env.GOOGLE_SERVICES_JSON || "./google-services.json";
try {
  var jsonContents = fs.readFileSync(jsonPath, "utf8");
  console.log(jsonContents);
} catch (err) {
  console.error(`Failed to read ${jsonPath}: ${err.message}`);
}
