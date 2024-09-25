// https://www.aloyoga.com/collections/womens-sale-all?sort_by=best-selling&ProductType=Women%3AOne+Piece%3ABodysuits%2CWomen%3ABras%2CWomen%3AOne+Piece%3ADresses%2CWomen%3AOuterwear%3ACoverups%3AHoodies%2CWomen%3AOuterwear%3AJackets%2CWomen%3ABottoms%3ALeggings%2CWomen%3ATops%3ALong+Sleeves%2CWomen%3AOne+Piece%3AOnesies%2CWomen%3ABottoms%3APants%2CWomen%3AOuterwear%3ACoverups%3APullovers%2CWomen%3ATops%3AShort+Sleeves%2CWomen%3ABottoms%3AShorts%2CWomen%3ABottoms%3ASkirts%2CWomen%3ABottoms%3ASweatpants%2CWomen%3ATops%3ATanks%2CWomen%3AOuterwear%3AVests

const puppeteer = require("puppeteer");
const fs = require("fs");

async function convertToAlternatingNumbersAndAlphabets(name) {
  name = name.replace(/[^a-zA-Z]/g, "");
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

  return result.join("");
}

const scrapeProduct = async (element) => {
  const nameElement = await element.$("div.product-name a");
  let name = null;
  let item_id = null;
  if (nameElement) {
    name = await nameElement.evaluate((node) => node.innerText);
    item_id = await convertToAlternatingNumbersAndAlphabets(name);
  } else {
    console.warn("nameElement is null");
  }
  const imageSrc = await element.evaluate((el) => {
    const imgElement = el.querySelector("img.normal");
    if (imgElement) {
      console.log("image element found");
    }
    return imgElement ? imgElement.getAttribute("src") : null;
  });

  const datacolordetails = {};
  const colorElement = await element.$("p.product-color");
  const anchorElement = await element.$("div.product-name a");
  const swatchprodimg = "N/A";
  const swatchimgsrc = "N/A";
  const colorName = await colorElement.evaluate((node) => node.innerText);
  const unique_color_id = await convertToAlternatingNumbersAndAlphabets(
    colorName
  );
  const productURLfound = await anchorElement.evaluate((node) =>
    node.getAttribute("href")
  );
  const productURL = `https://www.aloyoga.com${productURLfound}`;
  colorname_details = [
    unique_color_id,
    productURL,
    swatchimgsrc,
    swatchprodimg,
  ];
  datacolordetails[colorName] = colorname_details;

  // const swatchElements = await element.$$('div.swatches div');

  // for (const swatchElement of swatchElements) {
  //   }

  // }
  return {
    item_id,
    name,
    imageSrc,
    datacolordetails,
  };
};

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://www.aloyoga.com/collections/womens-sale-all?sort_by=best-selling&ProductType=Women%3AOne+Piece%3ABodysuits%2CWomen%3ABras%2CWomen%3AOne+Piece%3ADresses%2CWomen%3AOuterwear%3ACoverups%3AHoodies%2CWomen%3AOuterwear%3AJackets%2CWomen%3ABottoms%3ALeggings%2CWomen%3ATops%3ALong+Sleeves%2CWomen%3AOne+Piece%3AOnesies%2CWomen%3ABottoms%3APants%2CWomen%3AOuterwear%3ACoverups%3APullovers%2CWomen%3ATops%3AShort+Sleeves%2CWomen%3ABottoms%3AShorts%2CWomen%3ABottoms%3ASkirts%2CWomen%3ABottoms%3ASweatpants%2CWomen%3ATops%3ATanks%2CWomen%3AOuterwear%3AVests",
    {
      waitUntil: "networkidle2", // Wait for network to be idle
      timeout: 1200000,
    }
  );

  await page.setViewport({
    width: 1200,
    height: 800,
  });
  await autoScroll(page);
  // infinite pagination scroll

  // for each item scrape
  const allResults = [];
  const productElements = await page.$$("div.PlpTile");
  console.log(`Found ${productElements.length} items`);

  for (const productElement of productElements) {
    const productResult = await scrapeProduct(productElement);
    allResults.push(productResult);
  }
  //   console.log(JSON.stringify(allResults, null, 2));

  // putting data into csv sheet
  let csvData =
    "Brand,Product Name,Color,Product URL,Unique Color ID, Swatch Image URL,Scraped Image URL\n";

  for (const product of allResults) {
    const productName = product.name;
    const productId = product.unique_product_id;
    const productimgurl = product.imageSrc;
    for (const color in product.datacolordetails) {
      const productInfo = product.datacolordetails[color];
      const rowData = `Alo,${productName},${color},"${productInfo[1]}",${productInfo[0]},${productInfo[2]},"${productimgurl}"\n`;
      csvData += rowData;
    }
  }

  fs.writeFileSync("alo_product_data.csv", csvData, "utf8");
  console.log("CSV file saved successfully as alo_library.csv");

  await browser.close();
}

main();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 200;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        var productElements = document.querySelectorAll("div.PlpTile");
        if (productElements.length > 150) {
          clearInterval(timer);
          resolve();
        }

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
