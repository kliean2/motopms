import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { Motorcycle } from '../types';

interface HomeScreenProps {
    navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { colors, isDarkMode, toggleTheme } = useTheme();
    const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMotorcycles = async () => {
        try {
            setLoading(true);
            const data = await AsyncStorage.getItem('@motorcycles_data');
            if (data) {
                const parsedData = JSON.parse(data);
                setMotorcycles(parsedData.motorcycles || []);
            }
        } catch (error) {
            console.error('Error loading motorcycles:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadMotorcycles();
        }, [])
    );

    const deleteMotorcycle = (motorcycleId: string) => {
        Alert.alert(
            'Delete Motorcycle',
            'Are you sure you want to delete this motorcycle and all its maintenance records?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedMotorcycles = motorcycles.filter(m => m.id !== motorcycleId);
                        setMotorcycles(updatedMotorcycles);
                        try {
                            await AsyncStorage.setItem('@motorcycles_data', JSON.stringify({
                                motorcycles: updatedMotorcycles,
                                settings: { isDarkMode, defaultUnit: 'km', reminderDistance: 500 }
                            }));
                        } catch (error) {
                            console.error('Error deleting motorcycle:', error);
                        }
                    }
                }
            ]
        );
    };

    const getDueCount = (motorcycle: Motorcycle) => {
        return motorcycle.records.filter(record => 
            motorcycle.currentMileage >= record.nextMileage
        ).length;
    };

    const getNextDueDistance = (motorcycle: Motorcycle) => {
        const sortedRecords = motorcycle.records
            .filter(record => motorcycle.currentMileage < record.nextMileage)
            .sort((a, b) => a.nextMileage - b.nextMileage);
        
        if (sortedRecords.length > 0) {
            return sortedRecords[0].nextMileage - motorcycle.currentMileage;
        }
        return null;
    };

    const renderMotorcycleCard = ({ item }: { item: Motorcycle }) => {
        const dueCount = getDueCount(item);
        const nextDue = getNextDueDistance(item);

        return (
            <TouchableOpacity
                style={[styles.motorcycleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.navigate('MotorcycleDetail', { motorcycleId: item.id })}
                onLongPress={() => deleteMotorcycle(item.id)}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.motorcycleInfo}>
                        <Text style={[styles.motorcycleName, { color: colors.text }]}>
                            {item.name}
                        </Text>
                        <Text style={[styles.motorcycleModel, { color: colors.textSecondary }]}>
                            {item.make} {item.model}{item.year ? ` (${item.year})` : ''}
                        </Text>
                        <Text style={[styles.currentMileage, { color: colors.textSecondary }]}>
                            {item.currentMileage.toLocaleString()} kms
                        </Text>
                    </View>
                </View>

                <View style={styles.statusContainer}>
                    {dueCount > 0 && (
                        <View style={[styles.statusBadge, { backgroundColor: colors.danger }]}>
                            <Text style={styles.statusBadgeText}>
                                {dueCount} Due!
                            </Text>
                        </View>
                    )}
                    
                    {dueCount === 0 && nextDue !== null && (
                        <View style={[styles.statusBadge, { backgroundColor: colors.info }]}>
                            <Text style={styles.statusBadgeText}>
                                Next in {nextDue.toLocaleString()} km
                            </Text>
                        </View>
                    )}

                    {dueCount === 0 && nextDue === null && (
                        <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                            <Text style={styles.statusBadgeText}>
                                All Good!
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text }}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>My Motorcycles</Text>
                    </View>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {motorcycles.length === 0 
                        ? 'Add your first motorcycle to get started' 
                        : `${motorcycles.length} motorcycle${motorcycles.length > 1 ? 's' : ''}`
                    }
                </Text>
            </View>
            <View style={styles.headerRight}>
                    <View style={styles.themeToggle}>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={'#ffffff'}
                        />
                    </View>
                </View>
            </View>

            {motorcycles.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Welcome to Bike Tracker!</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Keep track of your motorcycle maintenance schedule and never miss an important service again.
                    </Text>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('AddMotorcycle')}
                    >
                        <Text style={styles.addButtonText}>Add Your First Motorcycle</Text>
                    </TouchableOpacity>
                </View>
            ) : (                <View style={styles.content}>
                    <FlatList
                        data={motorcycles}
                        renderItem={renderMotorcycleCard}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }} // Adjusted for smaller tab bar
                    />
                </View>
            )}

            {motorcycles.length > 0 && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('AddMotorcycle')}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        marginLeft: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },    headerSubtitle: {
        fontSize: 16,
    },
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    addButton: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    motorcycleCard: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    motorcycleInfo: {
        flex: 1,
    },
    motorcycleName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    motorcycleModel: {
        fontSize: 16,
        marginBottom: 5,
    },
    currentMileage: {
        fontSize: 14,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusBadgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },    fab: {
        position: 'absolute',
        right: 20,
        bottom: 105, // Adjusted for smaller tab bar
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabText: {
        fontSize: 24,
        color: '#ffffff',
        fontWeight: 'bold',
    },
});

export default HomeScreen;
