import { User, DashboardConfig, SystemState, UserRole, DatasetInfo } from '../types';

// Keys for LocalStorage
const DB_KEYS = {
    USERS: 'hydrotrans_users',
    DASHBOARDS: 'hydrotrans_dashboards',
    LOGS: 'hydrotrans_logs',
    DATASET: 'hydrotrans_dataset'
};

// Initial Seed Data
const SEED_USERS: User[] = [
    {
        id: 'admin-1',
        username: 'admin',
        passwordHash: 'admin123', // In real app, verify hash. using plain for sim as per constraints
        role: 'ADMIN',
        isActive: true
    },
    {
        id: 'user-1',
        username: 'operator',
        passwordHash: 'user123',
        role: 'USER',
        isActive: true
    }
];

const SEED_DASHBOARDS: DashboardConfig[] = [
    {
        id: 'dash-default',
        name: 'Standard Operator Deck',
        layout: 'grid-default',
        createdBy: 'system',
        createdAt: Date.now(),
        widgets: [
            { id: 'w1', type: 'ALERTS', title: 'System Alerts' },
            { id: 'w2', type: 'SCHEMATIC', title: 'Plant Schematic' },
            { id: 'w3', type: 'CHART_PRESSURE', title: 'Penstock Pressure' },
            { id: 'w4', type: 'CHART_FLOW', title: 'Flow Rate' },
            { id: 'w5', type: 'TELEMETRY', title: 'Real-time Telemetry' },
            { id: 'w6', type: 'AI_ADVISOR', title: 'AI Assistant' }
        ]
    },
    {
        id: 'dash-minimal',
        name: 'Minimal Monitoring',
        layout: 'minimal',
        createdBy: 'system',
        createdAt: Date.now(),
        widgets: [
            { id: 'w1', type: 'ALERTS', title: 'System Alerts' },
            { id: 'w2', type: 'TELEMETRY', title: 'Real-time Telemetry' },
            { id: 'w3', type: 'CHART_PRESSURE', title: 'Pressure Only' }
        ]
    }
];

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDb = {
    init: () => {
        if (!localStorage.getItem(DB_KEYS.USERS)) {
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_USERS));
        }
        if (!localStorage.getItem(DB_KEYS.DASHBOARDS)) {
            localStorage.setItem(DB_KEYS.DASHBOARDS, JSON.stringify(SEED_DASHBOARDS));
        }
    },

    // Auth & User Management
    authenticate: async (username: string, passwordPlain: string): Promise<User | null> => {
        await delay(500);
        const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
        const user = users.find((u: User) => u.username === username && u.passwordHash === passwordPlain);

        if (user) {
            // Log Login
            mockDb.logActivity(user.id, 'LOGIN', 'User logged in successfully');
            // Update Last Login
            const updatedUsers = users.map((u: User) => u.id === user.id ? { ...u, lastLogin: Date.now() } : u);
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(updatedUsers));
            return user;
        }
        return null;
    },

    getUsers: async (): Promise<User[]> => {
        await delay(200);
        return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    },

    createUser: async (user: User): Promise<void> => {
        const users = await mockDb.getUsers();
        users.push(user);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    },

    updateUser: async (updatedUser: User): Promise<void> => {
        const users = await mockDb.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        }
    },

    // Dashboards
    getDashboards: async (): Promise<DashboardConfig[]> => {
        await delay(300);
        return JSON.parse(localStorage.getItem(DB_KEYS.DASHBOARDS) || '[]');
    },

    saveDashboard: async (dashboard: DashboardConfig): Promise<void> => {
        const dashboards = await mockDb.getDashboards();
        const idx = dashboards.findIndex(d => d.id === dashboard.id);
        if (idx !== -1) {
            dashboards[idx] = dashboard;
        } else {
            dashboards.push(dashboard);
        }
        localStorage.setItem(DB_KEYS.DASHBOARDS, JSON.stringify(dashboards));
    },

    deleteDashboard: async (id: string): Promise<void> => {
        const dashboards = await mockDb.getDashboards();
        const filtered = dashboards.filter(d => d.id !== id);
        localStorage.setItem(DB_KEYS.DASHBOARDS, JSON.stringify(filtered));
    },

    // Logs
    logActivity: (userId: string, action: string, details: string) => {
        const logs = JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
        logs.unshift({ timestamp: Date.now(), userId, action, details });
        if (logs.length > 200) logs.pop(); // Keep size manageable
        localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
    },

    getLogs: async () => {
        return JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
    },

    // Dataset Management
    saveDataset: async (dataset: DatasetInfo): Promise<void> => {
        localStorage.setItem(DB_KEYS.DATASET, JSON.stringify(dataset));
        mockDb.logActivity('system', 'DATASET_UPLOAD', `Dataset ${dataset.fileName} uploaded with ${dataset.rowCount} rows`);
    },

    getDataset: async (): Promise<DatasetInfo | null> => {
        const data = localStorage.getItem(DB_KEYS.DATASET);
        return data ? JSON.parse(data) : null;
    },

    clearDataset: async (): Promise<void> => {
        localStorage.removeItem(DB_KEYS.DATASET);
    }
};

// Initialize on load
mockDb.init();
