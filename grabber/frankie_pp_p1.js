// click view all and keep infinte scrolling

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
    "https://thefrankieshop.com/collections/womens-sale?sort_by=best-selling&filter.v.availability=1&filter.p.product_type=Bikini+Bottom&filter.p.product_type=Bikini+Set&filter.p.product_type=Bikini+Top&filter.p.product_type=Blazer&filter.p.product_type=Blouse&filter.p.product_type=Bodysuit&filter.p.product_type=Bralette&filter.p.product_type=Cape&filter.p.product_type=Cardigan&filter.p.product_type=Coat&filter.p.product_type=Dress&filter.p.product_type=Jacket&filter.p.product_type=Jeans&filter.p.product_type=Jumpsuit&filter.p.product_type=Knit+Vest&filter.p.product_type=Leggings&filter.p.product_type=Lingerie&filter.p.product_type=One+Piece&filter.p.product_type=Pants&filter.p.product_type=Romper&filter.p.product_type=Shirt&filter.p.product_type=Shorts&filter.p.product_type=Skirt&filter.p.product_type=Sweater&filter.p.product_type=Sweatpants&filter.p.product_type=Sweatshirt&filter.p.product_type=T-Shirt&filter.p.product_type=Tank&filter.p.product_type=Top&filter.p.product_type=Trench&filter.p.product_type=Vest"
  );
  await page.setViewport({
    width: 1200,
    height: 800,
  });

  await page.waitForSelector("a.pgn-LoadMore.btn-Button.btn-Button-primary");
  await page.click("a.pgn-LoadMore.btn-Button.btn-Button-primary");

  console.log("button clicked");
  await new Promise((r) => setTimeout(r, 10000));

  await autoScroll(page);

  const scrapeProduct = async (element) => {
    const nameElement = await element.$(".prd-Card_Title");
    const name = await nameElement.evaluate((node) => node.innerText);
    console.log(name);
    const item_id = convertToAlternatingNumbersAndAlphabets(name);

    // const swatchElements = await element.$$('.ar-swatches__swatch-container');
    const datacolordetails = {};
    productURL = await element.$eval(".prd-Card_FauxLink", (el) =>
      el.getAttribute("href")
    );
    productURL = `https://thefrankieshop.com${productURL}`;
    const colorname = "ONE_COLOR";
    const unique_color_id = convertToAlternatingNumbersAndAlphabets(colorname);

    colorname_details = [unique_color_id, productURL];
    datacolordetails[colorname] = colorname_details;
    // console.log(datacolordetails)

    const originalPrice = await element.$eval(".prd-Card_ComparePrice", (el) =>
      el.textContent
        .trim()
        .replace("Regular price", "")
        .replace(/,/g, "")
        .trim()
    );

    const discountPrice = await element.$eval(".prd-Card_Price", (el) =>
      el.childNodes[2].nodeValue.trim().replace(/,/g, "")
    );
    const availableSizes = await element.$$eval(
      ".prd-Card_Option",
      (sizeElements) => {
        return sizeElements
          .filter((el) => el.getAttribute("data-variant-available") === "true")
          .map((el) => el.textContent.trim());
      }
    );
    if (availableSizes.length <= 0) {
      availableSizes.push("N/A");
    }
    const imageElement = await element.$("div.prd-Card_ImageContainer img");
    const imgsrcurl = await imageElement.evaluate((node) =>
      node.getAttribute("src")
    );
    const imgsrc = imgsrcurl.startsWith("//")
      ? `https:${imgsrcurl}`
      : imgsrcurl;
    console.log("Available Sizes:", availableSizes);

    return {
      item_id,
      name,
      datacolordetails,
      originalPrice,
      discountPrice,
      imgsrc,
      availableSizes,
    };
  };

  const productElements = await page.$$("li.clc-List_Item");
  const allResults = [];

  for (const productElement of productElements) {
    const productResult = await scrapeProduct(productElement);
    allResults.push(productResult);
    // console.log(allResults)
  }

  console.log(JSON.stringify(allResults, null, 2));
  let csvData =
    "Brand,Product Name,Color,Product URL,Unique Color ID,Scraped Available Sizes,Scraped Image URL,Price Before,Price After\n";

  for (const product of allResults) {
    const productName = product.name;
    const availableSizes = product.availableSizes.length
      ? `"${product.availableSizes.join(", ")}"`
      : '"N/A"';
    const priceBefore = product.originalPrice;
    const priceAfter = product.discountPrice;
    const imgsrc = product.imgsrc;
    for (const color in product.datacolordetails) {
      const productInfo = product.datacolordetails[color];
      const rowData = `The Frankie Shop,${productName},${color},"${productInfo[1]}",${productInfo[0]},${availableSizes},"${imgsrc}",${priceBefore},${priceAfter}\n`;
      log(rowData);
      csvData += rowData;
    }
  }

  fs.writeFileSync("frankie_product_data.csv", csvData, "utf8");

  console.log("CSV file saved successfully as frankie_product_data.csv");
  await browser.close();
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 35;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        const productElements = document.querySelectorAll("li.clc-List_Item");
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
