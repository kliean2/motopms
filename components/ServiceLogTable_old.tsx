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
    onDeleteEntry: (id: string) => void;
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

// Fixed column widths that add up to screen width
const COLUMN_WIDTHS = {
    date: screenWidth * 0.20,        // 20%
    procedure: screenWidth * 0.40,    // 40% (larger for procedure + notes)
    odometer: screenWidth * 0.20,     // 20%
    amount: screenWidth * 0.20,       // 20%
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
    onDeleteEntry,
}) => {
    const { colors } = useTheme();
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(new Date());    const [showInputModal, setShowInputModal] = useState(false);
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
    
    const tableData = createTableData();    const handleCellPress = (rowIndex: number, field: string) => {
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
                openInputModal(field, (entry as any)[field]?.toString() || '');
            }
        }
    };

    const openInputModal = (field: string, currentValue: string = '') => {
        setModalInputValue(currentValue);
        setModalInputType(field === 'odometer' || field === 'amount' ? 'numeric' : 'default');
        
        switch (field) {
            case 'procedure':
                setModalTitle('Edit Procedure');
                setModalPlaceholder('Enter procedure/service...');
                break;
            case 'odometer':
                setModalTitle('Edit Odometer');
                setModalPlaceholder('Enter odometer reading...');
                break;
            case 'amount':
                setModalTitle('Edit Amount');
                setModalPlaceholder('Enter amount...');
                break;
            case 'notes':
                setModalTitle('Edit Notes');
                setModalPlaceholder('Enter notes...');
                break;
        }
        setShowInputModal(true);
    };

    const handleModalConfirm = () => {
        if (editingCell) {
            // Direct edit of existing entry
            const entry = tableData[editingCell.rowIndex];
            if (entry) {
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
    };    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
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
                openInputModal('procedure');
            }
        } else {
            // User cancelled
            setEditingCell(null);
            setNewEntryFlow(null);
        }
    };    const handleModalCancel = () => {
        setShowInputModal(false);
        setEditingCell(null);
        setNewEntryFlow(null);
        setModalInputValue('');
    };

    const handleDeleteEntry = (entry: ServiceLogEntry) => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this service log entry?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDeleteEntry(entry.id) }
            ]
        );
    };    const renderCell = (
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
                displayValue = new Date(displayValue).toLocaleDateString();
            } else if (field === 'odometer' && displayValue !== undefined) {
                displayValue = displayValue.toLocaleString();
            } else if (field === 'amount' && displayValue !== undefined) {
                displayValue = `₱${displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        }

        const cellStyle = [
            styles.cell,
            { width, borderColor: colors.border },
            isHeader && { backgroundColor: colors.primary },
            !isHeader && !entry && { backgroundColor: colors.surface },
        ];

        if (isHeader) {
            return (
                <View style={cellStyle} key={field}>
                    <Text style={[styles.headerText, { color: '#ffffff' }]}>{value}</Text>
                </View>
            );
        }

        return (
            <TouchableOpacity
                key={`${rowIndex}-${field}`}
                style={cellStyle}
                onPress={() => handleCellPress(rowIndex, field)}
            >
                <Text style={[styles.cellText, { color: entry ? colors.text : colors.textSecondary }]} numberOfLines={2}>
                    {displayValue || ''}
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
        },
        row: {
            flexDirection: 'row',
            minHeight: 50,
        },
        cell: {
            paddingVertical: 8,
            paddingHorizontal: 4,
            borderRightWidth: 1,
            borderBottomWidth: 1,
            justifyContent: 'center',
            minHeight: 50,
        },
        cellText: {
            fontSize: 12,
            textAlign: 'center',
        },
        headerText: {
            fontSize: 12,
            fontWeight: 'bold',
            textAlign: 'center',
        },        cellInput: {
            fontSize: 14,
            textAlign: 'center',
            padding: 8,
            backgroundColor: colors.surface,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: colors.primary,
            color: colors.text,
        },
        deleteButton: {
            position: 'absolute',
            top: 2,
            right: 2,
            paddingHorizontal: 4,
            paddingVertical: 2,
            backgroundColor: colors.danger,
            borderRadius: 2,
        },
        deleteButtonText: {
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 'bold',
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
            marginBottom: 15,
            minHeight: 45,
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
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
    });

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.table}>
                    {/* Header Row */}
                    <View style={styles.row}>
                        {renderCell(-1, 'date', 'Date', true, COLUMN_WIDTHS.date)}
                        {renderCell(-1, 'procedure', 'Procedure', true, COLUMN_WIDTHS.procedure)}
                        {renderCell(-1, 'odometer', 'Odometer (km)', true, COLUMN_WIDTHS.odometer)}
                        {renderCell(-1, 'amount', 'Amount', true, COLUMN_WIDTHS.amount)}
                        {renderCell(-1, 'notes', 'Notes', true, COLUMN_WIDTHS.notes)}
                    </View>

                    {/* Data Rows */}
                    {tableData.map((entry, rowIndex) => (
                        <View key={rowIndex} style={styles.row}>
                            {entry && (
                                <TouchableOpacity 
                                    style={styles.deleteButton} 
                                    onPress={() => handleDeleteEntry(entry)}
                                >
                                    <Text style={styles.deleteButtonText}>×</Text>
                                </TouchableOpacity>
                            )}
                            {renderCell(rowIndex, 'date', null, false, COLUMN_WIDTHS.date)}
                            {renderCell(rowIndex, 'procedure', null, false, COLUMN_WIDTHS.procedure)}
                            {renderCell(rowIndex, 'odometer', null, false, COLUMN_WIDTHS.odometer)}
                            {renderCell(rowIndex, 'amount', null, false, COLUMN_WIDTHS.amount)}
                            {renderCell(rowIndex, 'notes', null, false, COLUMN_WIDTHS.notes)}
                        </View>
                    ))}
                </View>
            </ScrollView>            {showDatePicker && (
                <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            {/* Input Modal */}
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
                            multiline={modalTitle.includes('Notes')}
                            autoFocus
                        />
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