import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import MaintenanceItem from './MaintenanceItem';
import { MaintenanceRecord } from '../types';

interface MaintenanceListProps {
    records: MaintenanceRecord[];
    currentMileage: number;
}

const MaintenanceList: React.FC<MaintenanceListProps> = ({ records, currentMileage }) => {
    const { colors } = useTheme();
    
    // Sort records by due status (due items first) and then by remaining kms
    const sortedRecords = [...records].sort((a, b) => {
        const aDue = currentMileage >= a.nextMileage;
        const bDue = currentMileage >= b.nextMileage;
        
        if (aDue && !bDue) return -1;
        if (!aDue && bDue) return 1;
        
        // If both due or both not due, sort by remaining kms
        const aRemaining = a.nextMileage - currentMileage;
        const bRemaining = b.nextMileage - currentMileage;
        return aRemaining - bRemaining;
    });

    const dueCount = records.filter(record => currentMileage >= record.nextMileage).length;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        header: {
            padding: 20,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 5,
        },
        subtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 5,
        },
        dueAlert: {
            fontSize: 14,
            color: colors.danger,
            fontWeight: 'bold',
        },
        list: {
            flex: 1,
            padding: 15,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
        },        emptyIcon: {
            marginBottom: 20,
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 10,
            textAlign: 'center',
        },
        emptySubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
        },
    });

    if (records.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Maintenance Schedule</Text>
                    <Text style={styles.subtitle}>No maintenance records yet</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No Maintenance Records</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Add your first maintenance record to start tracking your motorcycle's service history.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Maintenance Schedule</Text>
                <Text style={styles.subtitle}>
                    {records.length} maintenance item{records.length > 1 ? 's' : ''}
                </Text>
                {dueCount > 0 && (
                    <Text style={styles.dueAlert}>
                        {dueCount} maintenance item{dueCount > 1 ? 's' : ''} due!
                    </Text>
                )}
            </View>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {sortedRecords.map((record) => (
                    <MaintenanceItem 
                        key={record.id} 
                        record={record} 
                        currentMileage={currentMileage}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

export default MaintenanceList;
