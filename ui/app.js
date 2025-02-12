import { parseUH50 } from './parser/uh50_burak/parser.js';
import { parserForUH30 } from './parser/uh30_annalena/uh30.js';

Chart.register({
    id: 'backgroundColorPlugin',
    beforeDraw: (chart) => {
        // Überprüfen, ob das Plugin in der Konfiguration vorhanden ist
        if (
            chart.config.options.plugins &&
            chart.config.options.plugins.backgroundColorPlugin &&
            chart.config.options.plugins.backgroundColorPlugin.backgroundColor
        ) {
            const ctx = chart.ctx;
            ctx.save();
            ctx.fillStyle = chart.config.options.plugins.backgroundColorPlugin.backgroundColor;
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    }
});
const charts = {}; // Speicher für alle Diagramme
let radarChart;

const chartKeys = ['energy', 'volume', 'power', 'flow', 'forwardTemperature', 'returnTemperature'];

const radarChartKeys = ['power', 'flow', 'forwardTemperature', 'returnTemperature'];

const fixedAxisRanges = {
    energy: { min: 0, max: 5000 }, 
    volume: { min: 0, max: 150000 },
    power: { min: 0, max: 200 },
    flow: { min: 0, max: 6 },
    forwardTemperature: { min: 0, max: 120 },
    returnTemperature: { min: 0, max: 120 },
};
const units = {
    energy: 'MWh',
    volume: 'm³',
    power: 'kW',
    flow: 'm³/h',
    forwardTemperature: '°C',
    returnTemperature: '°C',
};
const errorTables = {
    UH_50: [
        { bitNo: 0, decimalValue: 1, identifier: 'F0', explanation: 'Error during flow metering (e.g. Air in measuring pipe)' },
        { bitNo: 1, decimalValue: 2, identifier: 'F1', explanation: 'Interruption of flow temperature sensor' },
        { bitNo: 2, decimalValue: 4, identifier: 'F2', explanation: 'Interruption of return temperature sensor' },
        { bitNo: 3, decimalValue: 8, identifier: 'F3', explanation: 'Electronic for temperature evaluation defective' },
        { bitNo: 4, decimalValue: 16, identifier: 'F4', explanation: 'Battery empty 1' },
        { bitNo: 5, decimalValue: 32, identifier: 'F5', explanation: 'Short-circuit flow temperature sensor' },
        { bitNo: 6, decimalValue: 64, identifier: 'F6', explanation: 'Short-circuit return temperature sensor' },
        { bitNo: 7, decimalValue: 128, identifier: 'F7', explanation: 'Fault in the internal memory (CRC)' },
        { bitNo: 8, decimalValue: 256, identifier: 'F8', explanation: 'Error F1, F2, F5 or F6 pending for longer than 8h.' },
        { bitNo: 9, decimalValue: 512, identifier: 'F9', explanation: 'Error in the electronics' },
        { bitNo: 10, decimalValue: 1024, identifier: 'F0V', explanation: 'Prewarning for soiling of the measurement tube' },
        { bitNo: 11, decimalValue: 2048, identifier: 'F7V', explanation: 'Correctable error in the internal memory EEPROM 2' },
        { bitNo: 12, decimalValue: '-', identifier: '-', explanation: 'Always 0' },
        { bitNo: 13, decimalValue: '-', identifier: '-', explanation: 'Always 0' },
        { bitNo: 14, decimalValue: '-', identifier: '-', explanation: 'Always 0' },
        { bitNo: 15, decimalValue: '-', identifier: '-', explanation: 'Always 0' },
    ],
    // Andere Parser Errortabellen können hier hinzugefügt werden
    UH_30: [
        { bitNo: 31, decimalValue: 0, identifier: 'F.0', explanation: 'No flow can be measured (F0)' },
        { bitNo: 30, decimalValue: 0, identifier: 'F.1', explanation: 'Interruption in the hot side temperature sensor (F1)' },
        { bitNo: 29, decimalValue: 0, identifier: 'F.2', explanation: 'Interruption in the cold side temperature sensor (F2)' },
        { bitNo: 28, decimalValue: 0, identifier: 'F.3', explanation: 'Electronics for temperature evaluation defective (F3)' },
        { bitNo: 27, decimalValue: 0, identifier: 'E.0', explanation: 'Problem with the power supply; Battery empty (F4)' },
        { bitNo: 26, decimalValue: 0, identifier: 'E.1', explanation: 'Short-circuit forward flow temperature sensor (F5)' },
        { bitNo: 25, decimalValue: 0, identifier: 'E.2', explanation: 'Short-circuit return flow temperature sensor (F6)' },
        { bitNo: 24, decimalValue: 0, identifier: 'E.3', explanation: 'Fault in internal memory holding (EEPROM) (F7)' },
        { bitNo: 23, decimalValue: 0, identifier: 'D.0', explanation: 'Errors F1, F2, F3, F5 or F6 for longer than 8 hours, recognition of attempts to manipulate. No further measurements are carried out. (F8)' },
        { bitNo: 22, decimalValue: 0, identifier: 'D.1', explanation: 'Fault in the electronics (F9)' },
        { bitNo: 21, decimalValue: 0, identifier: 'D.2', explanation: 'Reserved' },
        { bitNo: 20, decimalValue: 0, identifier: 'D.3', explanation: '0 = Amount of energy in case of incorrect installation, 1 = Amount of cooling energy' },
        { bitNo: 19, decimalValue: 0, identifier: 'C.0', explanation: '0 = Installation location cannot be changed when calibration seal is set, 1 = Installation location can be changed when calibration seal is set' },
        { bitNo: 15, decimalValue: 0, identifier: 'B.0', explanation: 'F0 pre-warning' },
        { bitNo: 14, decimalValue: 0, identifier: 'B.1', explanation: 'F4 pre-warning' },
        { bitNo: 13, decimalValue: 0, identifier: 'B.2', explanation: 'Installation error sensor' },
        { bitNo: 12, decimalValue: 0, identifier: 'B.3', explanation: 'Installation error volume measurement part' },
        { bitNo: 11, decimalValue: 0, identifier: 'A.0', explanation: 'Negative temperature difference (Difference-Negative)' },
        { bitNo: 10, decimalValue: 0, identifier: 'A.1', explanation: 'Incorrect flow direction (Flow-Negative)' },
        { bitNo: 8, decimalValue: 0, identifier: 'A.3', explanation: '0 = Installation in return flow position, 1 = Installation in forward flow position' },
        { bitNo: 1, decimalValue: 0, identifier: 'ZZ.6', explanation: 'Leakage warning (water meters)' },
        { bitNo: 0, decimalValue: 0, identifier: 'ZZ.7', explanation: 'Time error DSMR' },
    ],
    
    Sharky: [],
    Itron: [],
};
const plausibleRanges = {
    energy: [50, 4000], // Beispielbereich für Energie
    volume: [100, 100000],
    power: [10, 180],
    flow: [0.1, 5],
    forwardTemperature: [0, 100],
    returnTemperature: [0, 100],
};

// Globale Variable, um zu verfolgen, ob der Verarbeiten-Button gedrückt wurde
let isProcessed = false;

initializeEmptyTable();
initializeEmptyCharts();
initializeRadarChart();


// Funktion, um die Seite zurückzusetzen
function resetPage() {
    // Tabelle leeren
    initializeEmptyTable();

    // Diagramme leeren
    initializeEmptyCharts();

    // Fehlertabelle aktualisieren
    const tableContainer = document.getElementById('error-table-container');
    tableContainer.innerHTML = '<p>Wähle zuerst einen Parser aus.</p>';

    // Überprüfen, ob ein Parser ausgewählt ist
    const selectedParser = document.getElementById('parser-select').value;

    // "Verarbeiten"-Button aktivieren oder deaktivieren
    document.getElementById('process-parser').disabled = !selectedParser;

    // "Plausibility Check"-Button immer deaktivieren (bis Verarbeitung erfolgt)
    document.getElementById('plausibility-check-btn').disabled = true;

    // Verarbeiten-Status zurücksetzen
    isProcessed = false;
}

// Event Listener für Parser-Auswahl
document.getElementById('parser-select').addEventListener('change', (event) => {
    const selectedParser = event.target.value;

    // Reset the page to clear previous data
    resetPage();
    document.getElementById('parser-input').disabled = false;

    // Update the error table with no active errors
    if (selectedParser) {
        displayErrorTable(selectedParser, []);
    }
});

// Event Listener für "Verarbeiten"-Button
document.getElementById('process-parser').addEventListener('click', () => {
    const hexInput = document.getElementById('parser-input').value.trim();
    const selectedParser = document.getElementById('parser-select').value;
    console.log("Selected Parser:" + selectedParser);

    // Check if a machine is selected
    if (!selectedParser) {
        alert('Bitte einen Parser auswählen, bevor der Payload verarbeitet wird!');
        return;
    }

    // Check if payload input is empty
    if (!hexInput) {
        alert('Bitte einen Payload eingeben!');
        return;
    }

    // Call processPayload to handle parsing and table/chart updates
    processPayload(hexInput, selectedParser);
});

// Event Listener für "Plausibility Check"-Button
document.getElementById('plausibility-check-btn').addEventListener('click', () => {
    if (!isProcessed) {
        alert('Bitte zuerst den Payload verarbeiten!');
        return;
    }

    // Plausibility Checks durchführen
    applyPlausibilityChecks();
});

// Funktion zur Verarbeitung des Payloads
function processPayload(payload, parserType) {
    try {
        let result; 
        if (parserType == 'UH_50'){
            result = parseUH50(payload);
        }else if (parserType == 'UH_30'){
            result = parserForUH30(payload);
        }else{
            throw new Error('Ungültiger Parser Typ');
        }

        // Update the details table and charts
        displayPayloadDetails(result);
        updateCharts(result);
        updateRadarChart(result);

        // Extract the errors array
        const activeErrors = result.errors && result.errors !== 0 ? result.errors : []; // Handle 0 as no errors

        // Update the error table with the active errors
        const selectedParser = document.getElementById('parser-select').value;
        displayErrorTable(selectedParser, activeErrors);

        // Enable the plausibility check button
        document.getElementById('plausibility-check-btn').disabled = false;

        // Mark processing as complete
        isProcessed = true;
    } catch (error) {
        alert('Fehler bei der Verarbeitung des Payloads: ' + error.message);
    }
}

// Funktion zur Initialisierung einer leeren Tabelle
function initializeEmptyTable() {
    const tableBody = document.querySelector('#details-table tbody');
    if (!tableBody) {
        console.error("Das Element '#details-table tbody' wurde nicht gefunden.");
        return;
    }

    // Lasse die Tabelle leer, aber mit einer sichtbaren Struktur
    tableBody.innerHTML = ''; // Tabelle wird ohne Inhalt angezeigt
}

// Funktion zur Anzeige von Payload-Details in der Tabelle
function displayPayloadDetails(payload) {
    const tableBody = document.querySelector('#details-table tbody');
    const messageTypeElement = document.querySelector('#message-type');

    if (!tableBody) {
        console.error("Das Element '#details-table tbody' wurde nicht gefunden.");
        return;
    }

    if (!messageTypeElement) {
        console.error("Das Element '#message-type' wurde nicht gefunden.");
        return;
    }

    // Tabelle leeren
    tableBody.innerHTML = '';

    // Extrahiere den Message Type aus der Payload
    const messageType = payload.messageType || 'Unbekannt'; // Falls nicht vorhanden, Standardwert

    // Zeige den Message Type im HTML an
    messageTypeElement.textContent = `Message Type: ${messageType}`;

    // Fülle die Tabelle mit den Payload-Daten
    Object.entries(payload).forEach(([key, value]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${key}</td>
            <td>${value}</td>
            <td>${units[key] || ''}</td> <!-- Einheit anzeigen, falls vorhanden -->
        `;
        tableBody.appendChild(row);
    });
}

function applyPlausibilityChecks() {
    console.log("applyPlausibilityChecks wird ausgeführt!"); // Debugging
    // Iteriere durch die plausiblen Bereiche
    Object.entries(plausibleRanges).forEach(([key, range]) => {
        console.log(`Überprüfe Plausibilität für ${key} mit Bereich ${range}`); // Debugging
        const canvas = document.getElementById(`chart-${key}`);
        if (!canvas) {
            console.error(`Canvas für ${key} wurde nicht gefunden.`);
            return;
        }

        const chartInstance = Chart.getChart(canvas); // Bestehendes Diagramm abrufen
        if (!chartInstance) {
            console.error(`Diagramm für ${key} wurde nicht gefunden.`);
            return;
        }

        const value = chartInstance.data.datasets[0].data[0]; // Aktuellen Wert abrufen
        console.log(`Wert für ${key}: ${value}`); // Debugging
        const [min, max] = range;

        // Plausiblen Bereich als Annotation hinzufügen
        chartInstance.options.plugins.annotation = {
            annotations: {
                rangeBox: {
                    type: 'box',
                    xScaleID: 'x',
                    yScaleID: 'y',
                    xMin: -0.5,
                    xMax: 0.5,
                    yMin: min,
                    yMax: max,
                    backgroundColor: 'rgba(192, 192, 192, 0.2)', // Transparente Markierung
                    borderWidth: 0,
                },
            },
        };

        chartInstance.update(); // Diagramm mit Annotation aktualisieren

        setTimeout(() => {
            const backgroundColor = value >= min && value <= max
                ? 'rgba(144, 238, 144, 0.3)' // Grün
                : 'rgba(255, 99, 71, 0.3)'; // Rot
        
            // Hintergrundfarbe setzen
            chartInstance.options.plugins.backgroundColorPlugin = {
                beforeDraw: (chart) => {
                    const ctx = chart.ctx;
                    ctx.save();
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                },
            };
        
            console.log(`Hintergrundfarbe für ${key}: ${backgroundColor}`); // Debugging
            chartInstance.update(); // Diagramm erneut aktualisieren
        }, 1000);
        
    });
}

function initializeEmptyCharts() {
    const chartsContainer = document.getElementById('charts');
    chartsContainer.innerHTML = ''; // Alte Inhalte entfernen

    // Definiere die Keys, für die Diagramme erstellt werden sollen
    const dataKeys = ['energy', 'volume', 'power', 'flow', 'forwardTemperature', 'returnTemperature'];

    // Erstelle ein leeres Diagramm für jeden Key
    dataKeys.forEach((key) => {
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${key}`;
        canvas.style.marginBottom = '20px';
        chartsContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Hole die festen Achsenbereiche für den Key
        const axisRange = fixedAxisRanges[key] || { min: 0, max: 100 }; // Fallback für unbekannte Keys

        // Erstellt ein leeres Chart mit der globalen charts-Referenz
        charts[key] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [key], // Label entspricht dem Key
                datasets: [{
                    label: `Leeres Diagramm: ${key}`,
                    data: [0], // Initial keine Daten
                    backgroundColor: 'rgba(192, 192, 192, 0.5)',
                    borderColor: 'rgba(192, 192, 192, 1)',
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: axisRange.min,
                        max: axisRange.max, // Feste Maximal- und Minimalwerte
                        ticks: {
                            font: {
                                size: 20, // Größere Schriftgröße für Y-Achse
                            },
                        },
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 20, // Größere Schriftgröße für X-Achse
                            },
                        },
                    },
                },
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                size: 20, // Größere Schriftgröße für Legenden
                            },
                        },
                    },
                },
            },
        });
    });
}


