This project is a web application developed as part of an advanced practical course. The application processes payloads from district heating systems, visualizes their data in interactive charts, and performs plausibility checks. Users can select different machine types, analyze errors, and review detailed information about the payloads.
Features:
Payload parsing and detailed data visualization.
Interactive charts with real-time plausibility checks.
Error table dynamically adjusted to the selected machine type.
Clean and responsive design for ease of use.
The application is built with HTML, CSS, JavaScript, and uses Chart.js for data visualization.

## How to Add Your Own Parser

If you want to integrate your own parser into this application for testing and visualization purposes, follow these steps:

### 1. Create Your Parser
- Navigate to the `parser` folder in the project directory.
- Create a subfolder named after your machine type, e.g., `my_machine`.
- Inside this folder, create a parser file, e.g., `parser.js`.
- Your parser file should export a function that takes a payload (string) as input and returns an object with the parsed data. The object should ideally follow the structure below:
  
  ```javascript
  export function parseMyMachine(payload) {
      // Your parsing logic here
      return {
          messageType: 'Standard Message',
          energyPrefix: '0C06',
          MYM_energy: 189.515,
          volumePrefix: '0C14',
          MYM_volume: 3651,
          powerPrefix: '0B2D',
          MYM_power: 17.5,
          flowPrefix: '0B3B',
          MYM_flow: 0.347,
          fwTempPrefix: '0A5A',
          MYM_forwardTemperature: 90.2,
          rtTempPrefix: '0A5E',
          MYM_returnTemperature: 46.4,
          meterIDValuePrefix: '0C78',
          meterId: '70907770',
          errorBitsValuePrefix: '02FD17',
          errorBitsValue: 12294,
          MYM_errors: ['F1', 'F2'], // Optional: Array of error identifiers
      };
  }
  ```

### 2. Register Your Parser
- Open `app.js` in the root directory.
- Import your parser at the top of the file:
  ```javascript
  import { parseMyMachine } from './parser/my_machine/parser.js';
  ```
- Add a condition for your parser inside the `processPayload` function:
  ```javascript
  if (parserType === 'My_Machine') {
      result = parseMyMachine(payload);
  }
  ```

### 3. Add Your Machine Type to the Dropdown Menu
- Locate the `<select>` element for parser selection in your HTML file.
- Add an option for your machine type, e.g.:
  ```html
  <option value="My_Machine">My Machine</option>
  ```

### 4. Add an Error Table (Optional)
- If your machine type has specific error codes, add them to the `errorTables` object in `app.js`:
  ```javascript
  errorTables.My_Machine = [
      { bitNo: 0, decimalValue: 1, identifier: 'F0', explanation: 'Example error 0' },
      { bitNo: 1, decimalValue: 2, identifier: 'F1', explanation: 'Example error 1' },
      // Add more as needed
  ];
  ```

### 5. Test Your Parser
- Start the application.
- Select your parser from the dropdown menu.
- Enter a payload and click on the 'Verarbeiten' button.
- Verify that your data is parsed, displayed in the table, visualized in charts, and error codes (if any) are shown.

