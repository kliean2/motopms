
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
import { useTheme } from '../contexts/ThemeContext';

interface CurrentMileageProps {
    currentMileage: number;
    onUpdate: (newMileage: number) => void;
}

const CurrentMileage: React.FC<CurrentMileageProps> = ({ currentMileage, onUpdate }) => {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [newMileage, setNewMileage] = useState(currentMileage.toString());

    const handleUpdate = () => {
        const mileage = parseFloat(newMileage);
        
        if (isNaN(mileage) || mileage < 0) {
            Alert.alert('Error', 'Please enter a valid mileage');
            return;
        }

        if (mileage < currentMileage) {
            Alert.alert(
                'Warning', 
                'New mileage is less than current mileage. Are you sure?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Update', 
                        onPress: () => {
                            onUpdate(mileage);
                            setModalVisible(false);
                        }
                    }
                ]
            );
        } else {
            onUpdate(mileage);
            setModalVisible(false);
        }
    };    const openModal = () => {
        setNewMileage(currentMileage.toString());
        setModalVisible(true);
    };

    return (
        <View>
            <TouchableOpacity style={[styles.updateButton, { backgroundColor: colors.info }]} onPress={openModal}>
                <View style={styles.buttonContent}>
                    <Text style={styles.updateButtonText}>
                        Current: {currentMileage.toLocaleString()} kms
                    </Text>
                </View>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Update Current Mileage</Text>
                        
                        <Text style={[styles.label, { color: colors.text }]}>Current Mileage (kms)</Text>
                        <TextInput
                            style={[styles.input, { 
                                borderColor: colors.border, 
                                color: colors.text, 
                                backgroundColor: colors.surface 
                            }]}
                            value={newMileage}
                            onChangeText={setNewMileage}
                            placeholder="Enter current mileage"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton, { backgroundColor: colors.secondary }]} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.updateButton, { backgroundColor: colors.info }]} 
                                onPress={handleUpdate}
                            >
                                <Text style={styles.updateButtonText}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    updateButton: {
        padding: 15,
        margin: 15,
        borderRadius: 8,
        alignItems: 'center',
    },    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonIcon: {
        marginRight: 8,
    },
    updateButtonText: {
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
        margin: 20,
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        // backgroundColor will be set inline
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CurrentMileage;
