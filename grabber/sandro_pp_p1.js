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
  const nameElement = await element.$("h2.mb-0 span");
  let name = null;
  let item_id = null;
  if (nameElement) {
    name = await nameElement.evaluate((node) => node.innerText);
    item_id = await convertToAlternatingNumbersAndAlphabets(name);
  } else {
    console.warn("nameElement is null");
  }
  const imageSrc = await element.evaluate((el) => {
    const imgElement = el.querySelector("img");
    if (imgElement) {
      console.log("image element found");
    }
    return imgElement ? imgElement.getAttribute("src") : null;
  });
  const swatchprodimg = "N/A";
  const datacolordetails = {};
  // const colorElement = await element.$('p.product-color');
  const anchorElement = await element.$("div.carousel-inner a.js-tile-anchor");
  const swatchimgsrc = await element.evaluate((el) => {
    let imgElement = el.querySelector("div.selected span img.swatch");
    if (!imgElement) {
      // console.log("'div.selected' not found, falling back to 'div span img.swatch'");
      imgElement = el.querySelector("div span img.swatch");
    } else {
      console.log("Image element found inside 'div.selected span'");
    }
    return imgElement ? imgElement.getAttribute("src") : null;
  });
  const colorName = await element.evaluate((el) => {
    let imgElement = el.querySelector("div.selected span img.swatch");
    if (!imgElement) {
      // console.log("'div.selected' not found, falling back to 'div span img.swatch'");
      imgElement = el.querySelector("div span img.swatch");
    } else {
      console.log("Image element found inside 'div.selected span'");
    }
    return imgElement ? imgElement.alt : null;
  });
  console.log(colorName);
  const unique_color_id = await convertToAlternatingNumbersAndAlphabets(
    colorName
  );
  const productURLfound = await anchorElement.evaluate((node) =>
    node.getAttribute("href")
  );
  const productURL = `https://us.sandro-paris.com${productURLfound}`;
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
  // Launch the Puppeteer browser
  const browser = await puppeteer.launch({ headless: false }); // Set headless to false to see the browser in action
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  // Navigate to the Sandro Paris website
  await page.goto(
    "https://us.sandro-paris.com/en/womens/sale/see-all/?prefn1=smcp_subFamily&prefv1=T-Shirts%7CTops%20%26%20Shirts%7CSweaters%20%26%20Cardigans%7CDresses%7CSkirts%7CPants%20%26%20Shorts%7CJeans%7CJackets%20%26%20Blazers%7CCoats%7CBodysuit&start=0&sz=160",
    { waitUntil: "domcontentloaded" }
  );

  //   await page.waitForSelector('button[data-panel-heading="Sort"]', { visible: true });
  //   await page.click('button[data-panel-heading="Sort"]');

  //   // Wait for the input element to be visible
  //   await page.waitForSelector('input#most-popular', { visible: true });

  //   // Click the input element
  //   await page.click('input#most-popular');

  //   console.log('Clicked on the "Most Popular" input element.');

  //   // Close the browser after a short delay to see the result
  //   await new Promise(r => setTimeout(r, 5000));

  const allResults = [];
  const productElements = await page.$$("div.col-6.col-sm-3");
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
      const rowData = `Sandro,${productName},${color},"${productInfo[1]}",${productInfo[0]},${productInfo[2]},"${productimgurl}"\n`;
      csvData += rowData;
    }
  }

  fs.writeFileSync("sandro_product_data.csv", csvData, "utf8");
  console.log("CSV file saved successfully as sandro_library.csv");

  await browser.close();
}

main();

// if < 100 items or see more button visible click
