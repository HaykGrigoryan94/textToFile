const { Document, Packer, Paragraph } = require('docx');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const sharp = require('sharp');
const fs = require('fs-extra');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const https = require('https');

// Font configuration for different languages
const fontConfig = {
    amharic: {
        name: 'Noto Sans Ethiopic',
        url: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansEthiopic/NotoSansEthiopic-Regular.ttf',
        rtl: true,
        range: /[\u1200-\u137F]/
    },
    arabic: {
        name: 'Noto Sans Arabic',
        url: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf',
        rtl: true,
        range: /[\u0600-\u06FF]/
    },
    hebrew: {
        name: 'Noto Sans Hebrew',
        url: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Regular.ttf',
        rtl: true,
        range: /[\u0590-\u05FF]/
    },
    chinese: {
        name: 'Noto Sans SC',
        url: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansSC/NotoSansSC-Regular.ttf',
        rtl: false,
        range: /[\u4E00-\u9FFF]/
    },
    japanese: {
        name: 'Noto Sans JP',
        url: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansJP/NotoSansJP-Regular.ttf',
        rtl: false,
        range: /[\u3040-\u309F\u30A0-\u30FF]/
    },
    korean: {
        name: 'Noto Sans KR',
        url: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansKR/NotoSansKR-Regular.ttf',
        rtl: false,
        range: /[\u3130-\u318F\uAC00-\uD7AF]/
    },
    cyrillic: {
        name: 'Noto Sans',
        url: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
        rtl: false,
        range: /[\u0400-\u04FF]/
    },
    default: {
        name: 'Noto Sans',
        url: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
        rtl: false,
        range: /./
    }
};

// Function to detect text language based on character ranges
function detectLanguage(text) {
    // Count characters in each range
    const langCounts = {};
    
    for (const [lang, config] of Object.entries(fontConfig)) {
        if (lang === 'default') continue;
        const matches = text.match(config.range) || [];
        langCounts[lang] = matches.length;
    }

    // Find the language with the most matching characters
    const detectedLang = Object.entries(langCounts)
        .filter(([_, count]) => count > 0)
        .sort(([_, a], [__, b]) => b - a)[0];

    if (detectedLang) {
        console.log('Detected language:', detectedLang[0]);
        return fontConfig[detectedLang[0]];
    }

    console.log('Using default font');
    return fontConfig.default;
}

// Function to download font
async function downloadFont(fontInfo) {
    const fontFileName = `${fontInfo.name.replace(/\s+/g, '')}.ttf`;
    const fontPath = path.join(__dirname, fontFileName);
    
    if (!fs.existsSync(fontPath)) {
        console.log(`Downloading ${fontInfo.name} font...`);
        
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(fontPath);
            https.get(fontInfo.url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Font ${fontInfo.name} downloaded successfully`);
                    resolve(fontPath);
                });
            }).on('error', (err) => {
                fs.unlink(fontPath);
                reject(err);
            });
        });
    }
    return Promise.resolve(fontPath);
}

class TextToFileConverter {
    constructor() {
        this.ensureOutputDirectory();
        this.loadedFonts = new Set();
    }

    ensureOutputDirectory() {
        if (!fs.existsSync('output')) {
            fs.mkdirSync('output');
        }
    }

    async loadFont(text) {
        const fontInfo = detectLanguage(text);
        if (!this.loadedFonts.has(fontInfo.name)) {
            try {
                const fontPath = await downloadFont(fontInfo);
                registerFont(fontPath, { family: fontInfo.name });
                this.loadedFonts.add(fontInfo.name);
            } catch (error) {
                console.error('Error loading font:', error);
            }
        }
        return fontInfo;
    }

    async createTxtFile(text, filename = 'output.txt') {
        const path = `output/${filename}`;
        await fs.writeFile(path, text);
        return path;
    }

    async createDocxFile(text, filename = 'output.docx') {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: text
                    })
                ]
            }]
        });

        const path = `output/${filename}`;
        const buffer = await Packer.toBuffer(doc);
        await fs.writeFile(path, buffer);
        return path;
    }

    async createXlsxFile(text, filename = 'output.xlsx') {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([[text]]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        const path = `output/${filename}`;
        XLSX.writeFile(workbook, path);
        return path;
    }

    async createPdfFile(text, filename = 'output.pdf') {
        const fontInfo = await this.loadFont(text);
        const fontPath = path.join(__dirname, `${fontInfo.name.replace(/\s+/g, '')}.ttf`);
        const outputPath = `output/${filename}`;
        
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                autoFirstPage: true
            });
            
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Register and use the font
            doc.registerFont(fontInfo.name, fontPath);
            doc.font(fontInfo.name);
            
            // Configure text direction and alignment
            if (fontInfo.rtl) {
                doc.text(text, {
                    align: 'right',
                    features: ['rtla']
                });
            } else {
                doc.text(text, {
                    align: 'left'
                });
            }

            doc.end();
            stream.on('finish', () => resolve(outputPath));
            stream.on('error', reject);
        });
    }

    async createImageFile(text, type = 'png', filename) {
        const fontInfo = await this.loadFont(text);
        
        if (!filename) {
            filename = `output.${type}`;
        }

        const path = `output/${filename}`;
        
        // Initial canvas setup
        const baseWidth = 1200;
        const fontSize = 32;
        const lineHeight = fontSize * 1.8;
        const padding = 60;
        const maxWidth = baseWidth - (padding * 2);

        // Create temporary canvas for text measurement
        const measureCanvas = createCanvas(1, 1);
        const measureCtx = measureCanvas.getContext('2d');
        measureCtx.font = `${fontSize}px "${fontInfo.name}"`;

        // Split text into lines with proper direction
        const words = text.split(/\s+/);
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = measureCtx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        // Calculate final canvas dimensions
        const width = baseWidth;
        const height = Math.max(400, (lines.length * lineHeight) + (padding * 3));

        // Create final canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        // Set text properties
        ctx.font = `${fontSize}px "${fontInfo.name}"`;
        ctx.fillStyle = 'black';
        ctx.textAlign = fontInfo.rtl ? 'right' : 'left';
        ctx.textBaseline = 'middle';
        if (fontInfo.rtl) {
            ctx.direction = 'rtl';
        }

        // Draw text lines
        lines.forEach((line, index) => {
            const y = padding + (index * lineHeight) + (lineHeight / 2);
            const x = fontInfo.rtl ? width - padding : padding;
            ctx.fillText(line, x, y);
        });

        // Save canvas to file
        const buffer = type === 'png' ? canvas.toBuffer('image/png') : canvas.toBuffer('image/jpeg');
        await fs.writeFile(path, buffer);

        return path;
    }

    async convertTextToAllFormats(text) {
        try {
            const results = await Promise.all([
                this.createTxtFile(text),
                this.createDocxFile(text),
                this.createXlsxFile(text),
                this.createPdfFile(text),
                this.createImageFile(text, 'jpg', 'output.jpg'),
                this.createImageFile(text, 'png', 'output.png')
            ]);

            console.log('All files created successfully!');
            return results;
        } catch (error) {
            console.error('Error creating files:', error);
            throw error;
        }
    }
}

const converter = new TextToFileConverter();
const sampleText = `some text`;

converter.convertTextToAllFormats(sampleText)
    .then(paths => {
        console.log('Created files at:', paths);
    })
    .catch(error => {
        console.error('Error:', error);
    });

module.exports = { TextToFileConverter }; 