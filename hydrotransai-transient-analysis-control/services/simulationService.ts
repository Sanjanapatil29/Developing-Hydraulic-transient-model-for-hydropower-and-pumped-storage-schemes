import { SystemState, OperationMode, SimulationParams } from '../types';

// Physical Constants
const VAPOR_PRESSURE_HEAD = -9.8; // Meters of water head (approx vacuum)

export const generateInitialState = (params?: SimulationParams): SystemState => ({
  timestamp: Date.now(),
  penstockPressure: params?.grossHead ?? 500,
  flowRate: 0,
  turbineSpeed: 300,
  guideVaneOpening: 80,
  surgeTankLevel: params?.grossHead ?? 500,
  powerOutput: 100,
  vibration: 0.5,
  temperature: 45.0,
  cavitationRisk: false
});

/**
 * Advanced Discrete-Time Simulation of Hydraulic Transients (Method of Characteristics approximation)
 * Calculates Water Hammer, Surge, and Turbine Dynamics.
 */
export const advanceSimulation = (
  prevState: SystemState,
  mode: OperationMode,
  targetGate: number,
  params: SimulationParams
): SystemState => {
  const dt = 0.1; // Delta time in seconds simulation step

  // 1. Derived Physical Properties
  const area = Math.PI * Math.pow(params.penstockDiameter / 2, 2);
  const nominalFlow = params.flowVelocity * area; // Base flow at 100% gate (simplified)

  // 2. Guide Vane Dynamics (Servo response)
  const gateDiff = targetGate - prevState.guideVaneOpening;

  // Max gate speed defined by closure time (100% / time seconds)
  // Ensure we don't divide by zero
  const maxGateSpeed = 100 / Math.max(1, params.guideVaneClosureTime);

  const gateChange = Math.sign(gateDiff) * Math.min(Math.abs(gateDiff), maxGateSpeed * dt);
  const newGate = Math.max(0, Math.min(100, prevState.guideVaneOpening + gateChange));

  // 3. Flow Dynamics with Inertia
  // Target flow is proportional to gate opening
  let quantityDirection = 1;
  if (mode === OperationMode.PUMPING || mode === OperationMode.TRANSIENT_PUMP_TRIP) quantityDirection = -1;

  const theoreticalFlow = (newGate / 100) * nominalFlow * quantityDirection;

  // Flow Inertia: The longer the penstock, the slower the flow changes. 
  // Time constant T_w = L * Q / (g * H * A) approximated factor here
  const inertiaFactor = 0.05 * (2000 / params.penstockLength); // Scale relative to default length
  const flowDiff = theoreticalFlow - prevState.flowRate;
  let newFlow = prevState.flowRate + flowDiff * inertiaFactor;

  // 4. Water Hammer (Joukowsky Equation)
  // Pressure Surge dH = - (a / g) * dV
  // dV = dQ / Area
  const dQ = newFlow - prevState.flowRate;
  const dV = dQ / area;

  // Elasticity factor (reduces rigid water column impact) typically < 1 in discrete steps without full MOC grid
  const elasticity = 0.8;
  const waterHammerHead = -1 * (params.waveSpeed / params.gravity) * dV * elasticity;

  // Damping and Restoration
  // Pressure returns to Static Head (Reservoir Level) - Friction Loss
  const frictionLoss = params.roughness * (params.penstockLength / params.penstockDiameter) * (Math.pow(newFlow / area, 2) / (2 * params.gravity));
  const staticHead = params.grossHead - (newFlow > 0 ? frictionLoss : -frictionLoss);

  let newPressure = prevState.penstockPressure + waterHammerHead;

  // Spring effect restoring to static head
  newPressure = newPressure + (staticHead - newPressure) * 0.1;

  // Damping
  const damping = 0.95;
  newPressure = (newPressure - staticHead) * damping + staticHead;

  // Add simplified wave reflections (noise/harmonics)
  newPressure += (Math.random() - 0.5) * 1.5;

  // 5. Cavitation Check
  const cavitationRisk = newPressure < VAPOR_PRESSURE_HEAD;

  // 6. Turbine / Generator Dynamics
  let electricalLoad = (newGate / 100) * 100; // Load follows gate in normal op

  if (mode === OperationMode.TRANSIENT_LOAD_REJECTION) {
    // Sudden Load Change Logic
    // Load drops to 0 instantly or over 'suddenLoadChangeTime'
    electricalLoad = 0;
  }

  // Hydraulic Power (MW) = rho * g * Q * H * eff / 10^6
  // rho=1000, g=9.81 => ~ 0.00981 * Q * H
  // Efficiency curve approximation (peak at 80% gate)
  const eff = 0.9 - Math.pow((newGate - 80) / 100, 2);
  const hydraulicPower = Math.abs(newFlow * newPressure * 0.00981 * eff);

  // Speed Change dN/dt = (Power_hydro - Power_elec) / Inertia
  const powerImbalance = hydraulicPower - (mode === OperationMode.TRANSIENT_LOAD_REJECTION ? 0 : hydraulicPower);

  let speedChange = 0;
  if (mode === OperationMode.TRANSIENT_LOAD_REJECTION) {
    const inertiaConstant = 5; // Ta (seconds)
    speedChange = (hydraulicPower / 100) * (300 / inertiaConstant) * dt;
  } else {
    // Grid synchronization holds speed steady with minor wobble
    speedChange = (Math.random() - 0.5) * 0.2;
  }

  let newSpeed = prevState.turbineSpeed + speedChange;

  // 7. Surge Tank Dynamics
  // Simple mass oscillation: dZ = (Q_penstock - Q_tunnel) * dt / Area_surge
  // We simulate a simplified oscillation overlay
  const surgePeriod = 200; // seconds
  const time = Date.now() / 1000;
  const surgeOscillation = 2 * Math.sin(time / surgePeriod * 2 * Math.PI);

  // If big rejection, surge spikes
  let transientSurge = 0;
  if (mode === OperationMode.TRANSIENT_LOAD_REJECTION) {
    // Simplified transient surge spike
    transientSurge = 10 * Math.sin(time);
  }

  const newSurgeLevel = params.grossHead + surgeOscillation + transientSurge;

  // 8. Vibration Analysis
  let newVibration = 0.5;
  // Flow turbulence
  newVibration += Math.abs(newFlow / nominalFlow) * 0.5;
  // Cavitation vibration
  if (cavitationRisk) newVibration += 8.0;
  // Partial load vortex (rough zone 30-50%)
  if (newGate > 30 && newGate < 50) newVibration += 2.5;
  // Overspeed
  if (newSpeed > 350) newVibration += 3.0;

  // 9. Temperature (Motor Winding)
  // Heat generation proportional to Power^2 + Vibration
  // Cooling proportional to Temp difference with ambient (25C)
  const ambientTemp = 25;
  const heating = (Math.pow(hydraulicPower / 100, 2) * 0.05) + (newVibration * 0.01);
  const cooling = (prevState.temperature - ambientTemp) * 0.005;
  const newTemp = prevState.temperature + heating - cooling;

  return {
    timestamp: Date.now(),
    penstockPressure: Math.max(-10, newPressure), // Clamp at vacuum
    flowRate: newFlow,
    turbineSpeed: Math.max(0, newSpeed),
    guideVaneOpening: newGate,
    surgeTankLevel: newSurgeLevel,
    powerOutput: (mode === OperationMode.TRANSIENT_LOAD_REJECTION) ? 0 : hydraulicPower,
    vibration: newVibration,
    temperature: newTemp,
    cavitationRisk
  };
};