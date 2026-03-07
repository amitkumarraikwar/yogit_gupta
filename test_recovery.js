const { parseTextToEvents } = require('./lib/recoveryUtils');

const mockText = `
Youth Against Drugs
This is a great description for the youth against drugs event. It should span multiple lines.

Included Images:
Image 1: https://lh3.googleusercontent.com/d/1A2B3C4D5E6F
Image 2: https://lh3.googleusercontent.com/d/6F5E4D3C2B1A

DAVV Sundarkand
 میرے जन्म दिन 9 अप्रैल 2025 के शुभ अवसर पर DAVV यूनिवर्सिटी के गवर्नमेंट होस्टल में सुंदरकांड एवं 1000 से अधिक युवाओ का प्रीतिभोज कार्यक्रम

Included Images:
Image 1: https://lh3.googleusercontent.com/d/XXXXYYYYZZZZ
`;

const events = parseTextToEvents(mockText);
console.log(JSON.stringify(events, null, 2));

if (events.length === 2 && events[0].heading === 'Youth Against Drugs' && events[0].images.length === 2) {
    console.log("SUCCESS: Data parsed correctly!");
} else {
    console.log("FAILURE: Parsing details mismatch.");
    console.log("Count:", events.length);
}
