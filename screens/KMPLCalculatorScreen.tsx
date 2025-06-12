import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

interface KMPLCalculatorScreenProps {
    navigation: any;
}

const KMPLCalculatorScreen: React.FC<KMPLCalculatorScreenProps> = ({ navigation }) => {
    const { colors } = useTheme();
    const [firstOdometer, setFirstOdometer] = useState('');
    const [secondOdometer, setSecondOdometer] = useState('');
    const [fuelFilled, setFuelFilled] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const resetForm = () => {
        setFirstOdometer('');
        setSecondOdometer('');
        setFuelFilled('');
        setResult(null);
    };

    const validateInputs = () => {
        // Check if all fields are filled
        if (!firstOdometer.trim() || !secondOdometer.trim() || !fuelFilled.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return false;
        }

        // Convert to numbers
        const first = parseFloat(firstOdometer);
        const second = parseFloat(secondOdometer);
        const fuel = parseFloat(fuelFilled);

        // Check if all inputs are valid numbers
        if (isNaN(first) || isNaN(second) || isNaN(fuel)) {
            Alert.alert('Error', 'All inputs must be valid numbers');
            return false;
        }

        // Check if fuel is positive
        if (fuel <= 0) {
            Alert.alert('Error', 'Fuel filled must be greater than 0 liters');
            return false;
        }

        // Check if second odometer is greater than first
        if (second <= first) {
            Alert.alert('Error', 'Second odometer reading must be greater than first reading');
            return false;
        }

        // Check realistic ranges
        if (fuel > 150) {
            Alert.alert('Warning', 'Fuel amount seems unusually high (>150L). Please verify.');
            return false;
        }

        const distance = second - first;
        if (distance > 2000) {
            Alert.alert('Warning', 'Distance seems unusually high (>2000km). Please verify.');
            return false;
        }

        if (distance < 10) {
            Alert.alert('Warning', 'Distance seems too short (<10km) for accurate calculation.');
            return false;
        }

        return true;
    };

    const calculateKMPL = () => {
        if (!validateInputs()) return;

        const first = parseFloat(firstOdometer);
        const second = parseFloat(secondOdometer);
        const fuel = parseFloat(fuelFilled);

        const distance = second - first;
        const kmpl = distance / fuel;

        setResult(kmpl);
    };

    const getKMPLRating = (kmpl: number) => {
        if (kmpl >= 40) return { rating: 'Excellent', color: colors.success };
        if (kmpl >= 30) return { rating: 'Very Good', color: colors.info };
        if (kmpl >= 20) return { rating: 'Good', color: colors.primary };
        if (kmpl >= 15) return { rating: 'Average', color: '#FFA500' };
        return { rating: 'Poor', color: colors.danger };
    };

    return (        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>KMPL Calculator</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    Calculate your motorcycle's fuel efficiency
                </Text>
            </View>
            <ScrollView
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }} // Adjusted for smaller tab bar
            >
                <View style={[styles.tutorialContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.tutorialTitle, { color: colors.text }]}>
                        How to Use:
                    </Text>
                    <Text style={[styles.tutorialText, { color: colors.textSecondary }]}>
                        1. First Odometer Reading: Enter the odometer reading after your last full tank
                    </Text>
                    <Text style={[styles.tutorialText, { color: colors.textSecondary }]}>
                        2. Second Odometer Reading: Enter current odometer reading before refueling
                    </Text>
                    <Text style={[styles.tutorialText, { color: colors.textSecondary }]}>
                        3. Fuel Filled: Enter amount of fuel you're filling now (in liters)
                    </Text>
                    <Text style={[styles.tutorialNote, { color: colors.info }]}>
                        Note: For accurate results, always fill tank completely both times!
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        First Odometer Reading (km) <Text style={{ color: colors.danger }}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, { 
                            borderColor: colors.border, 
                            color: colors.text, 
                            backgroundColor: colors.surface 
                        }]}
                        value={firstOdometer}
                        onChangeText={setFirstOdometer}
                        placeholder="e.g., 15000"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                    />

                    <Text style={[styles.label, { color: colors.text }]}>
                        Second Odometer Reading (km) <Text style={{ color: colors.danger }}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, { 
                            borderColor: colors.border, 
                            color: colors.text, 
                            backgroundColor: colors.surface 
                        }]}
                        value={secondOdometer}
                        onChangeText={setSecondOdometer}
                        placeholder="e.g., 15300"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                    />

                    <Text style={[styles.label, { color: colors.text }]}>
                        Fuel Filled (liters) <Text style={{ color: colors.danger }}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, { 
                            borderColor: colors.border, 
                            color: colors.text, 
                            backgroundColor: colors.surface 
                        }]}
                        value={fuelFilled}
                        onChangeText={setFuelFilled}
                        placeholder="e.g., 10.5"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                    />
                </View>

                {result && (
                    <View style={[styles.resultContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.resultTitle, { color: colors.text }]}>
                            Fuel Efficiency Result:
                        </Text>
                        <Text style={[styles.resultValue, { color: colors.primary }]}>
                            {result.toFixed(2)} km/L
                        </Text>
                        <View style={[styles.ratingContainer, { backgroundColor: getKMPLRating(result).color }]}>
                            <Text style={styles.ratingText}>
                                {getKMPLRating(result).rating}
                            </Text>
                        </View>
                        <Text style={[styles.resultDetails, { color: colors.textSecondary }]}>
                            Distance: {(parseFloat(secondOdometer) - parseFloat(firstOdometer)).toFixed(0)} km
                        </Text>
                        <Text style={[styles.resultDetails, { color: colors.textSecondary }]}>
                            Fuel Used: {fuelFilled} L
                        </Text>
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={calculateKMPL}
                    >
                        <Text style={styles.buttonText}>Calculate KMPL</Text>
                    </TouchableOpacity>
                    
                    {result && (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.secondary }]}
                            onPress={resetForm}
                        >
                            <Text style={styles.buttonText}>Calculate Again</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },    header: {
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
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
    tutorialContainer: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
    },
    tutorialTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    tutorialText: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    tutorialNote: {
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 10,
        fontWeight: '500',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    resultContainer: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        alignItems: 'center',
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    resultValue: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    ratingContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 15,
    },
    ratingText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    resultDetails: {
        fontSize: 14,
        marginBottom: 5,
    },
    buttonContainer: {
        marginBottom: 20,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default KMPLCalculatorScreen;
