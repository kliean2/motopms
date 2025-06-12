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
            padding: 20,
            paddingTop: 60,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backButton: {
            marginBottom: 15,
        },
        backButtonContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        backButtonText: {
            color: colors.primary,
            fontSize: 16,
            marginLeft: 5,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
        },
        headerSubtitle: {
            fontSize: 16,
            color: colors.textSecondary,
            marginTop: 5,
        },
        settingsButton: {
            position: 'absolute',
            top: 60,
            right: 20,
            padding: 10,
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
                <TouchableOpacity
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <View style={styles.backButtonContent}>
                        <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.settingsButton} 
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Text style={{ fontSize: 16, color: colors.primary, fontWeight: 'bold' }}>SETTINGS</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{motorcycle.name}</Text>
                <Text style={styles.headerSubtitle}>
                    {motorcycle.make} {motorcycle.model}{motorcycle.year ? ` (${motorcycle.year})` : ''}
                </Text>
            </View>
            <ScrollView 
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 100 }} // Adjusted for smaller tab bar
                showsVerticalScrollIndicator={false}
            >
                <CurrentMileage 
                    currentMileage={motorcycle.currentMileage} 
                    onUpdate={updateCurrentMileage} 
                />
                
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
