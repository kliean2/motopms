import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaintenanceRecord } from '../types';

interface MaintenanceItemProps {
    record: MaintenanceRecord;
    currentMileage: number;
}

const MaintenanceItem: React.FC<MaintenanceItemProps> = ({ record, currentMileage }) => {
    const { colors } = useTheme();
    
    const isDue = currentMileage >= record.nextMileage;
    const isOverdue = isDue;
    const remainingKms = record.nextMileage - currentMileage;
    
    const getStatusColor = () => {
        if (isOverdue) return colors.danger;
        if (remainingKms <= 1000) return colors.warning;
        return colors.success;
    };

    const getStatusText = () => {
        if (isOverdue) {
            const overdueBy = currentMileage - record.nextMileage;
            return `Overdue by ${overdueBy.toLocaleString()} km`;
        }
        if (remainingKms <= 0) return 'Due Now';
        return `Due in ${remainingKms.toLocaleString()} km`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderLeftWidth: 4,
            borderLeftColor: getStatusColor(),
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
        },
        maintenanceType: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            flex: 1,
        },
        statusBadge: {
            backgroundColor: getStatusColor(),
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            marginLeft: 10,
        },
        statusText: {
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 'bold',
        },
        details: {
            marginBottom: 8,
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 4,
        },
        detailLabel: {
            fontSize: 14,
            color: colors.textSecondary,
            fontWeight: '500',
        },
        detailValue: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '500',
        },
        partNumber: {
            fontSize: 12,
            color: colors.textSecondary,
            fontStyle: 'italic',
            marginTop: 4,
        },
        notes: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 4,
            lineHeight: 16,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.maintenanceType}>{record.type}</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Service:</Text>
                    <Text style={styles.detailValue}>
                        {record.lastMileage.toLocaleString()} km
                    </Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                        {formatDate(record.lastDate)}
                    </Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Service:</Text>
                    <Text style={styles.detailValue}>
                        {record.nextMileage.toLocaleString()} km
                    </Text>
                </View>

                {record.partNumber && (
                    <Text style={styles.partNumber}>
                        Part: {record.partNumber}
                    </Text>
                )}

                {record.notes && (
                    <Text style={styles.notes}>
                        Notes: {record.notes}
                    </Text>
                )}
            </View>
        </View>
    );
};

export default MaintenanceItem;
