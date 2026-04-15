#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const categoriesDir = path.join(__dirname, 'img', 'word-categories');
const outputFile = path.join(__dirname, 'words-selection-data.js');

function toBaseName(fileName) {
    return fileName.replace(/\.[^/.]+$/, '');
}

function sortAlpha(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

async function main() {
    const entries = await fs.promises.readdir(categoriesDir, { withFileTypes: true });
    const categories = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort(sortAlpha);

    const colecciones = [];

    for (const categoria of categories) {
        const categoryPath = path.join(categoriesDir, categoria);
        const files = await fs.promises.readdir(categoryPath, { withFileTypes: true });

        const palabras = files
            .filter(file => file.isFile() && ['.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(path.extname(file.name).toLowerCase()))
            .map(file => ({ name: toBaseName(file.name), ext: path.extname(file.name).toLowerCase().slice(1) }))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

        colecciones.push({ categoria, palabras });
    }

    const fileContent = `// This file is generated automatically by \`generate-word-collections.js\`.
` +
        `// Run: node generate-word-collections.js

` +
        `export const colecciones = ${JSON.stringify(colecciones, null, 4)};
`;

    await fs.promises.writeFile(outputFile, fileContent, 'utf8');
    console.log('Generated', outputFile);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
