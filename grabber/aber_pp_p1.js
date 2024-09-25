const puppeteer = require("puppeteer");
const fs = require("fs");
const { log } = require("../logger");

async function convertToAlternatingNumbersAndAlphabets(name) {
  name = name.replace(/[^a-zA-Z]/g, ""); // Remove non-alphabet characters
  const result = [];
  let isAlphabet = true;

  for (const char of name) {
    if (result.length === 10) {
      break;
    }

    if (/[a-zA-Z]/.test(char)) {
      if (isAlphabet) {
        result.push(char.toUpperCase());
        isAlphabet = false;
      } else {
        result.push(char.toLowerCase().charCodeAt(0) - "a".charCodeAt(0) + 1);
        isAlphabet = true;
      }
    } else if (!isNaN(parseInt(char))) {
      if (!isAlphabet) {
        result.push(parseInt(char));
        isAlphabet = true;
      } else {
        isAlphabet = false;
      }
    }
  }

  const dataStr = result.join("");
  return dataStr;
}

async function scrapeProduct(element) {
  const nameElement = await element.$("div.product-name h2");
  let item_id = null;
  let name = null;

  if (nameElement) {
    name = await nameElement.evaluate((node) => node.innerText);
    item_id = await convertToAlternatingNumbersAndAlphabets(name);
  }
  //   console.log(name)
  const swatchElements = await element.$$(".swtg-input-inner-wrapper");
  const datacolordetails = {};
  const urlElement = await element.$(
    "a.catalog-productCard-module__product-content-link"
  );
  if (urlElement) {
    productURL = await urlElement.evaluate((node) => node.getAttribute("href"));
    productURL = `https://www.abercrombie.com${productURL}`;
  }
  let main_prod_url = productURL;

  if (swatchElements) {
    for (const swatchElement of swatchElements) {
      const labelElement = await swatchElement.$("label");
      if (labelElement) {
        // Get the text content of the label
        const colorNameText = await labelElement.evaluate((node) =>
          node.textContent.trim()
        );
        const inputElement = await swatchElement.$("input.swtg-input");
        const idValue = await inputElement.evaluate((input) =>
          input.getAttribute("id")
        );
        const extractedId = idValue.match(/KIC_\d+-\d+-\d+-\d+/)[0];

        // Construct the new image URL
        const imageUrl = `https://img.abercrombie.com/is/image/anf/${extractedId}_prod1?policy=product-large`;

        // Clean and format the color name
        const colorname = colorNameText.toUpperCase();
        const unique_color_id = await convertToAlternatingNumbersAndAlphabets(
          colorname
        );
        // grab swatch img url
        // const imgElement = await swatchElement.$('img');
        const swatch_url = `https://img.abercrombie.com/is/image/anf/${extractedId}_sw?policy=product-xsmall`;

        // src="https://img.abercrombie.com/is/image/anf/KIC_143-4340-0100-900_sw?policy=product-xsmall"
        // if not url then change
        const colorname_details = [
          unique_color_id,
          productURL,
          swatch_url,
          imageUrl,
        ];
        datacolordetails[colorname] = colorname_details;
      } else {
        console.error(
          "Label element not found for swatchElement:",
          swatchElement
        );
      }
    }
  }

  return {
    item_id,
    name,
    main_prod_url,
    datacolordetails,
  };
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized"], // Launch browser in full-screen mode
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); // Set the page viewport to full HD resolution

  const allResults = [];

  let start = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    const url = `https://www.abercrombie.com/shop/us/womens-clearance?facet=ads_f36005_ntk_cs%3A%28%22Activewear%22+%22Bodysuits%22+%22Blouses%22+%22Graphic+Tees%22+%22Tees+%26+Tanks%22+%22Shirts%22+%22Hoodies+%26+Sweatshirts%22+%22Sweaters%22+%22Jeans%22+%22Pants%22+%22Sweatpants+%26+Leggings%22+%22Shorts%22+%22Skirts%22+%22Jumpsuits%22+%22Dresses%22+%22Rompers%22+%22Bralettes%22+%22Sleepwear%22+%22Jackets+%26+Coats%22%29&filtered=true&rows=90&sort=metricorderedunits&start=${start}`;

    // https://www.abercrombie.com/shop/us/womens-clearance?filtered=true&rows=90&start=${start}
    // https://www.abercrombie.com/shop/us/womens-clearance?facet=ads_f36005_ntk_cs%3A%28%22Activewear%22+%22Bodysuits%22+%22Blouses%22+%22Graphic+Tees%22+%22Tees+%26+Tanks%22+%22Shirts%22+%22Hoodies+%26+Sweatshirts%22+%22Sweaters%22+%22Jeans%22+%22Pants%22+%22Sweatpants+%26+Leggings%22+%22Shorts%22+%22Skirts%22+%22Jumpsuits%22+%22Dresses%22+%22Rompers%22+%22Bralettes%22+%22Sleepwear%22+%22Jackets+%26+Coats%22%29&filtered=true&rows=90&sort=metricorderedunits&start=0
    await page.goto(url);
    // Scrape the products on the current page
    // await autoScroll(page);
    const productElements = await page.$$(
      "li.catalog-productCard-module__productCard"
    );
    console.log(`Found ${productElements.length} items`);

    for (const productElement of productElements) {
      const productResult = await scrapeProduct(productElement);
      allResults.push(productResult);
      if (allResults.length >= 150) {
        console.log("Found 100 products, stopping scraping.");
        hasNextPage = false;
        break;
      }
    }
    if (allResults.length < 150) {
      const nextButton = await page.$("button.pagination-next-button");
      const isDisabled = await nextButton.evaluate((button) => button.disabled);

      if (isDisabled || start == 180) {
        console.log("No more pages/ page limit reached, scraping is complete.");
        hasNextPage = false;
      } else {
        console.log("Navigating to the next page...");
        start += 90; // Move to the next page
        // await page.waitForTimeout(3000);
      }
    }
  }

  console.log(JSON.stringify(allResults, null, 2));

  let csvData =
    "Brand,Product Name,Color,Product URL,Unique Color ID, Swatch URL,Scraped Image URL\n"; // CSV headers

  // Iterate through the data and add it to the CSV data string
  for (const product of allResults) {
    const productName = product.name;
    for (const color in product.datacolordetails) {
      const productInfo = product.datacolordetails[color];
      const rowData = `Abercombie,${productName},${color},"${productInfo[1]}",${productInfo[0]},${productInfo[2]},"${productInfo[3]}"\n`;
      // log(rowData)
      csvData += rowData;
    }
  }

  // Write the CSV data to a file
  fs.writeFileSync("abercombie_product_data.csv", csvData, "utf8");

  console.log("CSV file saved successfully as abercomebie.csv");
  await browser.close();
}

main();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 120;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// consider cropping down

// type is arrow clicker

// change script by adding to each page then click url

// https://www.abercrombie.com/shop/us/womens?icmp=ICT:FALL24:F-A:HP:SLP:DIV:PRM:AE:AugWk2:X:
// https://www.abercrombie.com/shop/us/womens?filtered=true&icmp=ICT%3AFALL24%3AF-A%3AHP%3ASLP%3ADIV%3APRM%3AAE%3AAugWk2%3AX%3A&rows=90&start=90
// https://www.abercrombie.com/shop/us/womens?filtered=true&icmp=ICT%3AFALL24%3AF-A%3AHP%3ASLP%3ADIV%3APRM%3AAE%3AAugWk2%3AX%3A&rows=90&sort=bestmatch&start=180
