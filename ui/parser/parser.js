import { 
    parseStandardMessage,
    parseCompactMessage,
    parseJsonMessage,
    parseScheduledDataMessage,
    parseScheduledExtendedMessage,
    parseScheduledExtendedPlusTelegram1,
    parseScheduledExtendedPlusTelegram2,
    parseCompactTariffMessage,
    parseScheduledClockMessage
} from './messageTypes.js';

export function parseUH50(payload) {
    const messageType = payload.substr(0, 2);
    console.log("messageType: " + messageType)
    switch (messageType) {
        case '00':
            return parseStandardMessage(payload);
        case '01':
            return parseCompactMessage(payload);
        case '02':
            return parseJsonMessage(payload);
        case '03':
            return parseScheduledDataMessage(payload);
        case '04':
            return parseScheduledExtendedMessage(payload);
        case '3F':
            return parseScheduledExtendedPlusTelegram1(payload);
        case '40':
            return parseScheduledExtendedPlusTelegram2(payload);
        case '41':
            return parseCompactTariffMessage(payload);
        case 'FA':
            return parseScheduledClockMessage(payload); 
        default:
            throw new Error(`Unknown message type: ${messageType}`);
    }
}

