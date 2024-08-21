export default {
  expo: {
    scheme: "tengdu",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/Images/splash-screen.png",
      resizeMode: "cover"
    },
    icon: "./assets/Images/Tengdu-app-icon.png",
    name: "Tengdu",
    slug: "Tengdu",
    description:
      "Tengdu is a mobile application that helps adults find people to do stuff with based on interests, location and availability.",
    assetBundlePatterns: ["**/*"],
    web: {
      bundler: "metro"
    },
    privacy: "public",
    platforms: ["ios", "android"],
    orientation: "portrait",
    plugins: [
      ["expo-screen-orientation", { initialOrientation: "PORTRAIT" }],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them with your friends."
        }
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/crashlytics",
      "@react-native-google-signin/google-signin",
      [
        "expo-build-properties",
        { ios: { useFrameworks: "static", deploymentTarget: "13.4" } }
      ],
      ["expo-apple-authentication"],
      ["expo-router"]
    ],
    runtimeVersion: "0.0.1",
    ios: {
      bundleIdentifier: "app.tengdu.tengdu",
      runtimeVersion: {
        policy: "appVersion"
      },
      usesAppleSignIn: true,
      googleServicesFile:
        process.env.GOOGLESERVICE_INFO_PLIST ?? "./GoogleService-Info.plist",
        config: {
          usesNonExemptEncryption: false
        }
    },
    androidStatusBar: {
      barStyle: "dark-content"
    },
    android: {
      permissions: ["android.permission.RECORD_AUDIO"],
      package: "app.tengdu.tengdu",
      runtimeVersion: "0.0.1",
      softwareKeyboardLayoutMode: "pan",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json"
    },
    extra: {
      eas: {
        projectId: "----"
      }
    },
    updates: {
      url: "----",
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0
    },
    owner: "tengdu"
  }
};
