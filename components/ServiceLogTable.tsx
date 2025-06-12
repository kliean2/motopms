import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Platform,
    Dimensions,
    Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { ServiceLogEntry } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface ServiceLogTableProps {
    serviceLog: ServiceLogEntry[];
    onAddEntry: (entry: Omit<ServiceLogEntry, 'id'>) => void;
    onUpdateEntry: (id: string, entry: Partial<ServiceLogEntry>) => void;
}

interface EditingCell {
    rowIndex: number;
    field: 'date' | 'procedure' | 'odometer' | 'amount';
}

interface NewEntryFlow {
    rowIndex: number;
    step: 'date' | 'procedure' | 'odometer' | 'amount' | 'completed';
    data: {
        date: Date;
        procedure: string;
        odometer: string;
        amount: string;
        notes: string;
    };
}

// Fixed column widths that account for borders and padding
// Use most of the available width, accounting for screen margins
const availableWidth = screenWidth - 40; // Account for screen margins and some buffer

const COLUMN_WIDTHS = {
    date: Math.floor(availableWidth * 0.18),        // 18% - Date column
    procedure: Math.floor(availableWidth * 0.40),   // 40% - Main content, needs most space
    odometer: Math.floor(availableWidth * 0.21),    // 21% - Numbers with commas
    amount: Math.floor(availableWidth * 0.21),      // 21% - Currency amounts
};

// Minimum number of visible rows
const MIN_ROWS = 10;

// Utility functions
const formatNumberWithCommas = (value: string): string => {
    const numericValue = value.replace(/[^\d.]/g, '');
    if (!numericValue) return '';
    const parts = numericValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
};

const getNumericValue = (formattedValue: string): string => {
    return formattedValue.replace(/,/g, '');
};

