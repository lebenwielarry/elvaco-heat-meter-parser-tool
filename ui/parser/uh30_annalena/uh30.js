/*module.exports = function (payload, meta) {
  const result = parserForUH30(payload, meta);
  return result;
};*/

function hex2bin(hex){
  return parseInt(hex, 16).toString(2).padStart(32, '0');
}


//Function to calculate the decimal value for the hex string
function hexToSignedInt(hex) {
  if (hex.length % 2 != 0) {
      hex = "0" + hex;
  }
  var num = parseInt(hex, 16);
  var maxVal = Math.pow(2, hex.length / 2 * 8);
  if (num > maxVal / 2 - 1) {
      num = num - maxVal
  }
  return num;
}


function scaleEnergy(energyPrefix, rawEnergyValue) {
    // Lookup map for prefix and corresponding factor and multiplier
    // Multiplier is taken from the manual
    // Factor is the scaling factor to convert value to mWh
  const energyScalingMap = {
    '0400': { factor: 1000000, multiplier: 1  },
    '0401': { factor: 1000000, multiplier: 1  },
    '0402': { factor: 1000000, multiplier: 1  },
    '0403': { factor: 1000000, multiplier: 1  },
    '0404': { factor: 1000000, multiplier: 10 },
    '0405': { factor: 1000000, multiplier: 100},
    '0406': { factor: 1000,    multiplier: 1  },
    '0407': { factor: 1000,    multiplier: 10 },
    '040E': { factor: 3600,    multiplier: 1  },
    '040F': { factor: 3600,    multiplier: 10 },
  };
  
  // Check if the energyPrefix exists in the map
  const scaling = energyScalingMap[energyPrefix];
  if (!scaling) {
    throw new Error('Unknown energy prefix: ' + energyPrefix);
  }
  
  // Apply multiplier and divide by factor
  const scaledEnergyValue = rawEnergyValue * scaling.multiplier;
  return scaledEnergyValue / scaling.factor;
}
  
function scaleVolume(volumePrefix, rawVolumeValue){
  // Lookup map for the scaling of the volume value
  const volumeScalingMap = {
    '0411': 0.00001,
    '0412': 0.0001,
    '0413': 0.001,
    '0414': 0.01,
    '0415': 0.1,
    '0416': 1,
    '0417': 10,
  }
  // Check if the volumePrefix exists in the map
  const scaling = volumeScalingMap[volumePrefix];
  if (!scaling) {
    throw new Error('Unknown volume prefix: ' + volumePrefix);
  }
  
  // Apply multiplier and divide by factor
  const scaledVolumeValue = rawVolumeValue * scaling;
  return scaledVolumeValue;
}

function scalePower(powerPrefix, rawPowerValue){
  // Lookup table for power prefix and corresponding scaling values
  const powerScalingMap = {
    '022A': {multiplier:   1, factor: 1000},
    '022B': {multiplier:   1, factor: 1000},
    '022C': {multiplier:  10, factor: 1000},
    '022D': {multiplier: 100, factor: 1000},
    '022E': {multiplier:   1, factor:    1},
    '022F': {multiplier:  10, factor:    1},
  };

  // Check if powerPrefix exists in the map
  const scaling = powerScalingMap[powerPrefix];
  if (!scaling){
    throw new Error('Unknown power prefix: ' + powerPrefix);
  }

  // Apply multiplier and divide by factor
  const scaledPowerValue = rawPowerValue * scaling.multiplier;
  return scaledPowerValue / scaling.factor;  
}

function scaleFlow(flowPrefix, rawFlowValue){
  const flowScalingMap = {
    '023B': 0.001,
    '023C': 0.01,
    '023D': 0.1,
    '023E': 1,
    '023F': 10,
  };

  // Check if flowPrefix exists in the map
  const scaling = flowScalingMap[flowPrefix];
  if (!scaling) {
    throw new Error('Unknown flow prefix: ' + flowPrefix);
  }
  
  // Apply multiplier
  const scaledFlowValue  =rawFlowValue * scaling;
  return scaledFlowValue
}

function scaleFwTemp(fw_tempPrefix, rawFw_tempValue){
  const fw_tempScalingMap = {
    '0258': 0.001,
    '0259': 0.01,
    '025A': 0.1,
    '025B': 1,
  };

  // Check if fw_tempPrefix exists in the map
  const scaling = fw_tempScalingMap[fw_tempPrefix];
  if (!scaling) {
    throw new Error('Unknown fw_temp prefix: ' + fw_tempPrefix);
  }
  
  // Apply multiplier
  const scaledFw_tempValue = rawFw_tempValue * scaling;
  return scaledFw_tempValue;
}

function scaleRtTemp(rt_tempPrefix, rawRt_tempValue){
  const rt_tempScalingMap = {
    '025C': 0.001,
    '025D': 0.01,
    '025E': 0.1,
    '025F': 1,
  };

  // Check if fw_tempPrefix exists in the map
  const scaling = rt_tempScalingMap[rt_tempPrefix];
  if (!scaling) {
    throw new Error('Unknown rt_temp prefix: ' + rt_tempPrefix);
  }
  
  // Apply multiplier 
  const scaledRt_tempValue = rawRt_tempValue * scaling;
  return scaledRt_tempValue;
}

