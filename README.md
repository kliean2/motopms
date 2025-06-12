# 🏍️ Motorcycle PMS Tracker

A modern React Native app built with Expo to track motorcycle preventive maintenance schedules (PMS) with dark mode support, multi-motorcycle management, and proper mobile UI handling.

## ✨ Features

- **🏠 Home Screen**: Modern interface with motorcycle overview and dark mode toggle in header
- **🏍️ Multi-Motorcycle Support**: Manage multiple motorcycles in one app
- **📊 Maintenance Tracking**: Keep track of all maintenance activities with due alerts
- **🔔 Due Alerts**: Visual indicators and sorting for overdue maintenance
- **📱 Mobile-First UI**: Responsive design with proper safe area handling for navigation bars
- **🌙 Dark Mode**: Quick toggle in home screen header - no need to go to settings
- **🎨 Vector Icons**: Beautiful Material Design icons throughout the app (no more emojis)
- **💾 Persistent Storage**: Data saved locally using AsyncStorage
- **➕ Easy Adding**: Simple forms to add motorcycles and maintenance records
- **🎨 Themed Components**: Consistent styling across light/dark modes
- **📋 Motorcycle Presets**: Choose from Scooter, Sport Bike, Cruiser templates
- **📱 Safe Area Support**: Properly handles device notches and navigation bars

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or newer)
- npm or yarn
- Expo Go app on your phone (optional)

### Installation

1. **Clone and Install**
   ```bash
   cd c:\Users\kliean\Downloads\Android\MotorcyclePMSTracker
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on Different Platforms**
   - **📱 Phone**: Scan QR code with Expo Go app
   - **🌐 Web**: Press `w` in terminal or visit http://localhost:19006  
   - **📱 Android**: Press `a` (requires Android Studio/emulator)
   - **🍎 iOS**: Press `i` (requires Xcode/macOS)

## 📱 App Structure

### Home Screen
- Clean, modern interface with motorcycle icon in header
- Dark mode toggle conveniently located in header (no need to visit settings)
- Motorcycle cards showing maintenance status with vector icons
- Quick overview of due maintenance with color-coded badges
- Floating action button to add motorcycles
- Proper safe area handling for all device types

### Add Motorcycle
- Name, make, model, year fields
- Current mileage input
- Motorcycle type presets (Scooter, Sport, Cruiser, Custom)
- Automatic maintenance interval setup

### Motorcycle Detail
- Current mileage updater
- Maintenance schedule view
- Add new maintenance records
- Sort by due status (overdue items first)

### Settings
- Dark/Light mode toggle
- Data management (export/clear)
- App information

## 🔧 Maintenance Intervals

### Default Intervals (kilometers)
- **Oil Change**: 1,500 km
- **Gear Oil Change**: 6,000 km  
- **Carbon Cleaning**: 3,000 km
- **Spark Plug**: 12,000 km
- **Air Filter**: 18,000 km
- **Drive Belt**: 24,000 km
- **Wheel Bearing**: 50,000 km
- **Brake Bleeding**: 12,000 km

### Motorcycle Type Presets
- **🛵 Scooter/PCX**: Optimized for automatic scooters
- **🏁 Sport Bike**: Performance bike maintenance
- **🛣️ Cruiser**: Touring/cruiser motorcycle schedules
- **⚙️ Custom**: Define your own intervals

## 🎨 Theming

The app supports both light and dark modes with:
- **Light Theme**: Clean, bright interface
- **Dark Theme**: Easy on the eyes for night use
- **Automatic Persistence**: Your theme choice is saved
- **Consistent Colors**: All components adapt to selected theme

## 💾 Data Management

- **Local Storage**: All data stored on device using AsyncStorage
- **Auto-Save**: Changes saved automatically
- **Export Ready**: Foundation for data export features
- **No Cloud Dependency**: Works completely offline

## 🛠️ Development

### Tech Stack
- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for screen navigation
- **AsyncStorage** for local data persistence
- **React Native Picker** for dropdowns
- **Context API** for theme management

### Project Structure
```
├── App.tsx                 # Main app with navigation
├── contexts/
│   └── ThemeContext.tsx    # Dark mode context
├── screens/
│   ├── HomeScreen.tsx      # Motorcycle list
│   ├── AddMotorcycleScreen.tsx
│   ├── MotorcycleDetailScreen.tsx
│   └── SettingsScreen.tsx
├── components/
│   ├── MaintenanceList.tsx
│   ├── MaintenanceItem.tsx
│   ├── MaintenanceForm.tsx
│   └── CurrentMileage.tsx
└── types/
    └── index.ts            # TypeScript definitions
```

## 🚧 Building for Production

### Create APK (Android)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --local
```

### App Store Build
```bash
# Build for stores
eas build --platform all
```

## 📱 Features in Detail

### Motorcycle Management
- Add unlimited motorcycles
- Each with independent maintenance tracking
- Delete motorcycles with confirmation
- Quick status overview on home screen

### Maintenance Tracking
- Visual status indicators (green/yellow/red)
- Automatic due date calculations
- Overdue alerts with distance calculations
- Part number tracking (e.g., "Koyo - 6201ZZC3")
- Notes field for additional information

### User Experience
- Intuitive navigation with back buttons
- Confirmation dialogs for destructive actions
- Loading states and error handling
- Responsive design for different screen sizes

## 🎯 Perfect For

- **Motorcycle Enthusiasts** who want to track maintenance
- **Fleet Managers** managing multiple bikes
- **Riders** who want to avoid missed services
- **Anyone** wanting a simple, offline maintenance tracker

## 📝 Version

**v1.0.0** - Full-featured motorcycle maintenance tracker

---

**Built with ❤️ for motorcycle enthusiasts**
