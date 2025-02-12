import { 
    parseBCD, 
    parseUint16, 
    parseDateTime, 
    reverse, 
    parseMeterId, 
    reverseString, 
    switchingStandardEnergy,
    switchingStandardVolume,
    switchingStandardPower,
    switchingStandardFlow,
    switchingStandardForwardTemperature,
    switchingStandardReturnTemperature,
    switchingScheduledEnergy,
    switchingScheduledAccumulatedEnergy, 
    reverseAndConvertToDecimal 
} from './utils.js';

export function parseStandardMessage(payload) {
    const result = {};
    result.messageType = "Standard Message";
    let currentIndex = 2; // Start after the 2-character message type

    // Energy Field (6-7 bytes, including prefix)
    let energyPrefix = payload.slice(currentIndex, currentIndex + 4);
    let energyValueRaw, energyValueTransformed, scale, check;
    

    if (energyPrefix === '0CFB') { // Handles 6-digit prefixes (3 bytes)
        energyPrefix = payload.slice(currentIndex, currentIndex + 6);
        currentIndex += 6; // Move past the 3-byte prefix (6 hex characters)
        energyValueRaw = reverse(payload.slice(currentIndex, currentIndex + 8)); // Reverse the slice from currentIndex
        [scale, check] = switchingStandardEnergy(payload.slice(currentIndex - 6, currentIndex)); // Using switching for standard energy
        energyValueTransformed = energyValueRaw / scale;
        result.energyPrefix = energyPrefix;
        result.energy = energyValueTransformed; 
        currentIndex += 8; // Move past the energy field
    } else { // Handles 4-digit prefixes (2 bytes)
        currentIndex += 4; // Move past the 2-byte prefix (4 hex characters)
        energyValueRaw = reverse(payload.slice(currentIndex, currentIndex + 8)); // Reverse the slice from currentIndex
        [scale, check] = switchingStandardEnergy(payload.slice(currentIndex - 4, currentIndex)); // Using switching for standard energy
        energyValueTransformed = energyValueRaw / scale;
        result.energyPrefix = energyPrefix;
        result.energy = energyValueTransformed; 
        currentIndex += 8; // Move past the energy field
    }

    // Volume Field (adjusted index based on the length of the energy field)
    const volumePrefix = payload.slice(currentIndex, currentIndex + 4);
    result.volumePrefix = volumePrefix;
    let volumeValueRaw, volumeValueTransformed;
    currentIndex += 4; // Move past the prefix
    volumeValueRaw = reverse(payload.slice(currentIndex, currentIndex + 8)); // Reverse the slice from currentIndex
    [scale, check] = switchingStandardVolume(volumePrefix); // Using switching for standard volume
    volumeValueTransformed = volumeValueRaw / scale;
    result.volume = volumeValueTransformed;
    currentIndex += 8; // Move past the volume field

    // Power Field
    const powerPrefix = payload.slice(currentIndex, currentIndex + 4);
    result.powerPrefix = powerPrefix;
    let powerValueRaw, powerValueTransformed;
    currentIndex += 4; // Move past the prefix
    powerValueRaw = reverse(payload.slice(currentIndex, currentIndex + 6)); // Reverse the slice from currentIndex
    [scale, check] = switchingStandardPower(powerPrefix); // Using switching for power field
    powerValueTransformed = powerValueRaw / scale;
    result.power = powerValueTransformed;
    currentIndex += 6; // Move past the power field

    // Flow Field
    const flowPrefix = payload.slice(currentIndex, currentIndex + 4);
    result.flowPrefix = flowPrefix;
    let flowValueRaw, flowValueTransformed;
    currentIndex += 4; // Move past the prefix
    flowValueRaw = reverse(payload.slice(currentIndex, currentIndex + 6)); // Reverse the slice from currentIndex
    [scale, check] = switchingStandardFlow(flowPrefix); // Using switching for flow field
    flowValueTransformed = flowValueRaw / scale;
    result.flow = flowValueTransformed;
    currentIndex += 6; // Move past the flow field

    // Forward Temperature Field
    const fwTempPrefix = payload.slice(currentIndex, currentIndex + 4);
    result.fwTempPrefix = fwTempPrefix;
    let fwTempValueRaw, fwTempValueTransformed;
    currentIndex += 4; // Move past the prefix
    fwTempValueRaw = reverse(payload.slice(currentIndex, currentIndex + 4)); // Reverse the slice from currentIndex
    [scale, check]= switchingStandardForwardTemperature(fwTempPrefix); // Using switching for temperature
    fwTempValueTransformed = fwTempValueRaw / scale;
    result.forwardTemperature = fwTempValueTransformed;
    currentIndex += 4; // Move past the forward temperature field

    // Return Temperature Field
    const rtTempPrefix = payload.slice(currentIndex, currentIndex + 4);
    result.rtTempPrefix = rtTempPrefix;
    let rtTempValueRaw, rtTempValueTransformed;
    currentIndex += 4; // Move past the prefix
    rtTempValueRaw = reverse(payload.slice(currentIndex, currentIndex + 4)); // Reverse the slice from currentIndex
    [scale, check] = switchingStandardReturnTemperature(rtTempPrefix); // Using switching for temperature
    rtTempValueTransformed = rtTempValueRaw / scale;
    result.returnTemperature = rtTempValueTransformed;
    currentIndex += 4; // Move past the return temperature field

       // Meter ID (6 bytes)
       const meterIDValuePrefix = payload.slice(currentIndex, currentIndex + 4);
       result.meterIDValuePrefix = meterIDValuePrefix;
       currentIndex += 4;
       const meterIdValue = reverse(payload.slice(currentIndex, currentIndex + 8)); // Reverse the slice from currentIndex as a string
       result.meterId = meterIdValue;
       currentIndex += 8; // Move past the meter ID field
   
       // Error Flags (4 bytes)
        const errorBitsValuePrefix = payload.slice(currentIndex, currentIndex + 6);
        result.errorBitsValuePrefix = errorBitsValuePrefix;
        currentIndex += 6;

        // Reverse the slice from currentIndex and convert to decimal
        const errorBitsValue = parseInt(reverse(payload.slice(currentIndex, currentIndex + 4)), 16);
        result.errorBitsValue = errorBitsValue; // Keep the original value for reference
        currentIndex += 4; // Move past the error flags
        console.log(errorBitsValue);

        // Aktive Fehler analysieren
        const parseErrorFlags = (errorBits) => {
            const errorDescriptions = {
                0: { identifier: "F0", message: "Error during flow metering (e.g. Air in measuring pipe)" },
                1: { identifier: "F1", message: "Interruption of flow temperature sensor" },
                2: { identifier: "F2", message: "Interruption of return temperature sensor" },
                3: { identifier: "F3", message: "Electronic for temperature evaluation defective" },
                4: { identifier: "F4", message: "Battery empty 1" },
                5: { identifier: "F5", message: "Short-circuit flow temperature sensor" },
                6: { identifier: "F6", message: "Short-circuit return temperature sensor" },
                7: { identifier: "F7", message: "Fault in the internal memory (CRC)" },
                8: { identifier: "F8", message: "Error F1, F2, F5 or F6 pending for longer than 8h." },
                9: { identifier: "F9", message: "Error in the electronics" },
                10: { identifier: "F0V", message: "Prewarning for soiling of the measurement tube" },
                11: { identifier: "F7V", message: "Correctable error in the internal memory EEPROM 2" },
            };

            const errors = [];
            Object.keys(errorDescriptions).forEach((bit) => {
                if (errorBits & (1 << bit)) {
                    // Nur die Identifier (z. B. F1, F2) hinzufügen
                    errors.push(errorDescriptions[bit].identifier);
                }
            });
            return errors;
        };

        // Fehlerbits analysieren und hinzufügen
        result.errors = parseErrorFlags(errorBitsValue);
        console.log(result.errors); // Erwartete Ausgabe: [F1, F2]

        return result;
    }
   