function scaleCoolingEnergy(coolingEnergyPrefix, rawCoolingEnergyValue){
  const coolingEnergyScalingMap = {
    '0480FF02': {factor: 1000000, multiplier: 1},
    '0481FF02': {factor: 1000000, multiplier: 1},
    '0482FF02': {factor: 1000000, multiplier: 1},
    '0483FF02': {factor: 1000000, multiplier: 1},
    '0484FF02': {factor: 1000000, multiplier: 10},
    '0485FF02': {factor: 1000000, multiplier: 100},
    '0486FF02': {factor: 1000, multiplier: 1},
    '0487FF02': {factor: 1000, multiplier: 10},
    '048EFF02': {factor: 3600, multiplier: 1},
    '048FFF02': {factor: 3600, multiplier: 10},
  };
  // Check if the coolingEnergyPrefix exists in the map
  const scaling = coolingEnergyScalingMap[coolingEnergyPrefix];
  if (!scaling) {
    throw new Error('Unknown cooling energy prefix: ' + coolingEnergyPrefix);
  }
  
  // Apply multiplier and divide by factor
  const scaledCoolingEnergyValue = rawCoolingEnergyValue * scaling.multiplier;
  return scaledCoolingEnergyValue / scaling.factor;
}

function scaleEnergyInWrongMountingPosition(energyInWrongMountingPositionPrefix, rawEnergyInWrongMountingPositionValue){
  const energyInWrongMountingPositionScalingMap = {
    '0480FF03': {factor: 1000000, multiplier: 1},
    '0481FF03': {factor: 1000000, multiplier: 1},
    '0482FF03': {factor: 1000000, multiplier: 1},
    '0483FF03': {factor: 1000000, multiplier: 1},
    '0484FF03': {factor: 1000000, multiplier: 10},
    '0485FF03': {factor: 1000000, multiplier: 10},
    '0486FF03': {factor: 1000,    multiplier: 1},
    '0487FF03': {factor: 1000,    multiplier: 10},
    '048EFF03': {factor: 3600, multiplier: 1},
    '048FFF03': {factor: 3600, multiplier: 10},
    '04FB8DFF03': {factor: 0.001162, multiplier: 1},
    '04FB8EFF03': {factor: 0.001162, multiplier: 10},
    '04FB8FFF03': {factor: 0.001162, multiplier: 100},
  };

  const scaling = energyInWrongMountingPositionScalingMap[energyInWrongMountingPositionPrefix];
  if (!scaling){
    throw new Error ('Unknown energy in wrong mounting position prefix: ' + energyInWrongMountingPositionPrefix);
  }

  // Apply multiplier and divide by factor
  const scaledEnergyInWrongMountingPositionValue = rawEnergyInWrongMountingPositionValue * scaling.multiplier;
  return scaledEnergyInWrongMountingPositionValue / scaling.factor;
}

function scalePreviousMonthEnergy(previousMonthEnergyPrefix, rawPreviousMonthEnergyValue){
  const previousMonthEnergyScalingMap = {
    'B40100': {factor: 1000000, multiplier: 1},
    'B40101': {factor: 1000000, multiplier: 1},
    'B40102': {factor: 1000000, multiplier: 1},
    'B40103': {factor: 1000000, multiplier: 1},
    'B40104': {factor: 1000000, multiplier: 10},
    'B40105': {factor: 1000000, multiplier: 100},
    'B40106': {factor: 1000, multiplier: 1},
    'B40107': {factor: 1000, multiplier: 10},
    'B4010E': {factor: 3600, multiplier: 1},
    'B4010F': {factor: 3600, multiplier: 10},
  };

  const scaling = previousMonthEnergyScalingMap[previousMonthEnergyPrefix];
  if (!scaling){
    throw new Error ('Unknown previous month energy prefix: ' + previousMonthEnergyPrefix);
  }

  // Apply multiplier and divide by factor
  const scaledPreviousMonthEnergyValue = rawPreviousMonthEnergyValue * scaling.multiplier;
  return scaledPreviousMonthEnergyValue / scaling.factor;
}

function scaleMaxFwTemp(max_fwTempPrefix, max_fwTempRawDecimal){
  const maxFwTempScalingMap = {
    '1258': 0.001,
    '1259': 0.01,
    '125A': 0.1,
    '125B': 1
  };

  const scaling = maxFwTempScalingMap[max_fwTempPrefix];
  if(!scaling){
    throw new Error('Unknown max fw temp prefix: ' + max_fwTempPrefix);
  }

  // Multiply by factor
  const scaledMaxFwTempValue = max_fwTempRawDecimal * scaling;
  return scaledMaxFwTempValue;
}


function scaleMaxRtTemp(max_RtTempPrefix, max_RtTempRawDecimal){
  const maxRtTempScalingMap = {
    '125C': 0.001,
    '125D': 0.01,
    '125E': 0.1,
    '125F': 1
  };

  const scaling = maxRtTempScalingMap[max_RtTempPrefix];
  if(!scaling){
    throw new Error('Unknown max rt temp prefix: ' + max_RtTempPrefix);
  }

  // Multiply by factor
  const scaledMaxRtTempValue = max_RtTempRawDecimal * scaling;
  return scaledMaxRtTempValue;
}

