const puppeteer = require("puppeteer");
const fs = require("fs");
const { log } = require("../logger");

function convertToAlternatingNumbersAndAlphabets(name) {
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

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(
    " https://www.thereformation.com/sale?pmpt=qualifying&prefn1=subclass&prefv1=Dresses%7CTops%7CJeans%7CJumpsuits%7COne%20Piece%7COuterwear%7CPants%7CShorts%7CSkirts%7CSweaters%7CTwo%20pieces&srule=Best%20of&gtmAction=remove&gtmType=Type&gtmValue=Two%20pieces&categoryFilterRemoved=Type&page=2"
  );
  // https://www.thereformation.com/sale
  //   http://localhost:8887/internal-tools-scalabledb/reformation/experiment_1.html

  //https://www.thereformation.com/sale?pmpt=qualifying&prefn1=subclass&prefv1=Dresses%7CTops%7CJeans%7CJumpsuits%7COne%20Piece%7COuterwear%7CPants%7CShorts%7CSkirts%7CSweaters%7CTwo%20pieces&srule=Best%20of&gtmAction=remove&gtmType=Type&gtmValue=Two%20pieces&categoryFilterRemoved=Type&page=2

  await page.setViewport({
    width: 1200,
    height: 800,
  });

  await autoScroll(page);

  const scrapeProduct = async (element) => {
    const nameElement = await element.$(".product-tile__name");
    const name = await nameElement.evaluate((node) => node.innerText);
    console.log(name);
    const item_id = convertToAlternatingNumbersAndAlphabets(name);
    const datacolordetails = {};
    const swatchElements = await element.$$(
      "a.product-tile__swatch.swatch--color"
    );
    for (const swatchElement of swatchElements) {
      const productURL = await swatchElement
        .getProperty("href")
        .then((hrefProp) => hrefProp.jsonValue());
      const colorname = await swatchElement
        .getProperty("title")
        .then((titleProp) => titleProp.jsonValue());
      const unique_color_id = await convertToAlternatingNumbersAndAlphabets(
        colorname
      );
      const swatchImg = await swatchElement.$("img.swatch__icon--color");
      const swatch_url = await swatchImg.evaluate((img) =>
        img.getAttribute("data-src")
      );

      const colorname_details = [unique_color_id, productURL, swatch_url];
      datacolordetails[colorname] = colorname_details;
    }
    const originalPrice = await element.$eval(
      "span.price__original span.price--reduced",
      (el) => el.textContent.trim().replace(/,/g, "")
    );
    // console.log(originalPrice);
    const discountPrice = await element.$eval(
      "div.price__sales span.price--reduced",
      (el) => el.textContent.trim().replace(/,/g, "")
    );
    // console.log(discountPrice);
    return {
      item_id,
      name,
      datacolordetails,
      originalPrice,
      discountPrice,
    };
  };

  const productElements = await page.$$("div.product-grid__item");
  console.log(`${productElements.length} items`);
  const allResults = [];

  for (const productElement of productElements) {
    const productResult = await scrapeProduct(productElement);
    allResults.push(productResult);
    // console.log(allResults)
  }

  console.log(JSON.stringify(allResults, null, 2));
  let csvData =
    "Brand,Product Name,Color,Product URL,Unique Color ID,Price Before,Price After,Swatch URL,Scraped Image URL\n";

  for (const product of allResults) {
    // log(JSON.stringify(product));
    const productName = product.name;
    const priceBefore = product.originalPrice;
    const priceAfter = product.discountPrice;
    for (const color in product.datacolordetails) {
      const productInfo = product.datacolordetails[color];
      const rowData = `Reformation,${productName},${color},"${productInfo[1]}",${productInfo[0]},${priceBefore},${priceAfter}\n`;
      // log(rowData);
      csvData += rowData;
    }
  }

  fs.writeFileSync("reformation_product_data.csv", csvData, "utf8");

  console.log("CSV file saved successfully as reformation_product_data.csv");
  await browser.close();
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 70;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        // Check the number of product elements on the page
        var productElements = document.querySelectorAll(
          "div.product-grid__item"
        );
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
