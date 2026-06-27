import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SystemState, SimulationParams } from '../types';

export const generatePDFReport = (
    projectName: string,
    params: SimulationParams,
    history: SystemState[]
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(30, 41, 59); // Slate 900
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("HydroTransAI", 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("TRANSIENT ANALYSIS REPORT", 20, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 34);

    // Project Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(projectName, 20, 55);

    doc.setFontSize(12);
    doc.text("1. Input Parameters", 20, 70);

    const paramData = [
        ["Gross Head", `${params.grossHead} m`],
        ["Penstock Length", `${params.penstockLength} m`],
        ["Diameter", `${params.penstockDiameter} m`],
        ["Wave Speed", `${params.waveSpeed} m/s`],
        ["Pipe Material", params.pipeMaterial],
        ["Closure Time", `${params.guideVaneClosureTime} s`]
    ];

    autoTable(doc, {
        startY: 75,
        head: [['Parameter', 'Value']],
        body: paramData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
    });

    // Problem Statement
    const yPos = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("2. Problem Statement & Model", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const problemText =
        `The system simulates hydraulic transients (water hammer) initiated by guide vane maneuvers. ` +
        `Governing equations: Method of Characteristics (MOC) assumption via Joukowsky's Equation (dP = -rho * c * dV). ` +
        `The model accounts for fluid inertia, pipe elasticity, and surge tank mass oscillations.`;

    doc.text(problemText, 20, yPos + 10, { maxWidth: pageWidth - 40 });

    // Safety Analysis Summary
    const yPos2 = yPos + 40;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("3. Safety Analysis", 20, yPos2);

    // Calculate Peak Values
    const maxPressure = Math.max(...history.map(s => s.penstockPressure));
    const maxVibration = Math.max(...history.map(s => s.vibration));
    const maxTemp = Math.max(...history.map(s => s.temperature || 0)); // handle undefined if old history
    const cavitationEvents = history.filter(s => s.cavitationRisk).length;

    const safetyData = [
        ["Max Pressure Surge", `${maxPressure.toFixed(2)} m`, maxPressure > 600 ? "CRITICAL" : "SAFE"],
        ["Max Vibration", `${maxVibration.toFixed(2)} mm/s`, maxVibration > 2.0 ? "WARNING" : "SAFE"],
        ["Peak Temperature", `${maxTemp.toFixed(1)} °C`, maxTemp > 65 ? "WARNING" : "SAFE"],
        ["Cavitation Events", `${cavitationEvents} ticks`, cavitationEvents > 0 ? "CRITICAL" : "SAFE"]
    ];

    autoTable(doc, {
        startY: yPos2 + 10,
        head: [['Metric', 'Value', 'Status']],
        body: safetyData,
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38] },
        columnStyles: { 2: { fontStyle: 'bold' } }
    });

    // Data Logs (Sample)
    doc.addPage();
    doc.text("4. Simulation Logs (Last 50 Entries)", 20, 20);

    const logData = history.slice(-50).map(s => [
        new Date(s.timestamp).toLocaleTimeString(),
        s.penstockPressure.toFixed(1),
        s.flowRate.toFixed(1),
        s.turbineSpeed.toFixed(0),
        s.guideVaneOpening.toFixed(1),
        s.temperature ? s.temperature.toFixed(1) : '-'
    ]);

    autoTable(doc, {
        startY: 25,
        head: [['Time', 'Pressure (m)', 'Flow (m3/s)', 'RPM', 'Gate (%)', 'Temp (C)']],
        body: logData,
        theme: 'plain',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [71, 85, 105] }
    });

    doc.save(`${projectName.replace(/\s+/g, '_')}_Report.pdf`);
};