function analyseError(errorBits){
  const errorAnalysisMap = {
    0: { name: "ZZ.7", errorMessage: "Time Error DSMR" },
    1: { name: "ZZ.6", errorMessage: "Leakage warning (water meters)" },
    2: { name: "ZZ.5", errorMessage: "-" },
    3: { name: "ZZ.4", errorMessage: "-" },
    4: { name: "ZZ.3", errorMessage: "-" },
    5: { name: "ZZ.2", errorMessage: "-" },
    6: { name: "ZZ.1", errorMessage: "-" },
    7: { name: "ZZ.0", errorMessage: "-" },
    8: { name: "A.3", errorMessage: "Installation in return/forward flow position" },
    9: { name: "A.2", errorMessage: "-" },
    10: { name: "A.1", errorMessage: "Incorrect flow direction (Flow-Negative)" },
    11: { name: "A.0", errorMessage: "Negative temperature difference (Difference-Negative)" },
    12: { name: "B.3", errorMessage: "Installation error volume measurement part" },
    13: { name: "B.2", errorMessage: "Installation error sensor" },
    14: { name: "B.1", errorMessage: "F4 pre-warning" },
    15: { name: "B.0", errorMessage: "F0 pre-warning" },
    16: { name: "C.3", errorMessage: "-" },
    17: { name: "C.2", errorMessage: "-" },
    18: { name: "C.1", errorMessage: "-" },
    19: { name: "C.0", errorMessage: "Installation location change restriction" },
    20: { name: "D.3", errorMessage: "Amount of energy in case of incorrect installation" },
    21: { name: "D.2", errorMessage: "Reserved" },
    22: { name: "D.1", errorMessage: "Fault in the electronics (F9)" },
    23: { name: "D.0", errorMessage: "Serious error, no further measurements (F8)" },
    24: { name: "E.3", errorMessage: "Fault in internal memory (EEPROM) (F7)" },
    25: { name: "E.2", errorMessage: "Short-circuit return flow temp sensor (F6)" },
    26: { name: "E.1", errorMessage: "Short-circuit forward flow temp sensor (F5)" },
    27: { name: "E.0", errorMessage: "Power supply problem, battery empty (F4)" },
    28: { name: "F.3", errorMessage: "Electronics for temperature evaluation defective (F3)" },
    29: { name: "F.2", errorMessage: "Interruption in the cold side temp sensor (F2)" },
    30: { name: "F.1", errorMessage: "Interruption in the hot side temp sensor (F1)" },
    31: { name: "F.0", errorMessage: "No flow can be measured (F0)" }
  };
  
  let activeErrors = [];
  let binaryString = hex2bin(errorBits);

  for (let i = 0; i < 32; i++) {
    if (binaryString[31 - i] === '1') { 
      activeErrors.push(errorAnalysisMap[i].name);
    }
  }
  return activeErrors.length > 0 ? activeErrors : [];
}

function checkMeterCommunicationError(difPrefix){

  const meterCommunicationErrorBits = ['32', '34', '35', '3C', 'B4'];
 
  if (meterCommunicationErrorBits.includes(difPrefix)){
    throw new Error ("Meter Communication Error");
  }
}

function parseStandardMesssage(payload) {
  let result = {};

  //DIB 0: Message Format Identifier
  const payloadStyle = "Standard";
  result.payload_style = payloadStyle;

  //DIB 1: Energy
  const energyPrefix = payload.slice(2, 6);
  checkMeterCommunicationError(energyPrefix.slice(0,2));

  let energyValueRaw;
  let energyValueTransformed;
  let energyValueRawReversed;
  let energyValueRawDecimal;

  energyValueRaw = payload.slice(6, 14);
  energyValueRawReversed = energyValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  energyValueRawDecimal = hexToSignedInt(energyValueRawReversed);
  energyValueTransformed = scaleEnergy(energyPrefix, energyValueRawDecimal);
  
  result.energy_mwh = energyValueTransformed;
  

  //DIB 2: Volume
  const volumePrefix = payload.slice(14, 18);
  checkMeterCommunicationError(volumePrefix.slice(0, 2));
  
  let volumeValueRaw;
  let volumeValueReversed;
  let volumeValueDecimal;
  let volumeValueTransformed;

  volumeValueRaw = payload.slice(18, 26);
  volumeValueReversed = volumeValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  volumeValueDecimal = hexToSignedInt(volumeValueReversed);
  volumeValueTransformed = scaleVolume(volumePrefix, volumeValueDecimal);
  
  result.volume_m3 = volumeValueTransformed;
  

  //DIB 3 Power
  const powerPrefix = payload.slice(26, 30);
  checkMeterCommunicationError(powerPrefix.slice(0,2));

  let powerValueRaw;
  let powerValueRawReversed;
  let powerValueRawDecimal;
  let powerValueTransformed;

  powerValueRaw = payload.slice(30, 34);
  powerValueRawReversed = powerValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  powerValueRawDecimal = hexToSignedInt(powerValueRawReversed);
  powerValueTransformed = scalePower(powerPrefix, powerValueRawDecimal);
  
  result.power_kw = powerValueTransformed;


  //DIB 4 Flow
  const flowPrefix = payload.slice(34, 38);
  checkMeterCommunicationError(flowPrefix.slice(0,2));

  let flowValueRaw;
  let flowValueRawReversed;
  let flowValueRawDecimal;
  let flowValueTransformed;

  flowValueRaw = payload.slice(38, 42);
  flowValueRawReversed = flowValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  flowValueRawDecimal = hexToSignedInt(flowValueRawReversed);
  flowValueTransformed = scaleFlow(flowPrefix, flowValueRawDecimal);
 
  result.flow_m3h = flowValueTransformed;
  

  // DIB 5 Fw temp
  const fw_tempPrefix = payload.slice(42, 46);
  checkMeterCommunicationError(fw_tempPrefix.slice(0,2));

  let fw_tempRaw;
  let fw_tempRawReversed;
  let fw_tempRawDecimal;
  let fw_tempTransformed;

  fw_tempRaw = payload.slice(46, 50);
  fw_tempRawReversed = fw_tempRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  fw_tempRawDecimal = hexToSignedInt(fw_tempRawReversed);
  fw_tempTransformed = scaleFwTemp(fw_tempPrefix, fw_tempRawDecimal);
  
  result.fw_temp_c = fw_tempTransformed;
  

  // DIB 6 Rt temp
  const rt_tempPrefix = payload.slice(50, 54);
  checkMeterCommunicationError(rt_tempPrefix.slice(0,2));

  let rt_tempRaw;
  let rt_tempRawReversed;
  let rt_tempRawDecimal;
  let rt_tempTransformed;

  rt_tempRaw = payload.slice(54, 58);
  rt_tempRawReversed = rt_tempRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  rt_tempRawDecimal = hexToSignedInt(rt_tempRawReversed);
  rt_tempTransformed = scaleRtTemp(rt_tempPrefix, rt_tempRawDecimal);
  
  result.rt_temp_c = rt_tempTransformed;
  
  //DIB 7 Meter ID
  const meterIDPrefix = payload.slice(58, 62);
  checkMeterCommunicationError(meterIDPrefix.slice(0,2));

  let meterID = payload.slice(62, 70);
  let meterIDReversed = meterID.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  
  result.meter_id = meterIDReversed;


  //DIB 8 Error bits
  const errorBitsPrefix = payload.slice(70, 76);
  checkMeterCommunicationError(errorBitsPrefix.slice(0,2));

  let errorBits = payload.slice(76, 84);
  let errorBitsReversed = errorBits.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let analyzedError = analyseError(errorBitsReversed);

  result.errors = errorBitsReversed;
  result.analyzedError = analyzedError;

  return result;
}


