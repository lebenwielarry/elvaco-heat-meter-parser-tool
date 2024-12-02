export function parseBCD(hexString) {
    let result = 0;
    for (let i = 0; i < hexString.length; i += 2) {
        const byte = parseInt(hexString.substr(i, 2), 16);
        result = result * 100 + byte;  // Each byte contributes to the BCD value
        console.log(`Parsed byte: ${byte}, Result so far: ${result}`);
    }
    return result;
}

export function parseDateTime(hexString) {
    // Convert hex to binary string
    const binString = parseInt(hexString, 16).toString(2).padStart(32, '0');
    
    // Extract relevant fields from the binary string
    const yearHigh = parseInt(binString.slice(0, 4), 2);  // Bits 31-28
    const month = parseInt(binString.slice(4, 8), 2);     // Bits 27-24
    const yearLow = parseInt(binString.slice(8, 11), 2);  // Bits 23-21
    const day = parseInt(binString.slice(11, 16), 2);     // Bits 20-16
    const hour = parseInt(binString.slice(16, 21), 2);    // Bits 12-8
    const minute = parseInt(binString.slice(26, 32), 2);  // Bits 5-0

    // Combine year-high and year-low to form the full year
    const year = (yearHigh << 3) | yearLow;

    // Summertime flag: Bit 15
    const summertimeFlag = parseInt(binString.slice(21, 22), 2) === 1 ? 'DST' : 'Standard Time';

    // Error flag: Bit 7
    const errorFlag = parseInt(binString.slice(22, 23), 2) === 1 ? 'Invalid' : 'Valid';

    // Format the date-time
    const formattedDateTime = `${year + 2000}-${month}-${day} ${hour}:${minute}`;

    console.log(`Year: ${year + 2000}, Month: ${month}, Day: ${day}, Hour: ${hour}, Minute: ${minute}`);
    console.log(`Summertime: ${summertimeFlag}, Error Flag: ${errorFlag}`);

    return {
        formattedDateTime,
        summertimeFlag,
        errorFlag
    };
}


export function parseMeterId(hexString) {
    // Implement the specific logic to convert M-Bus EN13757-3 ID to the correct format
    return hexString; // Placeholder
}

export function parseUint16(hexString) {
    return parseInt(hexString, 16);
}

export function reverse(payload) {
    // Teilt die Zeichenkette in 2-stellige Bytes auf, kehrt die Reihenfolge um und fügt sie wieder zusammen
    console.log(payload);
    const reversed = payload.match(/.{2}/g).reverse().join('');
    console.log(payload);
    return reversed;
}

export function reverseAndConvertToDecimal(payload) {
    // Reverse the hex string in byte pairs (2 characters)
    const reversedHex = payload.match(/../g).reverse().join("");
    
    // Log the reversed hex string for debugging purposes
    console.log("Reversed hex string:", reversedHex);

    // Parse the reversed hex string into a decimal value
    const decimalValue = parseInt(reversedHex, 16);
    
    // Log the decimal value before applying any scaling
    console.log("Parsed decimal value before scaling:", decimalValue);

    return reversedHex;
}



export function reverseString(hexString) {
    return hexString.match(/.{2}/g).reverse().join('');
}


// Switching for Standard Messages - Energy Field (Convert all to MWh 2 decimals)
export function switchingStandardEnergy(unit) {
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
export function switchingStandardVolume(unit) {
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

export function switchingStandardPower(unit) {
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

export function switchingStandardFlow(unit) {
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

export function switchingStandardForwardTemperature(unit) {
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

export function switchingStandardReturnTemperature(unit) {
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
export function switchingScheduledEnergy(unit) {
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
export function switchingScheduledAccumulatedEnergy(unit, value) {
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