function updateCharts(payload) {
    Object.entries(payload).forEach(([key, value]) => {
        if (!chartKeys.includes(key)) return; // Überspringe Keys, die nicht in chartKeys enthalten sind
        if (typeof value !== 'number') return; // Überspringe nicht-numerische Werte

        // Bestehendes Diagramm zerstören
        if (charts[key]) {
            charts[key].destroy();
        }

        // Neues Diagramm mit aktualisierten Daten erstellen
        const canvas = document.getElementById(`chart-${key}`);
        if (!canvas) {
            console.error(`Canvas für ${key} wurde nicht gefunden.`);
            return;
        }

        const ctx = canvas.getContext('2d');
        charts[key] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [key],
                datasets: [{
                    label: key,
                    data: [value],
                    backgroundColor: 'rgba(75, 192, 192, 0.5)', // Balkenfarbe
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: fixedAxisRanges[key].min,
                        max: fixedAxisRanges[key].max, // Feste Maximal- und Minimalwerte
                        ticks: {
                            font: {
                                size: 20, // Größere Schriftgröße für Y-Achse
                            },
                        },
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 20, // Größere Schriftgröße für X-Achse
                            },
                        },
                    },
                },
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                size: 20, // Größere Schriftgröße für Legenden
                            },
                        },
                    },
                },
            },
        });
    });     
}

