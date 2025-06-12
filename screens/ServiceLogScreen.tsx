import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { Motorcycle, ServiceLogEntry } from '../types';
import ServiceLogTable from '../components/ServiceLogTable';

// Define the structure for the data in AsyncStorage
interface AppData {
  motorcycles: Motorcycle[];
  settings: Record<string, any>;
}

type ServiceLogScreenRouteProp = RouteProp<{ params: { motorcycleId: string } }, 'params'>;

const ServiceLogScreen: React.FC = () => {
    const { colors } = useTheme();
    const route = useRoute<ServiceLogScreenRouteProp>();
    const { motorcycleId } = route.params;

    const [motorcycle, setMotorcycle] = useState<Motorcycle | null>(null);
    const [serviceLog, setServiceLog] = useState<ServiceLogEntry[]>([]);    const loadMotorcycleData = useCallback(async () => {
        try {
            const data = await AsyncStorage.getItem('@motorcycles_data');
            if (data) {
                const parsedData = JSON.parse(data);
                const foundMotorcycle = parsedData.motorcycles.find((m: Motorcycle) => m.id === motorcycleId);
                if (foundMotorcycle) {
                    setMotorcycle(foundMotorcycle);
                    setServiceLog(foundMotorcycle.serviceLog || []);
                } else {
                    Alert.alert('Error', 'Motorcycle not found.');
                }
            }
        } catch (error) {
            console.error('Error loading motorcycle data:', error);
            Alert.alert('Error', 'Could not load motorcycle data.');
        }
    }, [motorcycleId]);

    useFocusEffect(
      useCallback(() => {
        loadMotorcycleData();
      }, [loadMotorcycleData])
    );

    const saveServiceLogEntry = async (newLogEntry: ServiceLogEntry) => {
        if (!motorcycle) return;

        const updatedLogs = [...serviceLog, newLogEntry];
        const updatedMotorcycle = { ...motorcycle, serviceLog: updatedLogs };

        try {
            const storedDataString = await AsyncStorage.getItem('@motorcycles_data');
            let appData: AppData = { motorcycles: [], settings: {} };

            if (storedDataString) {
                const parsed = JSON.parse(storedDataString);
                appData = {
                    motorcycles: parsed.motorcycles || [],
                    settings: parsed.settings || {}
                };
            }
            
            const motorcycleIndex = appData.motorcycles.findIndex((m: Motorcycle) => m.id === motorcycleId);
            if (motorcycleIndex > -1) {
                appData.motorcycles[motorcycleIndex] = updatedMotorcycle;
            } else {
                appData.motorcycles.push(updatedMotorcycle);
            }
            
            await AsyncStorage.setItem('@motorcycles_data', JSON.stringify(appData));
            setServiceLog(updatedLogs);
            setMotorcycle(updatedMotorcycle);
            Alert.alert('Success', 'Service log entry added.');
        } catch (error) {
            console.error('Error saving service log:', error);
            Alert.alert('Error', 'Could not save service log entry.');
        }
    };

    const updateServiceLogEntry = async (id: string, updates: Partial<ServiceLogEntry>) => {
        if (!motorcycle) return;

        const updatedLogs = serviceLog.map(log => 
            log.id === id ? { ...log, ...updates } : log
        );
        const updatedMotorcycle = { ...motorcycle, serviceLog: updatedLogs };

        try {
            const storedDataString = await AsyncStorage.getItem('@motorcycles_data');
            let appData: AppData = { motorcycles: [], settings: {} };

            if (storedDataString) {
                const parsed = JSON.parse(storedDataString);
                appData = {
                    motorcycles: parsed.motorcycles || [],
                    settings: parsed.settings || {}
                };
            }

            const motorcycleIndex = appData.motorcycles.findIndex((m: Motorcycle) => m.id === motorcycleId);
            if (motorcycleIndex > -1) {
                appData.motorcycles[motorcycleIndex] = updatedMotorcycle;
            }
            
            await AsyncStorage.setItem('@motorcycles_data', JSON.stringify(appData));
            setServiceLog(updatedLogs);
            setMotorcycle(updatedMotorcycle);        } catch (error) {
            console.error('Error updating service log:', error);
            Alert.alert('Error', 'Could not update service log entry.');
        }
    };

    const handleAddEntry = (entry: Omit<ServiceLogEntry, 'id'>) => {
        const newLogEntry: ServiceLogEntry = {
            id: Date.now().toString(),
            ...entry,
        };
        saveServiceLogEntry(newLogEntry);
    };

    const styles = StyleSheet.create({
        container: { 
            flex: 1, 
            backgroundColor: colors.background 
        },
        header: {
            padding: 20,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: { 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: colors.text,
            textAlign: 'center',
        },
        content: { 
            flex: 1, 
            padding: 20 
        },
    });

    if (!motorcycle) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text }}>Loading motorcycle details...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{motorcycle.name} - Service Log</Text>
            </View>
              <View style={styles.content}>
                <ServiceLogTable
                    serviceLog={serviceLog}
                    onAddEntry={handleAddEntry}
                    onUpdateEntry={updateServiceLogEntry}
                />
            </View>
        </SafeAreaView>
    );
};

export default ServiceLogScreen;