const ServiceLogTable: React.FC<ServiceLogTableProps> = ({
    serviceLog,
    onAddEntry,
    onUpdateEntry,
}) => {
    const { colors } = useTheme();
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [newEntryFlow, setNewEntryFlow] = useState<NewEntryFlow | null>(null);
    const [showInputModal, setShowInputModal] = useState(false);
    const [modalInputValue, setModalInputValue] = useState('');
    const [modalNotesValue, setModalNotesValue] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [modalPlaceholder, setModalPlaceholder] = useState('');
    const [modalInputType, setModalInputType] = useState<'default' | 'numeric'>('default');
    
    // Create a fixed array of rows (existing entries + empty rows to reach minimum)
    const createTableData = () => {
        const sortedLogs = [...serviceLog].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const tableData: (ServiceLogEntry | null)[] = [...sortedLogs];
        
        // Add empty rows to reach minimum
        while (tableData.length < MIN_ROWS) {
            tableData.push(null);
        }
        
        return tableData;
    };
    
    const tableData = createTableData();

    const handleCellPress = (rowIndex: number, field: string) => {
        const entry = tableData[rowIndex];
        
        if (!entry) {
            // Empty cell - start new entry flow
            if (field === 'date') {
                setNewEntryFlow({
                    rowIndex,
                    step: 'date',
                    data: {
                        date: new Date(),
                        procedure: '',
                        odometer: '',
                        amount: '',
                        notes: '',
                    }
                });
                setTempDate(new Date());
                setShowDatePicker(true);
            } else {
                // For non-date fields on empty rows, start from date
                Alert.alert('Info', 'Please start by setting the date first.');
            }
        } else {
            // Existing entry - direct edit
            setEditingCell({ rowIndex, field: field as any });
            
            if (field === 'date') {
                setTempDate(new Date(entry.date));
                setShowDatePicker(true);
            } else {
                // Open input modal for direct editing
                if (field === 'procedure') {
                    openProcedureModal(entry.procedure || '', entry.notes || '');
                } else {
                    openInputModal(field, (entry as any)[field]?.toString() || '');
                }
            }
        }
    };

    const openProcedureModal = (procedure: string = '', notes: string = '') => {
        setModalInputValue(procedure);
        setModalNotesValue(notes);
        setModalTitle('Edit Procedure & Notes');
        setModalPlaceholder('Enter procedure/service...');
        setModalInputType('default');
        setShowInputModal(true);
    };

    const openInputModal = (field: string, currentValue: string = '') => {
        setModalInputValue(currentValue);
        setModalNotesValue('');
        setModalInputType(field === 'odometer' || field === 'amount' ? 'numeric' : 'default');
        
        switch (field) {
            case 'odometer':
                setModalTitle('Edit Odometer');
                setModalPlaceholder('Enter odometer reading...');
                break;
            case 'amount':
                setModalTitle('Edit Amount');
                setModalPlaceholder('Enter amount...');
                break;
        }
        setShowInputModal(true);
    };

    const handleModalConfirm = () => {
        if (editingCell) {
            // Direct edit of existing entry
            const entry = tableData[editingCell.rowIndex];
            if (entry) {
                if (editingCell.field === 'procedure') {
                    onUpdateEntry(entry.id, { 
                        procedure: modalInputValue,
                        notes: modalNotesValue 
                    });
                } else {
                    let processedValue: any = modalInputValue;
                    
                    if (editingCell.field === 'odometer' || editingCell.field === 'amount') {
                        if (modalInputValue === '') {
                            processedValue = editingCell.field === 'amount' ? undefined : 0;
                        } else {
                            const numericValue = parseFloat(getNumericValue(modalInputValue));
                            if (!isNaN(numericValue) && numericValue >= 0) {
                                processedValue = numericValue;
                            } else {
                                Alert.alert('Error', 'Please enter a valid number.');
                                return;
                            }
                        }
                    }
                    
                    onUpdateEntry(entry.id, { [editingCell.field]: processedValue });
                }
            }
        } else if (newEntryFlow) {
            // New entry flow
            const updatedData = { ...newEntryFlow.data };
            
            switch (newEntryFlow.step) {
                case 'procedure':
                    if (!modalInputValue.trim()) {
                        Alert.alert('Error', 'Procedure is required.');
                        return;
                    }
                    updatedData.procedure = modalInputValue.trim();
                    updatedData.notes = modalNotesValue.trim();
                    // Move to odometer step
                    setNewEntryFlow({
                        ...newEntryFlow,
                        step: 'odometer',
                        data: updatedData
                    });
                    openInputModal('odometer');
                    return;
                    
                case 'odometer':
                    if (!modalInputValue.trim()) {
                        Alert.alert('Error', 'Odometer reading is required.');
                        return;
                    }
                    const odometerValue = parseFloat(getNumericValue(modalInputValue));
                    if (isNaN(odometerValue) || odometerValue < 0) {
                        Alert.alert('Error', 'Please enter a valid odometer reading.');
                        return;
                    }
                    updatedData.odometer = modalInputValue;
                    // Move to amount step
                    setNewEntryFlow({
                        ...newEntryFlow,
                        step: 'amount',
                        data: updatedData
                    });
                    openInputModal('amount');
                    return;
                    
                case 'amount':
                    let amountValue: number | undefined = undefined;
                    if (modalInputValue.trim()) {
                        const parsedAmount = parseFloat(getNumericValue(modalInputValue));
                        if (isNaN(parsedAmount) || parsedAmount < 0) {
                            Alert.alert('Error', 'Please enter a valid amount or leave it blank.');
                            return;
                        }
                        amountValue = parsedAmount;
                    }
                    
                    // Complete the new entry
                    const finalOdometerValue = parseFloat(getNumericValue(updatedData.odometer));
                    onAddEntry({
                        date: updatedData.date.toISOString(),
                        procedure: updatedData.procedure,
                        odometer: finalOdometerValue,
                        amount: amountValue,
                        notes: updatedData.notes,
                    });
                    
                    setNewEntryFlow(null);
                    break;
            }
        }
        
        setShowInputModal(false);
        setEditingCell(null);
        setModalInputValue('');
        setModalNotesValue('');
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setTempDate(selectedDate);
            
            if (editingCell) {
                // Direct edit of existing entry
                const entry = tableData[editingCell.rowIndex];
                if (entry) {
                    onUpdateEntry(entry.id, { date: selectedDate.toISOString() });
                }
                setEditingCell(null);
            } else if (newEntryFlow) {
                // New entry flow - move to procedure step
                const updatedData = { ...newEntryFlow.data, date: selectedDate };
                setNewEntryFlow({
                    ...newEntryFlow,
                    step: 'procedure',
                    data: updatedData
                });
                openProcedureModal();
            }
        } else {
            // User cancelled
            setEditingCell(null);
            setNewEntryFlow(null);
        }
    };

    const handleModalCancel = () => {
        setShowInputModal(false);
        setEditingCell(null);
        setNewEntryFlow(null);
        setModalInputValue('');
        setModalNotesValue('');
    };

    const renderCell = (
        rowIndex: number,
        field: string,
        value: any,
        isHeader: boolean = false,
        width: number
    ) => {
        const entry = tableData[rowIndex];
          let displayValue = value;
        
        if (!isHeader && entry) {
            displayValue = (entry as any)[field];
            
            if (field === 'date') {
                try {
                    const dateObj = new Date(displayValue);
                    displayValue = dateObj.toLocaleDateString();
                } catch (error) {
                    displayValue = 'Invalid Date';
                }
            } else if (field === 'procedure') {
                // Show procedure and notes together
                const procedure = entry.procedure || '';
                const notes = entry.notes || '';                if (notes) {
                    displayValue = `${procedure}\n${notes}`;
                } else {
                    displayValue = procedure;
                }
            } else if (field === 'odometer' && displayValue !== undefined && displayValue !== null) {
                try {
                    displayValue = Number(displayValue).toLocaleString();
                } catch (error) {
                    displayValue = '0';
                }
            } else if (field === 'amount' && displayValue !== undefined && displayValue !== null) {
                try {
                    displayValue = `₱${Number(displayValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                } catch (error) {
                    displayValue = '₱0.00';
                }
            }
        }        const cellStyle = [
            styles.cell,
            { width, borderColor: colors.border },
            isHeader && { backgroundColor: colors.primary },
            !isHeader && !entry && { backgroundColor: colors.surface },
        ];

        if (isHeader) {
            return (
                <View style={cellStyle} key={field}>
                    <Text style={[styles.headerText, { color: '#ffffff' }]}>
                        {value !== null && value !== undefined ? String(value) : ''}
                    </Text>
                </View>
            );
        }

        return (
            <TouchableOpacity
                key={`${rowIndex}-${field}`}
                style={cellStyle}
                onPress={() => handleCellPress(rowIndex, field)}
            >
                <Text style={[styles.cellText, { color: entry ? colors.text : colors.textSecondary }]} numberOfLines={3}>
                    {displayValue !== null && displayValue !== undefined ? String(displayValue) : ''}
                </Text>
            </TouchableOpacity>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        table: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            overflow: 'hidden',
        },        row: {
            flexDirection: 'row',
            minHeight: 50,
        },
        cell: {
            paddingVertical: 8,
            paddingHorizontal: 2,
            borderRightWidth: 1,
            borderBottomWidth: 1,
            justifyContent: 'center',
            minHeight: 50,
        },        cellText: {
            fontSize: 11,
            textAlign: 'center',
        },
        headerText: {
            fontSize: 11,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        scrollContainer: {
            paddingBottom: 20,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            backgroundColor: colors.surface,
            padding: 20,
            borderRadius: 10,
            width: '80%',
            maxWidth: 300,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 15,
            textAlign: 'center',
        },
        modalInput: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.background,
            marginBottom: 10,
            minHeight: 45,
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 15,
        },
        modalButton: {
            flex: 1,
            padding: 12,
            borderRadius: 6,
            alignItems: 'center',
            marginHorizontal: 5,
        },
        cancelButton: {
            backgroundColor: colors.border,
        },
        confirmButton: {
            backgroundColor: colors.primary,
        },
        buttonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.table}>
                    
                    <View style={styles.row}>
                        {renderCell(-1, 'date', 'Date', true, COLUMN_WIDTHS.date)}
                        {renderCell(-1, 'procedure', 'Procedure & Notes', true, COLUMN_WIDTHS.procedure)}
                        {renderCell(-1, 'odometer', 'Odometer (km)', true, COLUMN_WIDTHS.odometer)}
                        {renderCell(-1, 'amount', 'Amount', true, COLUMN_WIDTHS.amount)}
                    </View>

                    {tableData.map((entry, rowIndex) => (
                        <View key={rowIndex} style={styles.row}>
                            {renderCell(rowIndex, 'date', null, false, COLUMN_WIDTHS.date)}
                            {renderCell(rowIndex, 'procedure', null, false, COLUMN_WIDTHS.procedure)}
                            {renderCell(rowIndex, 'odometer', null, false, COLUMN_WIDTHS.odometer)}
                            {renderCell(rowIndex, 'amount', null, false, COLUMN_WIDTHS.amount)}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {showDatePicker && (                <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            <Modal
                visible={showInputModal}
                transparent
                animationType="fade"
                onRequestClose={handleModalCancel}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{modalTitle}</Text>
                        
                        <TextInput
                            style={styles.modalInput}
                            value={modalInputValue}
                            onChangeText={setModalInputValue}
                            placeholder={modalPlaceholder}
                            placeholderTextColor={colors.textSecondary}
                            keyboardType={modalInputType}
                            autoFocus
                        />
                        
                        {modalTitle.includes('Procedure') && (
                            <TextInput
                                style={[styles.modalInput, { minHeight: 60 }]}
                                value={modalNotesValue}
                                onChangeText={setModalNotesValue}
                                placeholder="Enter notes (optional)..."
                                placeholderTextColor={colors.textSecondary}
                                multiline
                            />
                        )}
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={handleModalCancel}
                            >
                                <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleModalConfirm}
                            >
                                <Text style={styles.buttonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ServiceLogTable;
