// https://shop.mango.com/us/en/c/women/sale/see-all_8c4e3ec

// https://shop.mango.com/assets/rcs/pics/static/T7/fotos/outfit/S/77052918_05-99999999_01.jpg?ts=1718798647463&im=SmartCrop,width=721,height=1009.4&imdensity=1
// https://shop.mango.com/assets/rcs/pics/static/T7/fotos/S/77052918_05_B.jpg?ts=1715009717430&im=SmartCrop,width=721,height=1009.4&imdensity=1
// https://shop.mango.com/assets/rcs/pics/static/T7/fotos/S/77052918_56_B.jpg?ts=1715006126076&im=SmartCrop,width=721,height=1009.4&imdensity=1

const puppeteer = require("puppeteer");
const fs = require("fs");

async function getUrlFromSrcset(srcset, width) {
  const urls = srcset.split(",").map((item) => item.trim());
  for (const url of urls) {
    if (url.includes(`${width}w`)) {
      return url.split(" ")[0]; // Extract the URL part
    }
  }
  return null;
}

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
  const nameElement = await element.$("p.ProductTitle_productTitle___cM9O");
  let name = null;
  let item_id = null;
  if (nameElement) {
    name = await nameElement.evaluate((node) => node.innerText);
    console.log(name);
    item_id = await convertToAlternatingNumbersAndAlphabets(name);
  } else {
    console.warn("nameElement is null");
  }
  const datacolordetails = {};
  const urlElement = await element.$("a");
  if (urlElement) {
    productURL = await urlElement.evaluate((node) => node.getAttribute("href"));
  }
  console.log(productURL);
  const divs = await element.$$("div.ProductImage_imageWrapper__dcoT9");
  let imgURL = null;
  for (const div of divs) {
    const imgHandles = await div.$$("img");
    for (const imgHandle of imgHandles) {
      const altText = await imgHandle.evaluate((img) =>
        img.getAttribute("alt")
      );
      if (altText && altText.includes("without model")) {
        const imgURLtag = await imgHandle.evaluate((img) =>
          img.getAttribute("srcset")
        );
        function getUrlFromSrcset(srcset, width) {
          const regex = new RegExp(`(https[^\\s]+)\\s${width}w`);
          const match = regex.exec(srcset);
          return match ? match[1] : null;
        }
        imgURL = getUrlFromSrcset(imgURLtag, 100);
        break;
      }
    }
  }
  console.log(imgURL);

  let colorName = null;
  const metaElement = await element.$('meta[itemprop="name"]');
  if (metaElement) {
    metaContent = await metaElement.evaluate((node) =>
      node.getAttribute("content")
    );
    const extractColor = (text) => {
      const match = text.match(/-\s*([^\-]+)$/);
      return match ? match[1].trim() : null;
    };
    colorName = extractColor(metaContent);
  } else {
    colorName = "ONE_COLOR";
  }
  const swatchElements = await element.$$(
    "button.ColorPicker_colorButton__q_ZZW.ColorPicker_selected__llTv6"
  );
  function getUrlFromSrcset(srcset, width) {
    const regex = new RegExp(`(https[^\\s]+)\\s${width}w`);
    const match = regex.exec(srcset);
    return match ? match[1] : null;
  }
  let swatchUrl = null;
  let unique_color_id = null;
  unique_color_id = await convertToAlternatingNumbersAndAlphabets(colorName);
  if (swatchElements.length === 0) {
    colorname_details = [unique_color_id, productURL, swatchUrl, imgURL];
    console.log("not found", colorname_details);
    datacolordetails[colorName] = colorname_details;
    console.log(datacolordetails);
  } else {
    for (const swatchElement of swatchElements) {
      const anchorElement = await swatchElement.$("span img");
      const srcset = await anchorElement.evaluate((node) =>
        node.getAttribute("srcset")
      );
      swatchUrl = getUrlFromSrcset(srcset, "10");
      colorname_details = [unique_color_id, productURL, swatchUrl, imgURL];
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
  await page.goto("https://shop.mango.com/us/en/c/women/sale/see-all_8c4e3ec");
  await page.setViewport({
    width: 1200,
    height: 800,
  });
  await autoScroll(page);
  // infinite pagination scroll

  // for each item scrape
  const allResults = [];
  const productElements = await page.$$("ul.Grid_grid__fLhp5 li");
  console.log(`Found ${productElements.length} items`);

  for (const productElement of productElements) {
    const productResult = await scrapeProduct(productElement);
    allResults.push(productResult);
  }
  console.log(JSON.stringify(allResults, null, 2));

  // putting data into csv sheet
  let csvData =
    "Brand,Product Name,Color,Product URL,Unique Color ID,Swatch Image URL,Scraped Image URL\n";

  for (const product of allResults) {
    const productName = product.name;
    const productId = product.unique_product_id;

    for (const color in product.datacolordetails) {
      const productInfo = product.datacolordetails[color];
      if (productName) {
        const rowData = `Mango,${productName},${color},"${productInfo[1]}",${productInfo[0]},${productInfo[2]},"${productInfo[3]}"\n`;
        csvData += rowData;
      }
    }
  }

  fs.writeFileSync("mango_product_data.csv", csvData, "utf8");
  console.log("CSV file saved successfully as mango_data.csv");

  await browser.close();
}

main();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 50;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        const productElements = document.querySelectorAll(
          "ul.Grid_grid__fLhp5 li"
        );
        console.log(productElements.length);
        if (
          productElements.length >= 10 ||
          totalHeight >= scrollHeight - window.innerHeight
        ) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
