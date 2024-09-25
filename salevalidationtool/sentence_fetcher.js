const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Function to check if a sentence contains a discount
function containsDiscount(sentence) {
    // Regular expression to match percentage off (e.g., "20% off", "30% discount")
    const discountPattern = /(\d{1,2}%\s*(off|discount))/i;
    return discountPattern.test(sentence);
}

// Function to count the number of words in a sentence
function countWords(sentence) {
    // Split the sentence by whitespace and filter out empty strings
    return sentence.split(/\s+/).filter(Boolean).length;
}

// Function to extract sentences from a website using Puppeteer
async function extractSentencesFromWebsite(url, name) {
    const results = [];
    try {
        // Launch a new Puppeteer browser instance
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        
        // Navigate to the provided URL
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract the visible text from the body
        const textContent = await page.evaluate(() => {
            return document.body.innerText;
        });

        // Close the browser
        await browser.close();

        // Extract sentences by splitting text by new lines
        const sentences = textContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Use a Set to store unique sentences
        const uniqueSentences = new Set();

        // Process sentences
        sentences.forEach(sentence => {
            if (containsDiscount(sentence) && countWords(sentence) > 2) {
                uniqueSentences.add(sentence);
            }
        });

        // Add results to the array
        uniqueSentences.forEach(sentence => {
            results.push({
                website: name,
                url: url,
                result: sentence
            });
        });

    } catch (error) {
        console.error('Error fetching or processing the webpage:', error);
    }

    return results;
}

// List of websites
const websites = [
    //eliminate fast fashion brands
    { name: 'COS', url: 'https://www.cos.com/en_usd/index.html' },
    { name: 'Everlane', url: 'https://www.everlane.com/'},
    { name: 'Frame', url: 'https://frame-store.com/'},
    { name: 'Madewell', url: 'https://www.madewell.com/'},
    { name: 'Abercome & Fitch', url: 'https://www.abercrombie.com/shop/us'},
    { name: 'Jcrew', url: 'https://www.jcrew.com/'},
    { name: 'Aritzia', url: 'https://www.aritzia.com/us/en/home'},
    { name: 'Sandro', url: 'https://us.sandro-paris.com/'},
    { name: 'Maje', url: 'https://us.maje.com/'},
    { name: 'Frankie', url: 'https://thefrankieshop.com/'},
    { name: 'Mango', url: 'https://shop.mango.com/us/en'},
    { name: 'Uniqlo', url: 'https://www.uniqlo.com/us/en/'},
    { name: 'Gap', url: 'https://www.gap.com/'},
    { name: 'Oak and Fort', url: 'https://oakandfort.com/'}

];

// CSV Writer setup
const csvWriter = createCsvWriter({
    path: 'results.csv',
    header: [
        { id: 'website', title: 'Website' },
        { id: 'url', title: 'URL' },
        { id: 'result', title: 'Result' }
    ]
});

// Main function to process all websites and write results to CSV
async function main() {
    const allResults = [];

    for (const website of websites) {
        const results = await extractSentencesFromWebsite(website.url, website.name);
        allResults.push(...results);
    }

    // Write results to CSV
    csvWriter.writeRecords(allResults)
        .then(() => console.log('CSV file was written successfully.'));
}

// Run the main function
main();