export function parseCompactMessage(payload) {
    const energy = parseBCD(payload.substr(2, 12));  // 6 bytes (12 hex characters)
    const meterId = payload.substr(14, 12);          // 6 bytes (12 hex characters)
    const errorFlags = parseUint16(payload.substr(26, 10));  // 5 bytes
    return {
        messageType: 'Compact',
        energy,
        meterId,
        errorFlags,
    };
}

export function parseJsonMessage(payload) {
    try {
        // Strip the first 2 characters (message type "02"), convert the rest from hex to a UTF-8 string
        const jsonHex = payload.substr(2); // Remove the '02' prefix
        const jsonString = Buffer.from(jsonHex, 'hex').toString('utf8');
        
        // Parse the JSON string
        const parsedJson = JSON.parse(jsonString);
        
        return {
            messageType: 'JSON',
            data: parsedJson
        };
    } catch (error) {
        throw new Error("Invalid JSON payload");
    }
}

export function parseScheduledClockMessage(payload) {
    const result = {};
    result.messageType = "Scheduled Clock Message";

    // Byte 0 (Message Type Identifier)
    const messageType = payload.substr(0, 2);
    if (messageType !== 'FA') {
        throw new Error("Invalid clock message type");
    }

    // Byte 1 (DIF)
    const dif = payload.substr(2, 2);
    result.valid = dif === '04';

    // Byte 2 (VIF)
    const vif = payload.substr(4, 2);
    if (vif !== '6D') {
        throw new Error("Invalid VIF for clock message");
    }

    // Bytes 3-6 (Date/Time in M-Bus format F)
    const dateTimeHex = payload.substr(6, 8); // 4 bytes for date/time
    result.dateTime = Buffer.from(dateTimeHex, 'hex').toString('hex');

    return result;
}

