import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

interface CustomBottomNavProps {
  activeTab: 'Home' | 'Calculator' | 'Settings';
  onTabPress: (tab: 'Home' | 'Calculator' | 'Settings') => void;
}

const CustomBottomNav: React.FC<CustomBottomNavProps> = ({ activeTab, onTabPress }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const TabIcon: React.FC<{ name: string; active: boolean }> = ({ name, active }) => {
    const getIconContent = () => {
      switch (name) {
        case 'HOME':
          return (
            <View style={{
              width: active ? 12 : 8,
              height: active ? 12 : 8,
              backgroundColor: active ? colors.primary : colors.textSecondary,
              borderRadius: active ? 6 : 4,
            }} />
          );
        case 'FUEL':
          return (
            <View style={{
              width: active ? 12 : 8,
              height: active ? 12 : 8,
              backgroundColor: active ? colors.primary : colors.textSecondary,
              transform: [{ rotate: '45deg' }],
            }} />
          );
        case 'GEAR':
          return (
            <View style={{
              width: active ? 12 : 8,
              height: active ? 12 : 8,
              backgroundColor: active ? colors.primary : colors.textSecondary,
              borderRadius: 2,
            }} />
          );
        default:
          return (
            <View style={{
              width: 8,
              height: 8,
              backgroundColor: colors.textSecondary,
              borderRadius: 4,
            }} />
          );
      }
    };

    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
        {getIconContent()}
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        height: 60 + insets.bottom,
        paddingBottom: insets.bottom + 8,
      }
    ]}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('Home')}
      >
        <TabIcon name="HOME" active={activeTab === 'Home'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('Calculator')}
      >
        <TabIcon name="FUEL" active={activeTab === 'Calculator'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('Settings')}
      >
        <TabIcon name="GEAR" active={activeTab === 'Settings'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});

export default CustomBottomNav;
