
import { SimulationParams } from '../types';
import type { DatasetInfo } from '../types';

/**
 * Service to handle dataset parsing and mapping to simulation parameters.
 * Currently supports generic CSV mapping.
 */

export interface DatasetRow {
    [key: string]: string | number;
}

export const parseCSV = (csvText: string): DatasetRow[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: DatasetRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',');
        const row: DatasetRow = {};

        headers.forEach((header, index) => {
            // Try to parse as number if possible
            const val = values[index]?.trim();
            const numVal = parseFloat(val);
            row[header] = isNaN(numVal) ? val : numVal;
        });

        data.push(row);
    }

    return data;
};

export const createDatasetInfo = (fileName: string, csvText: string): DatasetInfo => {
    const data = parseCSV(csvText);
    const headers = csvText.split('\n')[0]?.split(',').map(h => h.trim()) || [];

    return {
        fileName,
        uploadedAt: Date.now(),
        rowCount: data.length,
        headers,
        data
    };
};

export const mapDatasetToParams = (data: DatasetRow[]): Partial<SimulationParams> => {
    if (data.length === 0) return {};

    // Use the first row to determine availability, but we might want to let user select a row later.
    // For now, we take the first valid row with data.
    const row = data[0];
    const params: Partial<SimulationParams> = {};

    // Helper to find key case-insensitively
    const findKey = (candidates: string[]): string | undefined => {
        const keys = Object.keys(row);
        for (const candidate of candidates) {
            const found = keys.find(k => k.toLowerCase() === candidate.toLowerCase());
            if (found) return found;
        }
        return undefined;
    };

    // 1. Gross Head (m)
    const headKey = findKey(['GrossHead', 'dam_height_m', 'height', 'head', 'drop']);
    if (headKey) {
        params.grossHead = Number(row[headKey]);
    }

    // 2. Penstock Length (m)
    const lenKey = findKey(['PenstockLength', 'length', 'pipe_len']);
    if (lenKey) {
        params.penstockLength = Number(row[lenKey]);
    } else if (params.grossHead) {
        // Heuristic: If detailed length missing, assume 1.5x height for reasonable slope
        params.penstockLength = params.grossHead * 1.5;
    }

    // 3. Diameter (m) - Derived if missing
    const diamKey = findKey(['PenstockDiameter', 'diameter', 'width']);
    if (diamKey) {
        params.penstockDiameter = Number(row[diamKey]);
    }

    // 4. Power / Flow Estimation
    // If we have Installed Capacity (MW), estimate Flow and Diameter
    const powerKey = findKey(['installed_capacity_MW', 'capacity', 'power_mw']);
    if (powerKey && params.grossHead && params.grossHead > 0) {
        const powerMW = Number(row[powerKey]);
        // P(MW) = rho * g * Q * H * eff / 10^6
        // Q = (P * 10^6) / (1000 * 9.81 * H * 0.9)
        // Q = (P * 1000) / (8.829 * H)
        if (powerMW > 0) {
            const estimatedFlow = (powerMW * 1000) / (8.8 * params.grossHead);

            // If Diameter is missing, estimate based on optimal flow velocity ~4m/s
            // A = Q / V => pi*r^2 = Q/4 => D = sqrt(4 * Q / (pi * 4))
            if (!params.penstockDiameter) {
                params.penstockDiameter = Math.sqrt(estimatedFlow / Math.PI);
            }

            // Set initial flow velocity
            // This is an 'initial condition' param
            // We map this to 'flowVelocity' which is usually V0 in the simulation
            params.flowVelocity = 5.0; // Standard initial guess or derived: estimatedFlow / (Math.PI * Math.pow(params.penstockDiameter! / 2, 2));
        }
    }

    return params;
};
