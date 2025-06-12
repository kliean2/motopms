import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Switch,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsScreenProps {
    navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
    const { colors } = useTheme();

    const clearAllData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete all motorcycles and maintenance records. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('@motorcycles_data');
                            Alert.alert('Success', 'All data has been cleared');
                            navigation.navigate('Home');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear data');
                        }
                    }
                }
            ]
        );
    };

    const exportData = async () => {
        try {
            const data = await AsyncStorage.getItem('@motorcycles_data');
            if (data) {
                Alert.alert(
                    'Export Data',
                    'Data export functionality would be implemented here. For now, your data is safely stored on your device.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('No Data', 'No data to export');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to export data');
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            padding: 20,
            paddingTop: 60,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        section: {
            marginBottom: 30,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 15,
        },
        settingItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 15,
            backgroundColor: colors.surface,
            borderRadius: 8,
            marginBottom: 10,
        },
        settingLabel: {
            fontSize: 16,
            color: colors.text,
            flex: 1,
        },        settingDescription: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 4,
        },        actionButton: {
            padding: 15,
            backgroundColor: colors.primary,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 10,
            justifyContent: 'center',
        },
        dangerButton: {
            backgroundColor: colors.danger,
        },        actionButtonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        aboutText: {
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
            textAlign: 'center',
        },
        version: {
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 10,
        },    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>
              <ScrollView
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }} // Adjusted for smaller tab bar
            >
            <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Management</Text>
                    
                    <TouchableOpacity style={styles.actionButton} onPress={exportData}>
                        <Text style={styles.actionButtonText}>Export Data</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, styles.dangerButton]} 
                        onPress={clearAllData}
                    >
                        <Text style={styles.actionButtonText}>Clear All Data</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    
                    <View style={styles.settingItem}>
                        <Text style={styles.aboutText}>
                            Motorcycle PMS Tracker helps you keep track of your motorcycle maintenance schedule. 
                            Never miss an important service again with automatic due date calculations and visual alerts.
                            {'\n\n'}
                            Built with React Native and Expo for a smooth, native experience.                        </Text>
                    </View>
                    
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;
