# Text to File Converter

A Node.js utility that converts text into multiple file formats with support for various languages and scripts.

## Features

- Converts text to multiple formats:
  - Text files (.txt)
  - Word documents (.docx)
  - Excel spreadsheets (.xlsx)
  - PDF documents (.pdf)
  - Images (.jpg, .png)

- Supports multiple languages and scripts:
  - Amharic (Ethiopic)
  - Arabic
  - Hebrew
  - Chinese (Simplified)
  - Japanese
  - Korean
  - Russian (Cyrillic)
  - Latin and other scripts

- Automatic language detection
- Right-to-Left (RTL) text support
- Dynamic font downloading
- Proper text wrapping and layout

## Installation

1. Make sure you have Node.js installed on your system
2. Clone this repository:
```bash
git clone https://github.com/HaykGrigoryan94/textToFile.git
cd textToFile
```

3. Install dependencies:
```bash
npm install
```

## Usage

### Basic Usage

```javascript
const { TextToFileConverter } = require('./index.js');

const converter = new TextToFileConverter();
const text = "Your text here in any language";

// Convert to all formats
converter.convertTextToAllFormats(text)
    .then(paths => {
        console.log('Created files at:', paths);
    })
    .catch(error => {
        console.error('Error:', error);
    });
```

### Individual Format Conversion

```javascript
const converter = new TextToFileConverter();

// Create TXT file
await converter.createTxtFile(text, 'output.txt');

// Create DOCX file
await converter.createDocxFile(text, 'output.docx');

// Create XLSX file
await converter.createXlsxFile(text, 'output.xlsx');

// Create PDF file
await converter.createPdfFile(text, 'output.pdf');

// Create image files
await converter.createImageFile(text, 'jpg', 'output.jpg');
await converter.createImageFile(text, 'png', 'output.png');
```

### Language Support Examples

```javascript
// Amharic
const amharicText = `ቃል ሥጋ ሆነ በመጀመሪያ ቃል ነበረ፤`;

// Russian
const russianText = `В начале было Слово`;

// Arabic
const arabicText = `فِي الْبَدْءِ كَانَ الْكَلِمَةُ`;

// The converter will automatically detect the language and use appropriate fonts
```

## Output

All generated files will be saved in the `output` directory with the following default names:
- output.txt
- output.docx
- output.xlsx
- output.pdf
- output.jpg
- output.png

## Dependencies

- docx: For creating Word documents
- xlsx: For creating Excel spreadsheets
- pdfkit: For creating PDF documents
- sharp: For creating image files
- canvas: For text rendering in images
- fs-extra: For enhanced file system operations

## Testing

Run the test script to see examples with different languages:

```bash
node test.js
```

## License

MIT 