function parseCompactMessage(payload) {
  let result = {};

  //DIB 0 Message Format Identifier
  const payloadStyle = "Compact";
  result.payload_style = payloadStyle;

  //DIB 1 Energy
  const energyPrefix = payload.slice(2, 6);
  checkMeterCommunicationError(energyPrefix.slice(0,2));

  let energyValueRaw;
  let energyValueRawReversed;
  let energyValueRawDecimal;
  let energyValueTransformed;

  energyValueRaw = payload.slice(6, 14);
  energyValueRawReversed = energyValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  energyValueRawDecimal = hexToSignedInt(energyValueRawReversed);
  energyValueTransformed = scaleEnergy(energyPrefix, energyValueRawDecimal);
  
  result.energy_mwh = energyValueTransformed;


  //DIB 2 Meter ID
  const meterIDPrefix = payload.slice(14, 18);
  checkMeterCommunicationError(meterIDPrefix.slice(0,2));

  let meterID = payload.slice(18, 26);
  let meterIDReversed = meterID.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  
  result.meter_id = meterIDReversed;


  //DIB 3 Error bits
  const errorBitsPrefix = payload.slice(26, 32);
  checkMeterCommunicationError(errorBitsPrefix.slice(0,2));

  let errorBits = payload.slice(32, 40);
  let errorBitsReversed = errorBits.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let analyzedError = analyseError(errorBitsReversed);

  result.errors = errorBitsReversed;
  result.analyzedError = analyzedError;

  return result;

}

function parseJsonMessage(payload) {
  let result = {};

  const payloadStyle = "JSON";
  result.payload_style = payloadStyle;

  let messageHex = payload.slice(2);
  let messageString = messageHex.toString();
  let JsonMessage = JSON.parse(messageString);

  result.data = JsonMessage;

  return result;
}

function parseClockMessage(payload) {
  let result = {};

  // DIB 0: Message Format Identifier
  const messageFormatIdentifier = "Clock message";
  const messageFormat = payload.slice(0, 2);
  
  result.payload_style = messageFormatIdentifier;


  // DIB 1: Date / Time
  const date_timePrefix = payload.slice(2, 6);
  
  if (date_timePrefix == "046D") { // Valid date/time message
    const time = payload.slice(7,13);
  
  
  } else if(date_timePrefix == "346D"){

  }else {
    throw new Error("Invalid date/time message");
  }

  return result;
}

function parseScheduledDailyRedundantMessage(payload) {
  let result = {};

  //DIB 0: Message Format
  const payloadStyle = "Daily redundant";
  result.payload_style = payloadStyle;

  //DIB 1: Energy
  const energyPrefix = payload.slice(2, 6);
  checkMeterCommunicationError(energyPrefix.slice(0,2));

  let energyValueRaw;
  let energyValueTransformed;
  let energyValueRawReversed;
  let energyValueRawDecimal;

  energyValueRaw = payload.slice(6, 14);
  energyValueRawReversed = energyValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  energyValueRawDecimal = hexToSignedInt(energyValueRawReversed);
  energyValueTransformed = scaleEnergy(energyPrefix, energyValueRawDecimal);
  
  result.energy_mwh = energyValueTransformed;
  

  //DIB 2: Volume
  let volumePrefix = payload.slice(14, 18);
  checkMeterCommunicationError(volumePrefix.slice(0,2));
  
  let volumeValueRaw;
  let volumeValueReversed;
  let volumeValueDecimal;
  let volumeValueTransformed;

  volumeValueRaw = payload.slice(18, 26);
  volumeValueReversed = volumeValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  volumeValueDecimal = hexToSignedInt(volumeValueReversed);
  volumeValueTransformed = scaleVolume(volumePrefix, volumeValueDecimal);
  
  result.volume_m3 = volumeValueTransformed;
  

  //DIB 3: Meter ID
  const meterIDPrefix = payload.slice(26, 30);
  checkMeterCommunicationError(meterIDPrefix.slice(0,2));

  let meterID = payload.slice(30, 38);
  let meterIDReversed = meterID.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  
  result.meter_id = meterIDReversed;

  //DIB 4: Error Bits
  const errorBitsPrefix = payload.slice(30, 36);
  checkMeterCommunicationError(errorBitsPrefix.slice(0,2));

  let errorBits = payload.slice(36, 44);
  let errorBitsReversed = errorBits.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let analyzedError = analyseError(errorBitsReversed);

  result.errors = errorBitsReversed;
  result.analyzedError = analyzedError;

  //DIB 5: Meter Date/Time
  const meterDateTimePrefix = payload.slice(44, 48);

  let meterDateTime = payload.slice(48, 56);
  let meterDateTimeReversed = meterDateTime.match(/[a-fA-F0-9]{2}/g).reverse().join('');

  const minute = hexToSignedInt(meterDateTimeReversed.slice(0, 6));
  const reservedForFutureUse = hexToSignedInt(meterDateTimeReversed.slice(6, 7));
  const errorFlag = hexToSignedInt(meterDateTimeReversed.slice(7, 8));
  const hour = hexToSignedInt(meterDateTimeReversed.slice(8, 13));
  const summertimeFlag = hexToSignedInt(meterDateTimeReversed.slice(15, 16));
  const day = hexToSignedInt(meterDateTimeReversed.slice(16, 21));
  const yearLow = hexToSignedInt(meterDateTimeReversed.slice(21, 24));
  const month = hexToSignedInt(meterDateTimeReversed.slice(24, 28));
  const yearHigh = hexToSignedInt(meterDateTimeReversed.slice(28, 32));
  //Combine Year? Page 16 in Manual

  // DIB 6: Accumulated Energy at 24:00
  const energyPrefix24 = payload.slice(2, 6);
  checkMeterCommunicationError(energyPrefix24.slice(0,2));

  let energyValueRaw24;
  let energyValueTransformed24;
  let energyValueRawReversed24;
  let energyValueRawDecimal24;

  energyValueRaw24 = payload.slice(6, 14);
  energyValueRawReversed24 = energyValueRaw24.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  energyValueRawDecimal24 = hexToSignedInt(energyValueRawReversed24);
  energyValueTransformed24 = scaleEnergy(energyPrefix24, energyValueRawDecimal24);
  
  result.energy_mwh_24 = energyValueTransformed24;
  

  return result;
}


