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
  const nameElement = await element.$("h6 a.ws-normal");
  let name = null;
  let item_id = null;
  if (nameElement) {
    name = await nameElement.evaluate((node) => node.innerText);
    item_id = await convertToAlternatingNumbersAndAlphabets(name);
  } else {
    console.warn("nameElement is null");
  }
  const datacolordetails = {};

  const swatchElements = await element.$$("li.ar-swatches__swatch-container");

  for (const swatchElement of swatchElements) {
    const colorElement = await swatchElement.$("span.ar-swatches__swatch");
    const anchorElement = await swatchElement.$("a.ar-swatches__swatch-anchor");
    if (colorElement && anchorElement) {
      const colorName = await colorElement.evaluate((node) =>
        node.getAttribute("data-color")
      );
      const unique_color_id = await convertToAlternatingNumbersAndAlphabets(
        colorName
      );
      const productURL = await anchorElement.evaluate((node) =>
        node.getAttribute("href")
      );
      // const imgurl = await anchorElement.evaluate(node => node.getAttribute('href'));
      const imageElement = await colorElement.$("img.ar-swatches__image");
      const imgurl = await imageElement.evaluate((img) =>
        img.getAttribute("data-thumb-src")
      );
      // const thumbSrcValue = await imgurl.jsonValue();
      console.log(imgurl);
      const swatchurl = await imageElement.getProperty("src");
      colorname_details = [unique_color_id, productURL, swatchurl, imgurl];
      datacolordetails[colorName] = colorname_details;
    }
  }
  return {
    item_id,
    name,
    datacolordetails,
  };
};

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://www.aritzia.com/us/en/sale?prefn1=isSale&prefv1=True&prefn2=subDepartment&prefv2=Blazers%7CBodysuits%7CDresses%7CJumpsuits%20%26%20Rompers%7CLeggings%7CPants%7CShirts%20%26%20Blouses%7CShorts%7CSkirts%7CSweaters%7CT-Shirts%20%26%20Tops%7CVests%7CJackets%20%26%20Coats&srule=TEST%204%20TOP%20RATED"
  );

  // https://www.aritzia.com/us/en/sale?prefn1=isSale&prefv1=True&prefn2=subDepartment&prefv2=Blazers%7CBodysuits%7CDresses%7CJackets%7CJumpsuits%20%26%20Rompers%7CLeggings%7CPants%7CSkirts%7CShorts%7CShirts%20%26%20Blouses%7CSweaters%7CVests&srule=TEST%204%20TOP%20RATED

  // https://assets.aritzia.com/image/upload/large/s24_99_a06_116237_31973_on_a.jpg
  // https://assets.aritzia.com/image/upload/w_1500/s24_99_a06_116237_30360_off_a
  await page.setViewport({
    width: 1200,
    height: 800,
  });
  await autoScroll(page);
  // infinite pagination scroll

  // for each item scrape
  const allResults = [];
  const productElements = await page.$$("#primary .product-tile");
  console.log(`Found ${productElements.length} items`);

  for (const productElement of productElements) {
    const productResult = await scrapeProduct(productElement);
    allResults.push(productResult);
  }
  // console.log(JSON.stringify(allResults, null, 2));

  // putting data into csv sheet
  let csvData =
    "Aritzia,Product Name,Color,Product URL,Unique Color ID, Swatch URL,Scraped Image URL\n";

  for (const product of allResults) {
    const productName = product.name;
    const productId = product.unique_product_id;

    for (const color in product.datacolordetails) {
      const productInfo = product.datacolordetails[color];
      const rowData = `Aritzia,${productName},${color},"${productInfo[1]}",${productInfo[0]},${productInfo[2]},"${productInfo[3]}"\n`;
      csvData += rowData;
    }
  }

  fs.writeFileSync("aritzia_product_data.csv", csvData, "utf8");
  console.log("CSV file saved successfully as aritzia_data.csv");

  await browser.close();
}

main();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 77;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        const productElements = document.querySelectorAll(
          "#primary .product-tile"
        );
        if (
          productElements.length >= 100 ||
          totalHeight >= scrollHeight - window.innerHeight
        ) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
