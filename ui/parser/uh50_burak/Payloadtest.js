// Funktion zum Reversieren von Hex-Strings in Byte-Paaren
function reverseString(hexString) {
    return hexString.match(/.{2}/g).reverse().join('');
}

// Funktion zum Umkehren und in Dezimal umwandeln
function reverseAndConvertToDecimal(payload) {
    const reversedHex = reverseString(payload);
    console.log("Reversed: ", reversedHex);
    const decimalValue = parseInt(reversedHex, 16);
    return decimalValue;
}

// Funktion zur Skalierung des Wertes basierend auf dem Feldtyp
function applyScaling(value, unit, fieldType) {
    let factor = 1;
    let check = "";

    switch (fieldType) {
        case "energy":
            [factor, check] = switchingStandardEnergy(unit);
            break;
        case "volume":
            [factor, check] = switchingStandardVolume(unit);
            break;
        case "power":
            [factor, check] = switchingStandardPower(unit);
            break;
        case "flow":
            [factor, check] = switchingStandardFlow(unit);
            break;
        case "forwardTemperature":
            [factor, check] = switchingStandardForwardTemperature(unit);
            break;
        case "returnTemperature":
            [factor, check] = switchingStandardReturnTemperature(unit);
            break;
        default:
            console.error("Unbekannter Feldtyp");
            return null;
    }

    return value / factor;
}

// Switching for Standard Messages - Energy Field (Convert all to MWh 2 decimals)
function switchingStandardEnergy(unit) {
    let factor = 1;
    let check = "";
    switch (unit) {
        case "0C06":
            factor = 1000; // Convert kWh to MWh
            check = "0C06, MWh 2";
            break;
        case "0C07":
            factor = 100; // Already MWh, adjust to 2 decimals
            check = "0C07, MWh 2";
            break;
        case "0CFB00":
            factor = 10; // Already MWh, adjust to 2 decimals
            check = "0CFB00, MWh 2";
            break;
        case "0CFB01":
            factor = 1; // Already MWh, adjust to 2 decimals
            check = "0CFB01, MWh 2";
            break;
        case "0CFB08":
            factor = 277.78; // Convert GJ to MWh
            check = "0CFB08, MWh 2";
            break;
        case "0CFB09":
            factor = 277.78; // Convert GJ to MWh
            check = "0CFB09, MWh 2";
            break;
        case "0C0E":
            factor = 277.78; // Convert GJ to MWh
            check = "0C0E, MWh 2";
            break;
        case "0C0F":
            factor = 27.778; // Convert GJ to MWh
            check = "0C0F, MWh 2";
            break;
        default:
            factor = 1;
            check = "Unknown";
            break;
    }
    return [factor, check];
}

// Switching for Standard Messages - Volume Field (Convert all to m³ 2 decimals)
function switchingStandardVolume(unit) {
    let factor = 1;
    let check = "";
    switch (unit) {
        case "0C14":
            factor = 100; // m³, adjust to 2 decimals
            check = "0C14, m³ 2";
            break;
        case "0C15":
            factor = 10; // m³, adjust to 2 decimals
            check = "0C15, m³ 2";
            break;
        case "0C16":
            factor = 1; // m³, adjust to 2 decimals
            check = "0C16, m³ 2";
            break;
        default:
            factor = 1;
            check = "Unknown";
            break;
    }
    return [factor, check];
}

function switchingStandardPower(unit) {
    let factor = 1;
    let check = "";
    switch (unit) {
        case "0B2B":
            factor = 1000; // kW, adjust to 2 decimals
            check = "0B2B, kW 2";
            break;
        case "0B2C":
            factor = 100; // kW, already formatted to 2 decimals
            check = "0B2C, kW 2";
            break;
        case "0B2D":
            factor = 10; // kW, adjust to 2 decimals
            check = "0B2D, kW 2";
            break;
        case "0B2E":
            factor = 1; // kW, adjust to 2 decimals
            check = "0B2E, kW 2";
            break;
        default:
            factor = 1;
            check = "Unknown";
            break;
    }
    return [factor, check];
}

function switchingStandardFlow(unit) {
    let factor = 1;
    let check = "";
    switch (unit) {
        case "0B3B":
            factor = 1000; // m³/h, adjust from 3 decimals to 2 decimals
            check = "0B3B, m³/h 2";
            break;
        case "0B3C":
            factor = 100; // m³/h, already at 2 decimals
            check = "0B3C, m³/h 2";
            break;
        case "0B3D":
            factor = 10; // m³/h, adjust from 1 decimal to 2 decimals
            check = "0B3D, m³/h 2";
            break;
        case "0B3E":
            factor = 1; // m³/h, adjust from 0 decimals to 2 decimals
            check = "0B3E, m³/h 2";
            break;
        default:
            factor = 1;
            check = "Unknown";
            break;
    }
    return [factor, check];
}

