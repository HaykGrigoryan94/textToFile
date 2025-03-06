const { TextToFileConverter } = require('./index.js');

const samples = {
    russian: `В начале было Слово, и Слово было у Бога, и Слово было Бог.
Оно было в начале у Бога. Всё через Него начало быть, и без Него ничто не начало быть, что начало быть.`,
    
    amharic: `ቃል ሥጋ ሆነ
በመጀመሪያ ቃል ነበረ፤ ቃልም ከእግዚአብሔር ጋራ ነበረ፤ ቃልም እግዚአብሔር ነበረ። እርሱም በመጀመሪያ ከእግዚአብሔር ጋራ ነበረ።`,

    arabic: `فِي الْبَدْءِ كَانَ الْكَلِمَةُ، وَالْكَلِمَةُ كَانَ عِنْدَ اللهِ، وَكَانَ الْكَلِمَةُ اللهَ.
هَذَا كَانَ فِي الْبَدْءِ عِنْدَ اللهِ.`
};

async function testAllLanguages() {
    const converter = new TextToFileConverter();
    
    for (const [lang, text] of Object.entries(samples)) {
        console.log(`\nTesting ${lang} text:`);
        try {
            await converter.convertTextToAllFormats(text);
            console.log(`${lang} conversion completed successfully!`);
        } catch (error) {
            console.error(`Error converting ${lang}:`, error);
        }
    }
}

testAllLanguages().catch(console.error); 