export interface MaintenanceRecord {
    id: string;
    type: string;
    lastMileage: number;
    lastDate: string;
    nextMileage: number;
    nextDue: boolean;
    partNumber?: string;
    notes?: string;
}

export interface Motorcycle {
    id: string;
    name: string;
    make: string;
    model: string;
    year?: number;
    currentMileage: number;
    records: MaintenanceRecord[];
    createdAt: string;
    imageUri?: string;
}

export interface AppSettings {
    isDarkMode: boolean;
    defaultUnit: 'km' | 'miles';
    reminderDistance: number;
}

export interface AppData {
    motorcycles: Motorcycle[];
    settings: AppSettings;
}

// Maintenance intervals in kilometers
export const MAINTENANCE_INTERVALS = {
    'Oil Change': 1500,
    'Gear Oil Change': 6000,
    'Carbon Cleaning': 3000,
    'Spark Plug': 12000,
    'Spark Plug Cap': 12000,
    'Air Filter': 18000,
    'Drive Belt Replacement': 24000,
    'Weight Roller Set': 24000,
    'Slider Piece Replacement': 10000,
    'Wheel Bearing': 50000,
    'Ball Race Set': 50000,
    'Brake Bleeding': 12000,
};

// Motorcycle type presets
export const MOTORCYCLE_PRESETS = {
    scooter: {
        name: 'Scooter/PCX',
        intervals: {
            'Oil Change': 1500,
            'Gear Oil Change': 6000,
            'Carbon Cleaning': 3000,
            'Spark Plug': 12000,
            'Air Filter': 18000,
            'Drive Belt Replacement': 24000,
            'Weight Roller Set': 24000,
            'CVT Cleaning': 12000,
        }
    },
    sport: {
        name: 'Sport Bike',
        intervals: {
            'Oil Change': 3000,
            'Oil Filter': 6000,
            'Air Filter': 12000,
            'Spark Plug': 15000,
            'Chain Cleaning': 1000,
            'Chain Replacement': 20000,
            'Brake Fluid': 24000,
            'Coolant': 24000,
        }
    },
    cruiser: {
        name: 'Cruiser',
        intervals: {
            'Oil Change': 5000,
            'Oil Filter': 10000,
            'Air Filter': 15000,
            'Spark Plug': 20000,
            'Belt Inspection': 8000,
            'Brake Fluid': 24000,
            'Final Drive': 30000,
        }
    },
    custom: {
        name: 'Custom',
        intervals: MAINTENANCE_INTERVALS
    }
};

// Theme colors
export const COLORS = {
    light: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#dee2e6',
    },
    dark: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        success: '#198754',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#0dcaf0',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff',
        textSecondary: '#adb5bd',
        border: '#495057',
    }
};
