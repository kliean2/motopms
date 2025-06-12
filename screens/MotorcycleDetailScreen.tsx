import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { Motorcycle, MaintenanceRecord } from '../types';
import MaintenanceList from '../components/MaintenanceList';
import MaintenanceForm from '../components/MaintenanceForm';
import CurrentMileage from '../components/CurrentMileage';

interface MotorcycleDetailScreenProps {
    navigation: any;
    route: any;
}

const MotorcycleDetailScreen: React.FC<MotorcycleDetailScreenProps> = ({ navigation, route }) => {
    const { colors } = useTheme();
    const { motorcycleId } = route.params;
    const [motorcycle, setMotorcycle] = useState<Motorcycle | null>(null);
    const [loading, setLoading] = useState(true);

    // Function to navigate to ServiceLogScreen
    const navigateToServiceLog = () => {
        navigation.navigate('ServiceLog', { motorcycleId });
    };

    useEffect(() => {
        loadMotorcycle();
    }, []);

    const loadMotorcycle = async () => {
        try {
            const data = await AsyncStorage.getItem('@motorcycles_data');
            if (data) {
                const parsedData = JSON.parse(data);
                const motorcycles = parsedData.motorcycles || [];
                const foundMotorcycle = motorcycles.find((m: Motorcycle) => m.id === motorcycleId);
                if (foundMotorcycle) {
                    setMotorcycle(foundMotorcycle);
                } else {
                    Alert.alert('Error', 'Motorcycle not found');
                    navigation.goBack();
                }
            }
        } catch (error) {
            console.error('Error loading motorcycle:', error);
            Alert.alert('Error', 'Failed to load motorcycle data');
        } finally {
            setLoading(false);
        }
    };

    const saveMotorcycle = async (updatedMotorcycle: Motorcycle) => {
        try {
            const data = await AsyncStorage.getItem('@motorcycles_data');
            if (data) {
                const parsedData = JSON.parse(data);
                const motorcycles = parsedData.motorcycles || [];
                const updatedMotorcycles = motorcycles.map((m: Motorcycle) =>
                    m.id === motorcycleId ? updatedMotorcycle : m
                );
                
                await AsyncStorage.setItem('@motorcycles_data', JSON.stringify({
                    ...parsedData,
                    motorcycles: updatedMotorcycles
                }));
                
                setMotorcycle(updatedMotorcycle);
            }
        } catch (error) {
            console.error('Error saving motorcycle:', error);
            Alert.alert('Error', 'Failed to save changes');
        }
    };

    const addRecord = (newRecord: Omit<MaintenanceRecord, 'id'>) => {
        if (!motorcycle) return;

        const record: MaintenanceRecord = {
            ...newRecord,
            id: Date.now().toString(),
        };

        const updatedMotorcycle = {
            ...motorcycle,
            records: [...motorcycle.records, record],
        };

        saveMotorcycle(updatedMotorcycle);
    };

    const updateCurrentMileage = (newMileage: number) => {
        if (!motorcycle) return;

        // Update next due status for all records
        const updatedRecords = motorcycle.records.map(record => ({
            ...record,
            nextDue: newMileage >= record.nextMileage,
        }));

        const updatedMotorcycle = {
            ...motorcycle,
            currentMileage: newMileage,
            records: updatedRecords,
        };

        saveMotorcycle(updatedMotorcycle);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: 20,
            paddingBottom: 15,
            paddingTop: 20, 
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
        },
        headerSubtitle: {
            fontSize: 16,
            color: colors.textSecondary,
            marginTop: 4,
        },
        actionsRow: { // New style for the row
            flexDirection: 'row',
            alignItems: 'center', // Vertically center items in the row
            marginHorizontal: 20, // Keep overall side padding
            marginBottom: 15,     // Space before MaintenanceForm
            marginTop: 15,      // Add some margin at the top of the actions section
        },
        mileageOuterContainer: { // New style for CurrentMileage wrapper
            flex: 1,              // Allow CurrentMileage to take up remaining space
            marginRight: 10,      // Space between CurrentMileage and the Service Log button
        },
        serviceLogButton: { 
            backgroundColor: colors.primary,
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 6,
            alignItems: 'center',
        },
        serviceLogButtonText: {
            color: colors.background,
            fontSize: 14, // Reduced fontSize
            fontWeight: '600', // Adjusted fontWeight
        },
        content: {
            flex: 1,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            color: colors.text,
            fontSize: 16,
        },
    });

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    if (!motorcycle) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.loadingText}>Motorcycle not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{motorcycle.name}</Text>
                <Text style={styles.headerSubtitle}>
                    {motorcycle.make} {motorcycle.model}{motorcycle.year ? ` (${motorcycle.year})` : ''}
                </Text>
            </View>
            <ScrollView 
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.actionsRow}>
                    <View style={styles.mileageOuterContainer}>
                        <CurrentMileage 
                            currentMileage={motorcycle.currentMileage} 
                            onUpdate={updateCurrentMileage} 
                        />
                    </View>
                    <TouchableOpacity 
                        style={styles.serviceLogButton} // Uses the modified style
                        onPress={navigateToServiceLog}
                    >
                        <Text style={styles.serviceLogButtonText}>View Service Log</Text>
                    </TouchableOpacity>
                </View>
                
                <MaintenanceForm 
                    onAdd={addRecord} 
                    currentMileage={motorcycle.currentMileage} 
                />

                <MaintenanceList 
                    records={motorcycle.records} 
                    currentMileage={motorcycle.currentMileage}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default MotorcycleDetailScreen;
