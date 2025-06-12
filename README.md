# 🏍️ MotoPMS - Motorcycle Maintenance Tracker

A modern React Native Android app for tracking motorcycle maintenance with TikTok-style navigation, dark mode support, and fuel efficiency calculations.

## 🚀 Features

### 📱 Core Functionality
- **Multi-Motorcycle Management**: Track multiple motorcycles with preset configurations
- **Maintenance Tracking**: Record and monitor maintenance schedules, repairs, and services
- **KMPL Calculator**: Calculate fuel efficiency with detailed analytics
- **Dark Mode Support**: Automatic theme switching with persistent settings
- **Offline Storage**: All data stored locally using AsyncStorage

### 🎨 User Interface
- **TikTok-Style Navigation**: Modern bottom tab navigation with geometric icons
- **Android Safe Area**: Proper handling of Android system navigation bars
- **Professional Design**: Clean, emoji-free interface optimized for Android
- **Responsive Layout**: Optimized for various Android screen sizes

### 🏍️ Motorcycle Presets
- **Scooter**: 125cc, 45 KMPL average
- **Sport**: 600cc, 25 KMPL average  
- **Cruiser**: 1200cc, 20 KMPL average
- **Custom**: User-defined specifications

## 📸 Screenshots

*Coming soon - screenshots will be added after APK testing*

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **Storage**: AsyncStorage
- **Build**: EAS Build
- **Platform**: Android (Primary)

## 📦 Installation

### Prerequisites
- Node.js (14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for emulator) or Android device

### Setup
```bash
# Clone the repository
git clone https://github.com/kliean2/motopms.git
cd motopms

# Install dependencies
npm install

# Start the development server
npx expo start

# Run on Android
npx expo run:android
```

### Building APK
```bash
# Build production APK
eas build --platform android --profile preview

# Build for Google Play Store
eas build --platform android --profile production
```

## 📱 App Structure

```
MotorcyclePMSTracker/
├── App.tsx                    # Main app with navigation
├── screens/
│   ├── HomeScreen.tsx         # Motorcycle list and overview
│   ├── AddMotorcycleScreen.tsx # Add new motorcycle
│   ├── MotorcycleDetailScreen.tsx # Maintenance tracking
│   ├── KMPLCalculatorScreen.tsx # Fuel efficiency calculator
│   └── SettingsScreen.tsx     # App settings and theme
├── components/
│   ├── KMPLCalculator.tsx     # Fuel calculation component
│   ├── MaintenanceList.tsx    # Maintenance records display
│   ├── MaintenanceForm.tsx    # Add maintenance form
│   ├── MaintenanceItem.tsx    # Individual maintenance record
│   ├── CurrentMileage.tsx     # Mileage input modal
│   └── CustomBottomNav.tsx    # Bottom navigation
├── contexts/
│   └── ThemeContext.tsx       # Dark mode context
├── types/
│   └── index.ts              # TypeScript definitions
└── README.md
```

## 🎯 Key Features Explained

### Maintenance Tracking
- **Service Records**: Oil changes, tire replacements, brake services
- **Mileage Tracking**: Current odometer readings and service intervals
- **Cost Management**: Track maintenance expenses
- **Due Date Alerts**: Visual indicators for upcoming maintenance

### KMPL Calculator
- **Trip Calculation**: Distance-based fuel efficiency
- **Fill-up Tracking**: Tank-to-tank calculations
- **Historical Data**: Track fuel efficiency over time
### Data Persistence
- **Local Storage**: All data stored on device using AsyncStorage
- **Data Export**: Future feature for backup and transfer
- **Offline First**: Works completely offline

## 🔧 Development

### Running the App
```bash
# Start Expo development server
npx expo start

# Run on Android emulator
npx expo run:android

# Clear cache if needed
npx expo start --clear
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Component Architecture**: Modular, reusable components
- **Context Management**: Centralized state management

## 📋 Known Issues & Solutions

### Fixed Issues ✅
- **Text Rendering**: Fixed "Text strings must be rendered within a <Text> component" errors
- **Icon System**: Replaced MaterialIcons with geometric shapes to prevent crashes
- **Navigation Overlap**: Proper Android safe area handling implemented
- **Bundle Errors**: All compilation errors resolved (937 modules bundled successfully)

### Current Status
- ✅ Development complete
- ✅ Local testing successful
- 🔄 APK testing in progress
- 🔄 Play Store preparation

## 📈 Future Enhancements

- [ ] iOS support
- [ ] Cloud synchronization
- [ ] Data export/import
- [ ] Maintenance reminders/notifications
- [ ] Service history analytics
- [ ] Integration with motorcycle APIs
- [ ] Photo attachments for maintenance records
- [ ] QR code scanning for parts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**kliean2**
- GitHub: [@kliean2](https://github.com/kliean2)
- Project: [MotoPMS](https://github.com/kliean2/motopms)

## 🙏 Acknowledgments

- React Native community for excellent documentation
- Expo team for simplified development workflow
- Open source contributors for navigation and UI libraries

---

**Built with ❤️ for motorcycle enthusiasts**

*Keep your ride in perfect condition with MotoPMS!*

