import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { Motorcycle, MOTORCYCLE_PRESETS } from '../types';

// Utility function to format numbers with thousand separators
const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, '');
    
    // Add thousand separators
    if (numericValue) {
        return parseInt(numericValue).toLocaleString();
    }
    return '';
};

// Utility function to remove formatting and get raw number
const getNumericValue = (formattedValue: string): string => {
    return formattedValue.replace(/,/g, '');
};

interface AddMotorcycleScreenProps {
    navigation: any;
}

const AddMotorcycleScreen: React.FC<AddMotorcycleScreenProps> = ({ navigation }) => {
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [currentMileage, setCurrentMileage] = useState('');
    const [selectedPreset, setSelectedPreset] = useState('scooter');

    // Handle mileage input with formatting
    const handleMileageChange = (text: string) => {
        const formatted = formatNumberWithCommas(text);
        setCurrentMileage(formatted);
    };

    const handleSave = async () => {
        if (!name.trim() || !make.trim() || !model.trim() || !currentMileage.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const mileage = parseFloat(getNumericValue(currentMileage));
        if (isNaN(mileage) || mileage < 0) {
            Alert.alert('Error', 'Please enter a valid mileage');
            return;
        }

        const yearNum = year ? parseInt(year) : undefined;
        if (year && (isNaN(yearNum!) || yearNum! < 1900 || yearNum! > new Date().getFullYear() + 1)) {
            Alert.alert('Error', 'Please enter a valid year');
            return;
        }

        try {
            // Load existing data
            const existingData = await AsyncStorage.getItem('@motorcycles_data');
            const motorcycles = existingData ? JSON.parse(existingData).motorcycles || [] : [];

            // Create new motorcycle
            const newMotorcycle: Motorcycle = {
                id: Date.now().toString(),
                name: name.trim(),
                make: make.trim(),
                model: model.trim(),
                year: yearNum,
                currentMileage: mileage,
                records: [],
                createdAt: new Date().toISOString(),
            };

            // Add to list
            motorcycles.push(newMotorcycle);

            // Save back
            await AsyncStorage.setItem('@motorcycles_data', JSON.stringify({
                motorcycles,
                settings: { isDarkMode: false, defaultUnit: 'km', reminderDistance: 500 }
            }));

            Alert.alert(
                'Success',
                'Motorcycle added successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Error saving motorcycle:', error);
            Alert.alert('Error', 'Failed to save motorcycle');
        }
    };

    const getPresetDescription = (preset: string) => {
        const presetData = MOTORCYCLE_PRESETS[preset as keyof typeof MOTORCYCLE_PRESETS];
        const intervals = Object.entries(presetData.intervals);
        return `Includes ${intervals.length} maintenance items like: ${intervals.slice(0, 3).map(([key]) => key).join(', ')}${intervals.length > 3 ? '...' : ''}`;
    };

    return (        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Add New Motorcycle</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        Set up your motorcycle to start tracking maintenance
                    </Text>
                </View>
            </View>
            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }} // Adjusted for smaller tab bar
            >
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
                    
                    <Text style={[styles.requiredLabel, { color: colors.text }]}>
                        Name <Text style={[styles.required, { color: colors.danger }]}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, { 
                            borderColor: colors.border, 
                            color: colors.text, 
                            backgroundColor: colors.surface 
                        }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., My Honda PCX"
                        placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={[styles.requiredLabel, { color: colors.text }]}>
                        Make <Text style={[styles.required, { color: colors.danger }]}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, { 
                            borderColor: colors.border, 
                            color: colors.text, 
                            backgroundColor: colors.surface 
                        }]}
                        value={make}
                        onChangeText={setMake}
                        placeholder="e.g., Honda"
                        placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={[styles.requiredLabel, { color: colors.text }]}>
                        Model <Text style={[styles.required, { color: colors.danger }]}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, { 
                            borderColor: colors.border, 
                            color: colors.text, 
                            backgroundColor: colors.surface 
                        }]}
                        value={model}
                        onChangeText={setModel}
                        placeholder="e.g., PCX 150"
                        placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Year</Text>
                    <TextInput
                        style={[styles.input, { 
                            borderColor: colors.border, 
                            color: colors.text, 
                            backgroundColor: colors.surface 
                        }]}
                        value={year}
                        onChangeText={setYear}
                        placeholder="e.g., 2020"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                    />

                    <Text style={[styles.requiredLabel, { color: colors.text }]}>
                        Current Mileage (km) <Text style={[styles.required, { color: colors.danger }]}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, { 
                            borderColor: colors.border, 
                            color: colors.text, 
                            backgroundColor: colors.surface 
                        }]}                        value={currentMileage}
                        onChangeText={handleMileageChange}
                        placeholder="e.g., 100,000"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Maintenance Schedule</Text>
                    
                    <Text style={[styles.label, { color: colors.text }]}>Motorcycle Type</Text>
                    <View style={[styles.pickerContainer, { 
                        borderColor: colors.border, 
                        backgroundColor: colors.surface 
                    }]}>
                        <Picker
                            selectedValue={selectedPreset}
                            onValueChange={setSelectedPreset}
                            style={[styles.picker, { color: colors.text }]}
                        >
                            <Picker.Item label="Scooter/Automatic" value="scooter" />
                            <Picker.Item label="Sport Bike" value="sport" />
                            <Picker.Item label="Cruiser" value="cruiser" />
                            <Picker.Item label="Custom" value="custom" />
                        </Picker>
                    </View>

                    <View style={[styles.presetInfo, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.presetTitle, { color: colors.text }]}>
                            {MOTORCYCLE_PRESETS[selectedPreset as keyof typeof MOTORCYCLE_PRESETS].name}
                        </Text>
                        <Text style={[styles.presetDescription, { color: colors.textSecondary }]}>
                            {getPresetDescription(selectedPreset)}
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton, { backgroundColor: colors.secondary }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.buttonText}>Add Motorcycle</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    requiredLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    required: {
        // color will be set inline
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
    },
    picker: {
        height: 50,
    },
    presetInfo: {
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    presetTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    presetDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        paddingBottom: 20,
    },    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
        justifyContent: 'center',
    },
    cancelButton: {
        // backgroundColor will be set inline
    },
    saveButton: {
        // backgroundColor will be set inline
    },    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddMotorcycleScreen;