export function parseScheduledDataMessage(payload) {
    const result = {};
    result.messageType = 'Scheduled Data Message';  // Define the message type
    let currentIndex = 2;  // Start after the message type '03'

    // Energy Field (handle both 6-digit and 4-digit prefixes)
    const energyPrefix = payload.slice(2, 6);
    let energyValueRaw, energyValueTransformed, scale, check;

    // Determine if it's a 4 or 6-character prefix by checking the known prefixes
    if (energyPrefix.startsWith('0CFB')) { // Handle 6-character prefix
        energyValueRaw = reverse(payload.slice(6, 14)); // Reverse the slice from 6 to 14
        [scale, check] = switchingScheduledEnergy(payload.slice(2, 8));  // Use the correct switching for 6-character prefix
        energyValueTransformed = energyValueRaw / scale;
        result.energy_mwh = energyValueTransformed;
        currentIndex += 14; // Move index forward by 14 (6 for prefix + 8 for data)
    } else { // Handle 4-character prefix
        energyValueRaw =payload.slice(6,14);
        energyValueRaw = reverse(energyValueRaw); // Reverse the slice from 6 to 14
        let x = payload.slice(2,6);
        [scale, check] = switchingScheduledEnergy(x);  // Use the correct switching for 4-character prefix
        energyValueTransformed = energyValueRaw / scale;
        result.energy_mwh = energyValueTransformed;
        currentIndex += 12; // Move index forward by 12 (4 for prefix + 8 for data)
    }

    // Meter ID (6 bytes, including prefix)
    const meterIdPrefix = payload.substr(currentIndex, 4);
    let meterIdHex = payload.substr(currentIndex + 4, 8);  // 6 bytes for meter ID
    result.meter_id = reverseString(meterIdHex);
    currentIndex += 12;

    // Date/Time Field
    const dateTimePrefix = payload.substr(currentIndex, 4);
    let dateTimeHex = payload.substr(currentIndex + 4, 12);  // 6 bytes for date and time
    result.date_time = parseDateTime(dateTimeHex);  // Use the correct function to parse date and time
    currentIndex += 12;

    // Accumulated Energy (6 bytes, including prefix)
    const accumulatedEnergyPrefix = payload.substr(currentIndex, 4);
    let accumulatedEnergyHex = payload.substr(currentIndex + 4, 8);  // 4 bytes for accumulated energy
    let reversedAccumulatedEnergyHex = reverseString(accumulatedEnergyHex);
    const accumulatedEnergyFactor = switchingScheduledAccumulatedEnergy(accumulatedEnergyPrefix)[0];
    let parsedAccumulatedEnergy = parseBCD(reversedAccumulatedEnergyHex);
    result.accumulated_energy_mwh = parsedAccumulatedEnergy / accumulatedEnergyFactor;
    currentIndex += 12;

     // Error Flags (4 bytes)
     const errorBitsValuePrefix = payload.slice(currentIndex, currentIndex + 6);
     result.errorBitsValuePrefix = errorBitsValuePrefix;
     currentIndex += 6;

     // Reverse the slice from currentIndex and convert to decimal
     const errorBitsValue = parseInt(reverse(payload.slice(currentIndex, currentIndex + 4)), 16);
     result.errorBitsValue = errorBitsValue; // Keep the original value for reference
     currentIndex += 4; // Move past the error flags
     console.log(errorBitsValue);

     // Aktive Fehler analysieren
     const parseErrorFlags = (errorBits) => {
         const errorDescriptions = {
             0: { identifier: "F0", message: "Error during flow metering (e.g. Air in measuring pipe)" },
             1: { identifier: "F1", message: "Interruption of flow temperature sensor" },
             2: { identifier: "F2", message: "Interruption of return temperature sensor" },
             3: { identifier: "F3", message: "Electronic for temperature evaluation defective" },
             4: { identifier: "F4", message: "Battery empty 1" },
             5: { identifier: "F5", message: "Short-circuit flow temperature sensor" },
             6: { identifier: "F6", message: "Short-circuit return temperature sensor" },
             7: { identifier: "F7", message: "Fault in the internal memory (CRC)" },
             8: { identifier: "F8", message: "Error F1, F2, F5 or F6 pending for longer than 8h." },
             9: { identifier: "F9", message: "Error in the electronics" },
             10: { identifier: "F0V", message: "Prewarning for soiling of the measurement tube" },
             11: { identifier: "F7V", message: "Correctable error in the internal memory EEPROM 2" },
         };

         const errors = [];
         Object.keys(errorDescriptions).forEach((bit) => {
             if (errorBits & (1 << bit)) {
                 // Nur die Identifier (z. B. F1, F2) hinzufügen
                 errors.push(errorDescriptions[bit].identifier);
             }
         });
         return errors;
     };

     // Fehlerbits analysieren und hinzufügen
     result.errors = parseErrorFlags(errorBitsValue);
     console.log(result.errors); // Erwartete Ausgabe: [F1, F2]

     return result;
 }