function parseScheduledExtendedMessage(payload) {
  let result = {};

  // DIB 0: Message Format
  const messageFormatIdentifier = "Scheduled-Extended";
  result.payload_style = messageFormatIdentifier;

  // DIB 1: Energy
  const energyPrefix = payload.slice(2, 6);
  checkMeterCommunicationError(energyPrefix.slice(0,2));

  let energyValueRaw;
  let energyValueTransformed;
  let energyValueRawReversed;
  let energyValueRawDecimal;

  energyValueRaw = payload.slice(6, 14);
  energyValueRawReversed = energyValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  energyValueRawDecimal = hexToSignedInt(energyValueRawReversed);
  energyValueTransformed = scaleEnergy(energyPrefix, energyValueRawDecimal);
  
  result.energy_mwh = energyValueTransformed;
  

  // DIB 2: Volume
  let volumePrefix = payload.slice(14, 18);
  checkMeterCommunicationError(volumePrefix.slice(0,2));

  let volumeValueRaw;
  let volumeValueReversed;
  let volumeValueDecimal;
  let volumeValueTransformed;

  volumeValueRaw = payload.slice(18, 26);
  volumeValueReversed = volumeValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  volumeValueDecimal = hexToSignedInt(volumeValueReversed);

  volumeValueTransformed = scaleVolume(volumePrefix, volumeValueDecimal);
  result.volume_m3 = volumeValueTransformed;
  

  // DIB 3: Power / Flow / Fw temp / Rt temp
  const toalValue = payload.slice(26, 50);
  const DIFVIFCodes = totalValue.slice(0, 6);
    if(DIFVIFCodes != '07FFA0'){
      throw new Error ("Unknown DIFVIF codes");
    }
  const powerFlowScaling = totalValue.slice(6, 7);
  const powerFlowScalingBinary = hexToSignedInt(powerFlowScaling).toString(2);
  // const n = 
  // const m ??????
  const fwTemp = totalValue.slice(3, 5);

  // DIB 4: Meter ID
    const totalMeterID = payload.slice(50, 73);
}

function parseCombinedHeatCoolingMessage(payload) {
  let result = {};

  //DIB 0: Message Format
  const payloadStyle = "Combined Heat/Cooling";
  result.payload_style = payloadStyle;

  //DIB 1: Heat Energy
  const heatEnergyPrefix = payload.slice(2, 6);
  checkMeterCommunicationError(heatEnergyPrefix.slice(0,2));

  let heatEnergyRaw;
  let heatEnergyRawReversed;
  let heatEnergyRawDecimal;
  let heatEnergyTransformed;

  heatEnergyRaw = payload.slice(6, 14);
  heatEnergyRawReversed = heatEnergyRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  heatEnergyRawDecimal = hexToSignedInt(heatEnergyRawReversed);
  heatEnergyTransformed = scaleEnergy(heatEnergyPrefix, heatEnergyRawDecimal);
  
  result.heat_energy_wmh = heatEnergyTransformed;

  //DIB 2 Cooling Energy
  const coolingEnergyPrefix = payload.slice(14, 22);
  checkMeterCommunicationError(coolingEnergyPrefix.slice(0,2));

  let coolingEnergyRaw;
  let coolingEnergyRawReversed;
  let coolingEnergyRawDecimal;
  let coolingEnergyTransformed;

  coolingEnergyRaw = payload.slice(22, 30);
  coolingEnergyRawReversed = coolingEnergyRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  coolingEnergyRawDecimal = hexToSignedInt(coolingEnergyRawReversed);
  coolingEnergyTransformed = scaleCoolingEnergy(coolingEnergyPrefix, coolingEnergyRawDecimal);
  
  result.cooling_energy_mwh = coolingEnergyTransformed;


  // DIB 3: Volume
  const volumePrefix = payload.slice(30, 34);
  checkMeterCommunicationError(volumePrefix.slice(0,2));

  let volumeValueRaw;
  let volumeValueReversed;
  let volumeValueDecimal;
  let volumeValueTransformed;

  volumeValueRaw = payload.slice(34, 42);
  volumeValueReversed = volumeValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  volumeValueDecimal = hexToSignedInt(volumeValueReversed);
  volumeValueTransformed = scaleVolume(volumePrefix, volumeValueDecimal);
  
  result.volume_m3 = volumeValueTransformed;
  

  // DIB 4: Fw temp
  const fw_tempPrefix = payload.slice(42, 46);
  checkMeterCommunicationError(fw_tempPrefix.slice(0,2));

  let fw_tempRaw;
  let fw_tempRawReversed;
  let fw_tempRawDecimal;
  let fw_tempTransformed;

  fw_tempRaw = payload.slice(46, 50);
  fw_tempRawReversed = fw_tempRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  fw_tempRawDecimal = hexToSignedInt(fw_tempRawReversed);
  fw_tempTransformed = scaleFwTemp(fw_tempPrefix, fw_tempRawDecimal);

  result.fw_temp_c = fw_tempTransformed;
  

  // DIB 5: Rt temp
  const rt_tempPrefix = payload.slice(50, 54);
  checkMeterCommunicationError(rt_tempPrefix.slice(0,2));

  let rt_tempRaw;
  let rt_tempRawReversed;
  let rt_tempRawDecimal;
  let rt_tempTransformed;

  rt_tempRaw = payload.slice(54, 58);
  rt_tempRawReversed = rt_tempRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  rt_tempRawDecimal = hexToSignedInt(rt_tempRawReversed);
  rt_tempTransformed = scaleRtTemp(rt_tempPrefix, rt_tempRawDecimal);
  
  result.rt_temp_c = rt_tempTransformed;

  //DIB 6: Meter ID
  const meter_idPrefix = payload.slice(58, 62);
  checkMeterCommunicationError(meter_idPrefix.slice(0,2));

  let meterID = payload.slice(62, 70);
  let meterIDReversed = meterID.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  
  result.meter_id = meterIDReversed;


  //DIB 7: Error bits
  const errorBitsPrefix = payload.slice(70, 76);
  checkMeterCommunicationError(errorBitsPrefix.slice(0,2));

  let errorBits = payload.slice(76, 84);
  let errorBitsReversed = errorBits.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let analyzedError = analyseError(errorBitsReversed);

  result.errors = errorBitsReversed;
  result.analyzedError = analyzedError;

  return result;
}

