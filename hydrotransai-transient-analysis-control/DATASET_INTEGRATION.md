# Dataset Integration - Complete Implementation Guide

## Overview
Your HydroTransAI system now has **full dataset integration**. When you upload a CSV file, it:
1. ✅ **Parses** the data automatically
2. ✅ **Maps** columns to simulation parameters (smart matching)
3. ✅ **Saves** the entire dataset to localStorage
4. ✅ **Persists** across the entire application
5. ✅ **Displays** in the Admin Dashboard

---

## How to Use

### Step 1: Upload Dataset
1. Navigate to **Project Setup**
2. Scroll to the **"Import Dataset (Kaggle/CSV)"** section
3. Click **"Choose File"** and select your CSV:
   - `ideal_dataset.csv` (perfect column match)
   - `large_hydropower_dataset.csv` (100 rows)
   - Any Kaggle hydropower dataset

### Step 2: Auto-Configuration
The system will:
- Parse the CSV file
- Match columns (case-insensitive):
  - `grossHead`, `dam_height_m`, `height`, `head` → Reservoir Level
  - `penstockLength`, `length` → Penstock Length
  - `installed_capacity_MW`, `capacity` → Power (derives flow/diameter)
- Fill in the form fields automatically
- Save the dataset to the database

### Step 3: View Dataset
1. Go to **Admin Dashboard**
2. Click the **"Dataset"** tab
3. You'll see:
   - File name and upload time
   - Total rows and columns
   - Column headers
   - Sample data (first row)
   - Download and Clear buttons

---

## Files Created/Modified

### New Files
1. **`services/datasetService.ts`** - CSV parsing and parameter mapping
2. **`components/DatasetViewer.tsx`** - Dataset display component
3. **`ideal_dataset.csv`** - Perfect test dataset (5 rows)
4. **`large_hydropower_dataset.csv`** - Large test dataset (100 rows)

### Modified Files
1. **`types.ts`** - Added `DatasetInfo` interface
2. **`services/mockDatabase.ts`** - Added dataset storage methods
3. **`components/ProjectSetup.tsx`** - Integrated file upload
4. **`components/admin/AdminDashboard.tsx`** - Added Dataset tab

---

## Dataset Format

### Ideal Format (Exact Match)
```csv
grossHead,penstockLength,penstockDiameter,roughness,waveSpeed,flowVelocity,gravity,guideVaneClosureTime,suddenLoadChangeTime
500,2000,3.5,0.015,1200,5.5,9.81,15,0.1
```

### Kaggle Format (Auto-Mapped)
```csv
dam_height_m,installed_capacity_MW,type,country_code
500,100,Hydroelectric,US
```
The system will:
- Map `dam_height_m` → `grossHead`
- Calculate flow from `installed_capacity_MW`
- Estimate missing parameters

---

## API Reference

### Dataset Service
```typescript
// Parse CSV text to array of objects
parseCSV(csvText: string): DatasetRow[]

// Create dataset info object
createDatasetInfo(fileName: string, csvText: string): DatasetInfo

// Map dataset to simulation parameters
mapDatasetToParams(data: DatasetRow[]): Partial<SimulationParams>
```

### Database Methods
```typescript
// Save dataset
await mockDb.saveDataset(datasetInfo);

// Retrieve dataset
const dataset = await mockDb.getDataset();

// Clear dataset
await mockDb.clearDataset();
```

---

## Next Steps

### Using Dataset in Simulations
The dataset is now stored and can be accessed from any component:

```typescript
import { mockDb } from '../services/mockDatabase';

// Get the dataset
const dataset = await mockDb.getDataset();

// Use it for batch simulations
dataset.data.forEach(row => {
  const params = mapDatasetToParams([row]);
  runSimulation(params);
});
```

### Potential Enhancements
1. **Row Selection** - Let users pick which row to use
2. **Batch Simulation** - Run simulations for all rows
3. **Data Visualization** - Chart dataset statistics
4. **Export Results** - Download simulation results as CSV
5. **Real-time Sync** - Update simulation when dataset changes

---

## Troubleshooting

### "No matching parameters found"
- Check column headers match expected names
- Headers are case-insensitive
- Supported: `grossHead`, `dam_height_m`, `height`, `head`, etc.

### Dataset not persisting
- Data is stored in `localStorage`
- Clearing browser data will remove it
- Use Download button to backup

### File upload fails
- Ensure file is `.csv` or `.json`
- Check file is not corrupted
- Maximum recommended size: 5MB

---

## Summary
✅ **Dataset Upload**: Working  
✅ **Parameter Mapping**: Smart & Flexible  
✅ **Data Persistence**: localStorage  
✅ **Admin View**: Complete  
✅ **Ready for**: Batch simulations, analysis, reporting