export function parseScheduledExtendedMessage(payload) {
    const energy = parseBCD(payload.substr(2, 12));  // 6 bytes (12 hex characters)
    const volume = parseBCD(payload.substr(14, 12));  // 6 bytes (12 hex characters)
    const power = parseBCD(payload.substr(26, 12));   // 6 bytes (12 hex characters)
    const flow = parseBCD(payload.substr(38, 10));    // 5 bytes (10 hex characters)
    const fwTemp = parseBCD(payload.substr(48, 8));   // 4 bytes (8 hex characters)
    const rtTemp = parseBCD(payload.substr(56, 8));   // 4 bytes (8 hex characters)
    const meterId = payload.substr(64, 12);           // 6 bytes (12 hex characters)
    const dateTime = payload.substr(76, 12);          // 6 bytes (12 hex characters)
    const errorFlags = parseUint16(payload.substr(88, 10));  // 5 bytes (10 hex characters)

    return {
        messageType: 'Scheduled Extended',
        energy,
        volume,
        power,
        flow,
        forwardTemperature: fwTemp,
        returnTemperature: rtTemp,
        meterId,
        dateTime,
        errorFlags,
    };
}

export function parseScheduledExtendedPlusTelegram1(payload) {
    const energy = parseBCD(payload.substr(2, 12));  // 6 bytes (12 hex characters)
    const tariff1 = parseBCD(payload.substr(14, 16));  // 8 bytes (16 hex characters)
    const tariff2 = parseBCD(payload.substr(30, 16));  // 8 bytes (16 hex characters)
    const tariff3 = parseBCD(payload.substr(46, 16));  // 8 bytes (16 hex characters)
    const meterId = payload.substr(62, 12);  // 6 bytes (12 hex characters)
    const dateTime = payload.substr(74, 12);  // 6 bytes (12 hex characters)

    return {
        messageType: 'Scheduled Extended Plus Telegram1',
        energy,
        tariff1,
        tariff2,
        tariff3,
        meterId,
        dateTime,
    };
}

export function parseScheduledExtendedPlusTelegram2(payload) {
    const volume = parseBCD(payload.substr(2, 12));  // 6 bytes (12 hex characters)
    const power = parseBCD(payload.substr(14, 10));  // 5 bytes (10 hex characters)
    const flow = parseBCD(payload.substr(24, 10));  // 5 bytes (10 hex characters)
    const fwTemp = parseBCD(payload.substr(34, 8));  // 4 bytes (8 hex characters)
    const rtTemp = parseBCD(payload.substr(42, 8));  // 4 bytes (8 hex characters)
    const meterId = payload.substr(50, 12);  // 6 bytes (12 hex characters)
    const dateTime = payload.substr(62, 12);  // 6 bytes (12 hex characters)
    const errorFlags = parseUint16(payload.substr(74, 10));  // 5 bytes (10 hex characters)

    return {
        messageType: 'Scheduled Extended Plus Telegram2',
        volume,
        power,
        flow,
        forwardTemperature: fwTemp,
        returnTemperature: rtTemp,
        meterId,
        dateTime,
        errorFlags,
    };
}

export function parseCompactTariffMessage(payload) {
    const energy = parseBCD(payload.substr(2, 12));  // 6 bytes (12 hex characters)
    const tariff1 = parseBCD(payload.substr(14, 16));  // 8 bytes (16 hex characters)
    const tariff2 = parseBCD(payload.substr(30, 16));  // 8 bytes (16 hex characters)
    const tariff3 = parseBCD(payload.substr(46, 16));  // 8 bytes (16 hex characters)
    const meterId = payload.substr(62, 12);  // 6 bytes (12 hex characters)
    const errorFlags = parseUint16(payload.substr(74, 10));  // 5 bytes (10 hex characters)

    return {
        messageType: 'Compact Tariff',
        energy,
        tariff1,
        tariff2,
        tariff3,
        meterId,
        errorFlags,
    };
}

