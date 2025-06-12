import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Modal, 
    StyleSheet, 
    Alert 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../contexts/ThemeContext';
import { MaintenanceRecord, MAINTENANCE_INTERVALS } from '../types';

interface MaintenanceFormProps {
    onAdd: (record: Omit<MaintenanceRecord, 'id'>) => void;
    currentMileage: number;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ onAdd, currentMileage }) => {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [type, setType] = useState('');
    const [customType, setCustomType] = useState('');
    const [mileage, setMileage] = useState(currentMileage.toString());
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [partNumber, setPartNumber] = useState('');

    const maintenanceTypes = Object.keys(MAINTENANCE_INTERVALS);

    const handleSubmit = () => {
        const selectedType = type === 'Custom' ? customType : type;
        const maintenanceMileage = parseInt(mileage);
        
        if (!selectedType || !maintenanceMileage || !date) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (maintenanceMileage > currentMileage) {
            Alert.alert('Error', 'Maintenance mileage cannot be greater than current mileage');
            return;
        }

        const interval = MAINTENANCE_INTERVALS[selectedType as keyof typeof MAINTENANCE_INTERVALS] || 3000;
        const nextMileage = maintenanceMileage + interval;

        const record: Omit<MaintenanceRecord, 'id'> = {
            type: selectedType,
            lastMileage: maintenanceMileage,
            lastDate: date,
            nextMileage,
            nextDue: currentMileage >= nextMileage,
            partNumber: partNumber || undefined,
        };

        onAdd(record);
        resetForm();
        setModalVisible(false);
    };

    const resetForm = () => {
        setType('');
        setCustomType('');
        setMileage(currentMileage.toString());
        setDate(new Date().toISOString().split('T')[0]);
        setPartNumber('');
    };    const styles = StyleSheet.create({
        addButton: {
            backgroundColor: colors.primary,
            padding: 15,
            margin: 15,
            borderRadius: 8,
            alignItems: 'center',
        },
        addButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: colors.background,
            margin: 20,
            padding: 20,
            borderRadius: 10,
            width: '90%',
            maxHeight: '80%',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
            color: colors.text,
        },
        label: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 5,
            marginTop: 10,
            color: colors.text,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            padding: 10,
            borderRadius: 5,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.surface,
        },
        pickerContainer: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 5,
            backgroundColor: colors.surface,
        },
        picker: {
            height: 50,
            color: colors.text,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
        },
        button: {
            flex: 1,
            padding: 15,
            borderRadius: 5,
            alignItems: 'center',
            marginHorizontal: 5,
        },
        cancelButton: {
            backgroundColor: colors.secondary,
        },
        cancelButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        submitButton: {
            backgroundColor: colors.success,
        },
        submitButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });

    return (
        <View>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addButtonText}>+ Add Maintenance Record</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Maintenance Record</Text>

                        <Text style={styles.label}>Maintenance Type *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={type}
                                onValueChange={setType}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select maintenance type..." value="" />
                                {maintenanceTypes.map((t) => (
                                    <Picker.Item key={t} label={t} value={t} />
                                ))}
                                <Picker.Item label="Custom..." value="Custom" />
                            </Picker>
                        </View>

                        {type === 'Custom' && (
                            <>
                                <Text style={styles.label}>Custom Type *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={customType}
                                    onChangeText={setCustomType}
                                    placeholder="Enter custom maintenance type"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </>
                        )}

                        <Text style={styles.label}>Mileage (kms) *</Text>
                        <TextInput
                            style={styles.input}
                            value={mileage}
                            onChangeText={setMileage}
                            placeholder="Enter mileage"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Date *</Text>
                        <TextInput
                            style={styles.input}
                            value={date}
                            onChangeText={setDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={styles.label}>Part Number (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={partNumber}
                            onChangeText={setPartNumber}
                            placeholder="e.g., Koyo - 6201ZZC3"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.submitButton]} 
                                onPress={handleSubmit}
                            >
                                <Text style={styles.submitButtonText}>Add Record</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default MaintenanceForm;
