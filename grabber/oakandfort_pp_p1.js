// Oak & Fort

// https://oakandfort.com/collections/womens-sale?shopify_products%5Bpage%5D=2&shopify_products%5BrefinementList%5D%5Bmeta.custom.availability%5D%5B0%5D=Available%20Online

// https://oakandfort.com/collections/womens-sale?shopify_products%5Bpage%5D=7&shopify_products%5BrefinementList%5D%5Bmeta.custom.availability%5D%5B0%5D=Available%20Online

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
    "https://oakandfort.com/collections/womens-sale?shopify_products%5Bpage%5D=2&shopify_products%5BrefinementList%5D%5Bmeta.custom.availability%5D%5B0%5D=Available%20Online&shopify_products%5Brange%5D%5Bprice%5D=25%3A"
  );

  await page.setViewport({
    width: 1200,
    height: 800,
  });

  await autoScrollAndLoadMore(page);

  const scrapeProduct = async (element) => {
    const nameElement = await element.$("h2.collection-item__title a");
    const name = await nameElement.evaluate((node) => node.innerText);
    const item_id = convertToAlternatingNumbersAndAlphabets(name);
    let productURL = await nameElement
      .getProperty("href")
      .then((hrefProp) => hrefProp.jsonValue());

    const datacolordetails = {};
    const swatchElements = await element.$$("div.product-option-item--swatch");
    console.log(swatchElements.length);
    for (const swatchElement of swatchElements) {
      const colorname = await swatchElement.evaluate((el) =>
        el.getAttribute("data-value")
      );
      const unique_color_id =
        convertToAlternatingNumbersAndAlphabets(colorname);
      const swatch_url = await swatchElement.$eval(
        "div.product-option-item__swatch",
        (el) => {
          const style = el.getAttribute("style");
          const urlMatch = style.match(/url\((.*?)\)/);
          return urlMatch ? urlMatch[1].replace(/['"]/g, "") : null;
        }
      );

      console.log(swatch_url);
      //   let prodimageurl = await page.evaluate((colorname) => {
      //     const imageDiv = document.querySelector(`div.collection-item__image[data-color="${colorname}"] img.collection-item__primary-image`);
      //     return imageDiv ? imageDiv.getAttribute('src') : null;
      //     }, colorname);
      //     prodimageurl = 'https:' + prodimageurl.replace(/width=\d+/, 'width=540');

      const { img_src, variant_id } = await element.evaluate(
        async (element, colorname) => {
          // Use element.querySelector inside evaluate to find within the element's context
          const imageDiv = element.querySelector(
            `div.collection-item__image[data-color="${colorname}"]`
          );
          console.log("Image Div:", imageDiv); // Debugging output

          const imgElement = imageDiv
            ? imageDiv.querySelector("img.collection-item__primary-image")
            : null;
          const img_src = imgElement ? imgElement.getAttribute("src") : null;
          const variant_id = imageDiv
            ? imageDiv.getAttribute("data-variant-id")
            : null;
          return { img_src, variant_id };
        },
        colorname
      );

      // Prepend https: and change width to 540
      let modified_img_src = img_src
        ? "https:" + img_src.replace(/width=\d+/, "width=540")
        : null;

      // Construct the product URL using the variant ID
      product_url = productURL + `?variant=${variant_id}`;

      const colorname_details = [
        unique_color_id,
        product_url,
        swatch_url,
        modified_img_src,
      ];
      datacolordetails[colorname] = colorname_details;
    }

    // const originalPrice = await element.$eval('span.price__original span.price--reduced', el => el.textContent.trim().replace(/,/g, ''));
    // const discountPrice = await element.$eval('div.price__sales span.price--reduced', el => el.textContent.trim().replace(/,/g, ''));
    return {
      item_id,
      name,
      datacolordetails,
    };
  };

  const productElements = await page.$$("div.collection__grid-item");
  console.log(`${productElements.length} items`);

  const allResults = [];
  for (const productElement of productElements) {
    const productResult = await scrapeProduct(productElement);
    allResults.push(productResult);
  }

  console.log(JSON.stringify(allResults, null, 2));
  let csvData =
    "Brand,Product Name,Color,Product URL,Unique Color ID, Swatch Image URL,Scraped Image URL\n";

  for (const product of allResults) {
    const productName = product.name;
    // const priceBefore = product.originalPrice;
    // const priceAfter = product.discountPrice;
    for (const color in product.datacolordetails) {
      const productInfo = product.datacolordetails[color];
      const rowData = `Oak and Fort,${productName},${color},"${productInfo[1]}",${productInfo[0]},${productInfo[2]},"${productInfo[3]}"\n`;
      log(rowData);
      csvData += rowData;
    }
  }

  fs.writeFileSync("oakandfort_product_data.csv", csvData, "utf8");
  console.log("CSV file saved successfully as oakandfort_product_data.csv");
  await browser.close();
})();

async function autoScrollAndLoadMore(page) {
  let lastItemCount = 0;

  while (true) {
    await page.evaluate(async () => {
      window.scrollBy(0, window.innerHeight);
    });

    const productElements = await page.$$("div.collection__grid-item");
    const itemCount = productElements.length;

    if (itemCount > lastItemCount) {
      lastItemCount = itemCount;
      await page.waitForTimeout(1000); // Give time for new items to load
    } else if (itemCount < 100) {
      const loadMoreButton = await page.$("div.collection__footer button.btn");
      if (loadMoreButton) {
        await loadMoreButton.click();
        await page.waitForTimeout(2000); // Wait for more items to load
      } else {
        break; // Exit if no load more button is found
      }
    } else {
      break;
    }
  }
}