function parseSimpleBillingMessage(payload) {
  let result = {};

  //DIB 0: Message Format Identifier
  const payloadStyle = "Simple Billing";
  result.payload_style = payloadStyle;

  //DIB 1: Energy
  const energyPrefix = payload.slice(2, 6);
  checkMeterCommunicationError(energyPrefix.slice(0,2));

  let energyValueRaw;
  let energyValueTransformed;
  let energyValueRawReversed;
  let energyValueRawDecimal;

  energyValueRaw = payload.slice(6, 14);
  energyValueRawReversed = energyValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  energyValueRawDecimal = hexToSignedInt(energyValueRawReversed);
  energyValueTransformed = scaleEnergy(energyPrefix, energyValueRawDecimal);
  
  result.energy_mwh = energyValueTransformed;


  //DIB 2: Meter ID
  const meterIDPrefix = payload.slice(14, 18);
  checkMeterCommunicationError(meterIDPrefix.slice(0,2));

  let meterID = payload.slice(18, 26);
  let meterIDReversed = meterID.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  result.meter_id = meterIDReversed;


  //DIB 3: Error Bits
  const errorBitsPrefix = payload.slice(26, 32);
  checkMeterCommunicationError(errorBitsPrefix.slice(0,2));

  let errorbits = payload.slice(32, 40);
  let errorBitsReversed = errorbits.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let analyzedError = analyseError(errorBitsReversed);

  result.errors = errorBitsReversed;
  result.analyzedError = analyzedError;


  //DIB 4: Energy in wrong mounting position
  const energyInWrongMountingPositionPrefix = payload.slice(40, 48);
  checkMeterCommunicationError(energyInWrongMountingPositionPrefix.slice(0,2));

  let energyInWrongMountingPositionRaw = payload.slice(48, 56);
  let energyInWrongMountingPositionReversed = energyInWrongMountingPositionRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let energyInWrongMountingPositionDecimal = hexToSignedInt(energyInWrongMountingPositionReversed);
  let energyInWrongMountingPositionTransformed = scaleEnergyInWrongMountingPosition(energyInWrongMountingPositionPrefix, energyInWrongMountingPositionDecimal);
  
  result.energy_wrong_mounting_position_mwh = energyInWrongMountingPositionTransformed;


  //DIB 5: Previous Month Energy
  const previousMonthEnergyPrefix = payload.slice(56, 62);
  //checkMeterCommunicationError(previousMonthEnergyPrefix.slice(0,2));
  //no meter communication error check here as it would throw an error, but DIF B4 is valid here

  let previousMonthEnergyRaw = payload.slice(62, 70);
  let previousMonthEnergyRawReversed = previousMonthEnergyRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let previousMonthEnergyRawDecimal = hexToSignedInt(previousMonthEnergyRawReversed);
  let previousMonthEnergyTransformed = scalePreviousMonthEnergy(previousMonthEnergyPrefix, previousMonthEnergyRawDecimal);
  
  result.previous_month_energy_mwh = previousMonthEnergyTransformed;

  return result;
}

