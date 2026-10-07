# My Pets Diary

<div align="center">
  <img src="assets/icon.png" alt="My Pets Diary" width="120" height="120" />
</div>

A mobile application to track, document, and manage your beloved pets' appointments and vaccinations.

## About

My Pets Diary is a React Native mobile app that allows you to:
- Record and organize your pets' information and photos
- Create diary entries with dates and timestamps
- Store memories using the device's camera or photo library
- View your pet's timeline with calendar support

## Technology

This project is built using **Expo**, a framework that streamlines React Native development by providing pre-configured native modules and simplified deployment across iOS, Android, and web platforms.

## Getting Started

### Prerequisites
- Node.js and npm installed
- Expo CLI: `npm install -g expo-cli`

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

- **Start development server**: `npm start`
- **Run on Android**: `npm run android`
- **Run on iOS**: `npm run ios`
- **Run on web**: `npm run web`

After running `npm start`, scan the QR code with the Expo Go app on your mobile device, or select an emulator to launch the app.

## License

Private
# My Pets Diary

A mobile pet-care diary built with Expo and React Native. Keep pet profiles, photos, vaccinations, appointments, and health records together in one place.

## Features

- Create, edit, and delete pet profiles.
- Add, replace, or remove pet photos.
- Record vaccinations and schedule appointments.
- View appointments in a calendar and review each pet's health history.
- Browse vaccination records across every pet.
- Save data locally on the device with AsyncStorage.

## Tech stack

- Expo and React Native
- AsyncStorage
- Expo Image Picker, File System, and Image Manipulator
- `react-native-calendars` and `@react-native-community/datetimepicker`
- Expo Google Fonts (Inter) and `react-native-svg`

## Expo connection troubleshooting

If a device cannot connect to Expo CLI, restart Metro and clear its cache:

```bash
npx expo start --clear
```

The device and computer must use the same Wi-Fi network. If the local network blocks the connection, use a tunnel:

```bash
npx expo start --tunnel
```

For a USB-connected Android device, enable USB debugging and run:

```bash
adb devices
adb reverse tcp:8081 tcp:8081
```

## Local data

Pet profiles and health records are stored on the device under the AsyncStorage key `@pet_diary_data`. Clearing app storage or uninstalling the app removes this local data.
