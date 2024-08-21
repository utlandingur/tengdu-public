# Tengdu - a social connection app

Public code repository. This is the code for the Tengdu app, a social connection app that allows people to connect with each other and share their experiences.

## Introduction
This app was developed by Sesar Herisson (backend) and Luke Hening (frontend) from January to July 2024. It allows people to connect with each other and share their experiences. The app is written to work on both iOS and Android devices.
It is feature complete and ready for release. The app is written in React Native and Expo with Tamagui. It uses Firebase for the backend. It uses StreamChat for messaging.

## Features
- User authentication
- User profiles
- Group messaging
- Push notifications for both Firebase Cloud Messaging (FCM) & Expo Notifications
- Matching algorithm
- Matching preferences
- Match overview
- Safety features (block and report users)

## Installation
To install the app, follow these steps:
1. Clone the repository
2. Setup Firebase instance and configure the app with your Firebase configuration
3. Setup StreamChat instance and configure the app with your StreamChat configuration
4. Setup Expo instance and configure the app with your Expo configuration. We used EAS build with EAS secrets in the app.config.ts file in tengdu-app
5. Setup Google Maps API and configure the app with your Google Maps API key of tengdu-app
6. Download the Google Services JSON file and place it in the `android/app` folder of tengdu-app
7. Download the Google Services Plist file and place it in the `ios` folder of tengdu-app
4. Follow ReadMe in tengdu-app, tengdu-functions and tengdu-python folders to setup and run the app

## Contributing
We have no plans to continue development on this project due to personal reasons. It is feature complete as regards our initial MVP.

If you want to contribute, feel free to fork the repository and make your changes.

## License
This project is completely open source and free to use. You can use it for personal or commercial use - but please give credit to the original authors and link to this repository.
Please note that we are not responsible for any damages or losses caused by the use of this app.

## Testing
We have comprehensive unit tests for all the features of the app and the backend functions.

## Additional
We have configured the repo so that code will follow a different path depending on if the device is on the web or not, using a custom .web extension. This is to allow for the app to be run on the web as well as on mobile devices.
However, we have not actually created web versions for components that use native code, so the web version will not work currently.

## Contact
If you have any questions, feel free to contact us here on GitHub.
Or you can reach out to me at lukehening@gmail.com.