function displayErrorTable(machine, errorsArray = []) {
    const tableContainer = document.getElementById('error-table-container');
    tableContainer.innerHTML = ''; // Clear any existing table

    const errors = errorTables[machine];
    if (!errors) {
        tableContainer.innerHTML = '<p>Keine Fehlertabelle für diese Maschine verfügbar.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'error-table';

    // Table header
    table.innerHTML = `
        <thead>
            <tr>
                <th>Bit-No</th>
                <th>Decimal Value</th>
                <th>Identifier</th>
                <th>Explanation</th>
                <th>Status</th>
            </tr>
        </thead>
    `;

    // Table body
    const tbody = document.createElement('tbody');
    errors.forEach((error) => {
        // Check if the current error identifier is active
        const isErrorActive = errorsArray.includes(error.identifier); // Match identifier
        const status = isErrorActive
            ? '<span style="color: red;">❌</span>' // Red cross for active errors
            : '<span style="color: green;">✔️</span>'; // Green checkmark for inactive errors

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${error.bitNo}</td>
            <td>${error.decimalValue}</td>
            <td>${error.identifier}</td>
            <td>${error.explanation}</td>
            <td>${status}</td>
        `;
        tbody.appendChild(row);
    });

    // Add a summary row for "No Errors"
    const allErrorsResolved = errorsArray.length === 0; // Check if no errors are active
    const noErrorsRow = document.createElement('tr');
    noErrorsRow.innerHTML = `
        <td colspan="4" style="text-align: center; font-weight: bold;">No Errors</td>
        <td>${allErrorsResolved ? '<span style="color: green;">✔️</span>' : '<span style="color: red;">❌</span>'}</td>
    `;
    tbody.appendChild(noErrorsRow);

    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

// Function to initialize the radar chart
function initializeRadarChart() {
    const radarCanvas = document.getElementById("radar-chart");
    if (!radarCanvas) {
        console.error("Radar chart canvas not found.");
        return;
    }

    const radarCtx = radarCanvas.getContext("2d");

    const radarData = {
        labels: ["Power", "Flow", "forwardTemperature", "returnTemperature"],
        datasets: [{
            label: "Payload",
            data: [0, 0, 0, 0],
            fill: true,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            pointBackgroundColor: "rgba(54, 162, 235, 1)",
        }]
    };

    radarChart = new Chart(radarCtx, {
        type: "radar",
        data: radarData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

function updateRadarChart(payloadData){
    let radarData = [];

    Object.entries(payloadData).forEach(([key, value])=>{
        if(radarChartKeys.includes(key)){
            radarData.push(value);
        }
    });
    radarChart.data.datasets[0].data = radarData;
    radarChart.update();
}