function parsePlausibilityCheckMessage(payload) {
  let result = {};

  // DIB 0: Message Format Identifier
  const payloadStyle = "Plausibility Check";
  result.payload_style = payloadStyle;

  // DIB 1: Energy
  const energyPrefix = payload.slice(2, 6);
  checkMeterCommunicationError(energyPrefix.slice(0,2));

  let energyValueRaw;
  let energyValueRawReversed;
  let energyValueRawDecimal;
  let energyValueTransformed;

  energyValueRaw = payload.slice(6, 14);
  energyValueRawReversed = energyValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  energyValueRawDecimal = hexToSignedInt(energyValueRawReversed);
  energyValueTransformed = scaleEnergy(energyPrefix, energyValueRawDecimal);
  
  result.energy_mwh = energyValueTransformed;
  

  // DIB 2: Meter ID
  const meterIDPrefix = payload.slice(14, 18);
  checkMeterCommunicationError(meterIDPrefix.slice(0,2));

  let meterID = payload.slice(18, 26);
  let meterIDReversed = meterID.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  result.meter_id = meterIDReversed;

  // DIB 3: Error Bits
  const errorBitsPrefix = payload.slice(26, 30);
  checkMeterCommunicationError(errorBitsPrefix.slice(0,2));

  let errorBits = payload.slice(30, 38);
  let errorBitsReversed = errorBits.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let analyzedError = analyseError(errorBitsReversed);

  result.errors = errorBitsReversed;
  result.analyzedError = analyzedError;

  // DIB 4: Energy when mounted in the wrong position
  const energyInWrongMountingPositionPrefix = payload.slice(38, 46);
  checkMeterCommunicationError(energyInWrongMountingPositionPrefix.slice(0,2));

  let energyInWrongMountingPositionRaw = payload.slice(46, 54);
  let energyInWrongMountingPositionReversed = energyInWrongMountingPositionRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let energyInWrongMountingPositionDecimal = hexToSignedInt(energyInWrongMountingPositionReversed);
  let energyInWrongMountingPositionTransformed = scaleEnergyInWrongMountingPosition(energyInWrongMountingPositionPrefix, energyInWrongMountingPositionDecimal);
  
  result.energy_wrong_mounting_position_mwh = energyInWrongMountingPositionTransformed;


  // DIB 5: Missing Time
  const missingTimePrefix = payload.slice(54, 58);
  //checkMeterCommunicationError(missingTimePrefix.slice(0,2));
  //No meter communication error check here, as the prefix is marked as mce, but valid DIF here (34) according to manual

  let missingTimeRaw = payload.slice(58, 66);
  let missingTimeRawReversed = missingTimeRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let missingTimeRawDecimal = hexToSignedInt(missingTimeRawReversed);

  switch (missingTimePrefix) {
    case '3420':
      result.missing_time_s = missingTimeRawDecimal;
      break;
    case '3421':
      result.missing_time_min = missingTimeRawDecimal;
      break;
    case '3422':
      result.missing_time_h = missingTimeRawDecimal;
      break;
    case '3423':
      result.missing_time_days = missingTimeRawDecimal;
      break;
  }

  // DIB 6: Max Fw temp
  const max_fwTempPrefix = payload.slice(66, 70);
  checkMeterCommunicationError(max_fwTempPrefix.slice(0,2));

  let max_fwTempRaw = payload.slice(70, 74);
  let max_fwTempRawReversed = max_fwTempRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let max_fwTempRawDecimal = hexToSignedInt(max_fwTempRawReversed);
  let max_fwTempTransformed = scaleMaxFwTemp(max_fwTempPrefix, max_fwTempRawDecimal);
  
  result.max_fw_temp_c = max_fwTempTransformed;

  // DIB 7: Max Rt temp
  const max_rtTempPrefix = payload.slice(74, 78);
  checkMeterCommunicationError(max_rtTempPrefix.slice(0,2));

  let max_rtTempRaw = payload.slice(78, 82);
  let max_rtTempRawReversed = max_rtTempRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let max_rtTempRawDecimal = hexToSignedInt(max_rtTempRawReversed);
  let max_rtTempTransformed = scaleMaxRtTemp(max_rtTempPrefix, max_rtTempRawDecimal);
  
  result.max_rt_temp_c = max_rtTempTransformed;

  return result;
}

