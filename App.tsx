import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Screens
import HomeScreen from './screens/HomeScreen';
import AddMotorcycleScreen from './screens/AddMotorcycleScreen';
import MotorcycleDetailScreen from './screens/MotorcycleDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import KMPLCalculatorScreen from './screens/KMPLCalculatorScreen';
import ServiceLogScreen from './screens/ServiceLogScreen'; // Add this import

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack navigator for detailed screens
const HomeStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AddMotorcycle" component={AddMotorcycleScreen} />
      <Stack.Screen name="MotorcycleDetail" component={MotorcycleDetailScreen} />
      <Stack.Screen name="ServiceLog" component={ServiceLogScreen} />
    </Stack.Navigator>
  );
};

// Simple geometric icons to avoid text rendering issues
const TabIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => {
  const getIconContent = () => {
    switch (name) {
      case 'HOME':
        return (
          <View style={{
            width: focused ? 10 : 6,
            height: focused ? 10 : 6,
            backgroundColor: color,
            borderRadius: focused ? 5 : 3,
          }} />
        );
      case 'FUEL':
        return (
          <View style={{
            width: focused ? 10 : 6,
            height: focused ? 10 : 6,
            backgroundColor: color,
            transform: [{ rotate: '45deg' }],
          }} />
        );
      case 'GEAR':
        return (
          <View style={{
            width: focused ? 10 : 6,
            height: focused ? 10 : 6,
            backgroundColor: color,
            borderRadius: 1,
          }} />
        );
      default:
        return (
          <View style={{
            width: 6,
            height: 6,
            backgroundColor: color,
            borderRadius: 3,
          }} />
        );
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
      {getIconContent()}
    </View>
  );
};
// Bottom tab navigator
const BottomTabNavigator = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 5,
          paddingTop: 5,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="HOME" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Calculator" 
        component={KMPLCalculatorScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="FUEL" focused={focused} color={color} />
          ),
          tabBarLabel: 'Fuel',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="GEAR" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isDarkMode } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <BottomTabNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
