# Text to File Converter

This Node.js project converts text input into various file formats including:
- Text files (.txt)
- Word documents (.docx)
- Excel spreadsheets (.xlsx)
- PDF documents (.pdf)
- Images (.jpg, .png)

## Installation

1. Make sure you have Node.js installed on your system
2. Clone this repository
3. Install dependencies:
```bash
npm install
```

## Usage

The project includes a `TextToFileConverter` class that handles the conversion of text to different file formats. All generated files will be saved in the `output` directory.

```javascript
const converter = new TextToFileConverter();
const text = "Your text here";

// Convert text to all supported formats
converter.convertTextToAllFormats(text)
    .then(paths => {
        console.log('Created files at:', paths);
    })
    .catch(error => {
        console.error('Error:', error);
    });

// Or use individual methods:
converter.createTxtFile(text, 'custom.txt');
converter.createDocxFile(text, 'custom.docx');
converter.createXlsxFile(text, 'custom.xlsx');
converter.createPdfFile(text, 'custom.pdf');
converter.createImageFile(text, 'jpg', 'custom.jpg');
converter.createImageFile(text, 'png', 'custom.png');
```

## Dependencies

- docx: For creating Word documents
- xlsx: For creating Excel spreadsheets
- pdfkit: For creating PDF documents
- sharp: For creating image files
- fs-extra: For file system operations

## Output

All generated files will be saved in the `output` directory. The default filenames are:
- output.txt
- output.docx
- output.xlsx
- output.pdf
- output.jpg
- output.png

You can specify custom filenames when using individual conversion methods. 