function parseMonitoringMessage(payload) {
  let result = {};

  // DIB 0: Message Format Identifier
  const payloadStyle = "monitoring";
  result.payload_style = payloadStyle;

  // DIB 1: Energy
  const energyPrefix = payload.slice(2, 6);
  checkMeterCommunicationError(energyPrefix.slice(0,2));

  let energyValueRaw;
  let energyValueTransformed;
  let energyValueRawReversed;
  let energyValueRawDecimal;

  energyValueRaw = payload.slice(6, 14);
  energyValueRawReversed = energyValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  energyValueRawDecimal = hexToSignedInt(energyValueRawReversed);
  energyValueTransformed = scaleEnergy(energyPrefix, energyValueRawDecimal);
  
  result.energy_mwh = energyValueTransformed;
  

  // DIB 2: Volume
  let volumePrefix = payload.slice(14, 18);
  checkMeterCommunicationError(volumePrefix.slice(0,2));

  let volumeValueRaw;
  let volumeValueReversed;
  let volumeValueDecimal;
  let volumeValueTransformed;

  volumeValueRaw = payload.slice(18, 26);
  volumeValueReversed = volumeValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  volumeValueDecimal = hexToSignedInt(volumeValueReversed);
  

  volumeValueTransformed = scaleVolume(volumePrefix, volumeValueDecimal);
  result.volume_m3 = volumeValueTransformed;


  //DIB 3 Power
  let powerPrefix = payload.slice(26, 30);
  checkMeterCommunicationError(powerPrefix.slice(0,2));

  let powerValueRaw;
  let powerValueRawReversed;
  let powerValueRawDecimal;
  let powerValueTransformed;

  powerValueRaw = payload.slice(30, 34);
  powerValueRawReversed = powerValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  powerValueRawDecimal = hexToSignedInt(powerValueRawReversed);
  powerValueTransformed = scalePower(powerPrefix, powerValueRawDecimal);
  
  result.power_kw = powerValueTransformed;

  //DIB 4 Flow
  let flowPrefix = payload.slice(34, 38);
  checkMeterCommunicationError(flowPrefix.slice(0,2));

  let flowValueRaw;
  let flowValueRawReversed;
  let flowValueRawDecimal;
  let flowValueTransformed;

  flowValueRaw = payload.slice(38, 42);
  flowValueRawReversed = flowValueRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  flowValueRawDecimal = hexToSignedInt(flowValueRawReversed);
  flowValueTransformed = scaleFlow(flowPrefix, flowValueRawDecimal)
  
  result.flow_m3h = flowValueTransformed;
  

  // DIB 5 Fw temp
  let fw_tempPrefix = payload.slice(42, 46);
  checkMeterCommunicationError(fw_tempPrefix.slice(0,2));

  let fw_tempRaw;
  let fw_tempRawReversed;
  let fw_tempRawDecimal;
  let fw_tempTransformed;

  fw_tempRaw = payload.slice(46, 50);
  fw_tempRawReversed = fw_tempRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  fw_tempRawDecimal = hexToSignedInt(fw_tempRawReversed);
  fw_tempTransformed = scaleFwTemp(fw_tempPrefix, fw_tempRawDecimal);
  
  result.fw_temp_c = fw_tempTransformed;
  

  // DIB 6 Rt temp
  let rt_tempPrefix = payload.slice(50, 54);
  checkMeterCommunicationError(rt_tempPrefix.slice(0,2));

  let rt_tempRaw;
  let rt_tempRawReversed;
  let rt_tempRawDecimal;
  let rt_tempTransformed;

  rt_tempRaw = payload.slice(54, 58);
  rt_tempRawReversed = rt_tempRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  rt_tempRawDecimal = hexToSignedInt(rt_tempRawReversed);
  rt_tempTransformed = scaleRtTemp(rt_tempPrefix, rt_tempRawDecimal);
  
  result.rt_temp_c = rt_tempTransformed;

  //DIB 7 Meter ID
  const meteridPrefix = payload.slice(58, 62);
  checkMeterCommunicationError(meteridPrefix.slice(0,2));

  let meterID = payload.slice(62, 70);
  let meterIDReversed = meterID.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  result.meter_id = meterIDReversed;

  // DIB 8: Error bits
  let errorBitsPrefix = payload.slice(70, 76);
  checkMeterCommunicationError(errorBitsPrefix.slice(0,2));

  let errorBits = payload.slice(76, 84);
  let errorBitsReversed = errorBits.match(/[a-fA-F0-9]{2}/g).reverse().join('');
  let analyzedError = analyseError(errorBitsReversed);

  result.errors = errorBitsReversed;
  result.analyzedError = analyzedError;

  // DIB 9: Energy when mounted in the wrong position
  const casePrefix = payload.slice(84, 87);
  checkMeterCommunicationError(casePrefix.slice(0,2));

  if (casePrefix == '048'){ //for 8 character prefixes
    const energyMountedWrongPrefix = payload.slice(84, 92);
    let energyMountedWrongRaw = payload.slice(92, 100);
    let energyMountedWrongReverse = energyMountedWrongRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
    let energyMountedWrongDecimal = hexToSignedInt(energyMountedWrongReverse);
    let energyMountedWrongTransformed = scaleEnergyInWrongMountingPosition(energyMountedWrongPrefix, energyMountedWrongDecimal);
    
    result.energy_mounted_wrong_mwh = energyMountedWrongTransformed;

  }else{
    const energyMountedWrongPrefix = payload.slice(84, 94); //for 10 character prefixes
    
    let energyMountedWrongRaw = payload.slice(94,102);
    let energyMountedWrongReverse = energyMountedWrongRaw.match(/[a-fA-F0-9]{2}/g).reverse().join('');
    let energyMountedWrongDecimal = hexToSignedInt(energyMountedWrongReverse);
    let energyMountedWrongTransformed = scaleEnergyInWrongMountingPosition(energyMountedWrongPrefix, energyMountedWrongDecimal);
    
    result.energy_mounted_wrong_mwh = energyMountedWrongTransformed;
  }
  return result;
}


function parserForUH30(payload) {
  const messageFormat = payload.substr(0, 2)

  switch (messageFormat) {

    case '05':
      return parseStandardMesssage(payload);

    case '06':
      return parseCompactMessage(payload);

    case '07':
      return parseJsonMessage(payload);

    case '08':
      return parseScheduledDailyRedundantMessage(payload);

    case '09':
      return parseScheduledExtendedMessage(payload);

    case '0A':
      return parseCombinedHeatCoolingMessage(payload);

    case '0B':
      return parseSimpleBillingMessage(payload);

    case '0C':
      return parsePlausibilityCheckMessage(payload);

    case '0D':
      return parseMonitoringMessage(payload);

    default:
      throw new Error("Unknown message format");

  }

}


const real_payload_1 = "050406F82F00000414CD650000022D0900023B1000025A3303025E6C010C781716327104FD1700000000";
const demoPayload = "050406FFFFFFFF0414FFFFFFFF022DFFFF023B0080025AFFFF025EFFFF0C785716327104FD1700000000";
const demoPayload2 = "050406F82F00000414CD650000022D0900023B1000025A3303025E6C010C781716327104FD17FFFFFFFF";
const demo_all_min_values = "05040600000000041400000000022D0000023B0080025A0000025E00000C785716327104FD1700000000";
const demo_all_max_values = "050406FFFFFF7F0414FFFFFF7F022DFF7F023BFF7F025AFF7F025EFF7F0C785716327104FD1700000000";
const payload_negative_values = "050406FFFFFFFF0414FFFFFFFF022DFFFF023B0080025AFFFF025EFFFF0C785716327104FD1700000000";
const meter_communication_error_payload = "053406FFFFFFFF3414FFFFFFFF322DFFFF323B0080325AFFFF325EFFFF3C785716327104FD1700000000";
const negative_flow = "0504066D1700000414BB2E0000022D0000023BFFFF025A6902025E3C010C785716327104FD1700000000"

//let test = parserForUH30(demoPayload2);
//console.log(test);






if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = {
    parserForUH30,
    scaleEnergy,
    scaleFlow,
    scaleFwTemp,
    scaleRtTemp,
    scaleCoolingEnergy,
    scaleEnergyInWrongMountingPosition,
    scaleMaxFwTemp,
    scaleMaxRtTemp,
    scalePower,
    scaleVolume,
    scalePreviousMonthEnergy,
    analyseError,
    checkMeterCommunicationError
  };
}

export {parserForUH30};