function switchingStandardForwardTemperature(unit) {
    let factor = 1;
    let check = "";
    switch (unit) {
        case "0A5A":
            factor = 10; // °C, adjust from 1 decimal to 1 decimal (standardize the handling)
            check = "0A5A, °C 1";
            break;
        case "0A5B":
            factor = 1; // °C, adjust from 0 decimals to 1 decimal
            check = "0A5B, °C 1";
            break;
        default:
            factor = 1;
            check = "Unknown";
            break;
    }
    return [factor, check];
}

function switchingStandardReturnTemperature(unit) {
    let factor = 1;
    let check = "";
    switch (unit) {
        case "0A5E":
            factor = 10; // °C, already at 1 decimal (no conversion needed, just keeping structure)
            check = "0A5E, °C 1";
            break;
        case "0A5F":
            factor = 1; // °C, adjust from 0 decimals to 1 decimal
            check = "0A5F, °C 1";
            break;
        default:
            factor = 1;
            check = "Unknown";
            break;
    }
    return [factor, check];
}



// Switching for Scheduled Messages - Energy Field
function switchingScheduledEnergy(unit) {
    let factor = 1;
    let check = "";
    switch (unit) {
        case "0C06":
            factor = 1000; // MWh, 3 decimals
            check = "0C06, MWh 3";
            break;
        case "0C07":
            factor = 100; // MWh, 2 decimals
            check = "0C07, MWh 2";
            break;
        case "0CFB00":
            factor = 10; // MWh, 1 decimal
            check = "0CFB00, MWh 1";
            break;
        case "0CFB01":
            factor = 1; // MWh, 0 decimals
            check = "0CFB01, MWh 0";
            break;
        case "0CFB08":
            factor = 36; // GJ, 1 decimal
            check = "0CFB08, GJ 1";
            break;
        case "0CFB09":
            factor = 3.6; // GJ, 0 decimals
            check = "0CFB09, GJ 0";
            break;
        default:
            factor = 1;
            check = "Unknown";
            break;
    }
    console.log(factor, check)
    return [factor, check];
}


// Switching for Scheduled Messages - Accumulated Energy at 24:00
function switchingScheduledAccumulatedEnergy(unit, value) {
    let factor;
    switch (unit) {
        case "4C06":
            factor = 1000; // Convert kWh to MWh, 3 decimal places to 2 decimal places
            break;
        case "4C07":
            factor = 100; // MWh, 2 decimal places (already formatted appropriately)
            break;
        case "4CFB00":
            factor = 10; // MWh, 1 decimal place to 2 decimal places
            break;
        case "4CFB01":
            factor = 1; // MWh, 0 decimal places to 2 decimal places
            break;
        case "4C0E":
            factor = 0.27778; // Convert GJ to MWh, 3 decimal places to 2 decimal places
            break;
        case "4C0F":
            factor = 0.27778; // Convert GJ to MWh, 2 decimal places (already formatted appropriately)
            break;
        case "4CFB08":
            factor = 0.27778; // Convert GJ to MWh, 1 decimal place to 2 decimal places
            break;
        case "4CFB09":
            factor = 0.27778; // Convert GJ to MWh, 0 decimal places to 2 decimal places
            break;
        default:
            factor = 1; // Default case (if OBIS code not matched)
            break;
    }
    return value / factor;
}


// Hauptfunktion zur Verarbeitung des Feldes
function processField(messageType, fieldType, prefix, value) {
    console.log(`Message Type: ${messageType}`);
    console.log(`Field Type: ${fieldType}`);
    console.log(`Prefix: ${prefix}`);
    console.log(`Value (Hex): ${value}`);

    // Reverse und Konvertiere den Wert in Dezimal
    const decimalValue = reverseAndConvertToDecimal(value);
    console.log(`Reversed and Converted Decimal Value: ${decimalValue}`);

    // Skaliere den Wert basierend auf dem Feldtyp
    const scaledValue = applyScaling(decimalValue, prefix, fieldType);
    console.log(`Scaled Value: ${scaledValue}`);
    console.log(``);

    return scaledValue;
}

// Beispiel-Aufruf der Funktion
processField("00", "energy", "0CFB09", "ABCD1200");
processField("00", "volume", "0C15", "98765432");
processField("00", "power", "0B2C", "112233");
processField("00", "flow", "0B3D", "556677");
processField("00", "forwardTemperature", "0A5B", "3456");
processField("00", "returnTemperature", "0A5F", "789A");

function reverse(payload) {
    // Teilt die Zeichenkette in 2-stellige Bytes auf, kehrt die Reihenfolge um und fügt sie wieder zusammen
    const reversed = payload.match(/.{2}/g).reverse().join('');
    return reversed;
}

// Beispiel:
const input = "70779070";
console.log(reverse(input)); // Erwartet: "70907770"