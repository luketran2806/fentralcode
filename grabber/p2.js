const fs = require("fs");
const csv = require("csv-parser");
const puppeteer = require("puppeteer");
const results = [];
fs.createReadStream("sample.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    for (const product of results) {
      const productUrl = product["Product URL"];
      console.log(`Navigating to: ${productUrl}`);
      if (product["Brand"].toLowerCase() === "frankie") {
        await page.goto(productUrl, { waitUntil: "networkidle2" });
        await page
          .waitForSelector(".prd-Detail_Grid", { timeout: 5000 })
          .catch(() => {
            console.log(`Dropdown not found for ${product["Product Name"]}`);
            return;
          });
        const sizeOptions = await page.evaluate(() => {
          const sizeSelect = document.querySelector(".prd-DetailVariants_Rows");
          if (!sizeSelect) return null; // If no sizes found
          const sizeOptions = Array.from(
            sizeSelect.querySelectorAll("option")
          ).slice(1);
          return sizeOptions.map((option) => {
            const sizeText = option.innerText.trim().split("\n")[0]; // Get size text (before the 'Notify me' text)
            const isUnavailable = option.innerText.includes("Notify me"); // Check if 'Notify me' is in the text
            const status = isUnavailable ? "Sold Out" : "Available";

            return { sizeText, status };
          });
        });
        const availableSizes = sizeOptions
          .filter(({ status }) => status !== "Sold Out") // Filter out sold-out sizes
          .map(({ sizeText, status }) => `${sizeText} - ${status}`); // Format as 'Size - Status'
        const formattedSizes = `"${availableSizes.join(", ")}"`;
        console.log(formattedSizes);
        product.sizes = formattedSizes || "No available sizes";
        const prices = await page.evaluate(() => {
          const priceDiv = document.querySelector(".prd-DetailPrice");
          if (!priceDiv) return null;
          const salesPrice =
            priceDiv
              .querySelector(".prd-DetailPrice_Price[data-product-price]")
              ?.childNodes[2]?.textContent?.trim() || "N/A";
          const standardPrice =
            priceDiv
              .querySelector(
                ".prd-DetailPrice_ComparePrice[data-product-price-compare]"
              )
              ?.childNodes[2]?.textContent?.trim() || "N/A";
          return { standardPrice, salesPrice };
        });
        product.standardPrice = prices?.standardPrice || "N/A";
        product.salesPrice = prices?.salesPrice || "N/A";
      }

      if (product["Brand"].toLowerCase() === "aritzia") {
        await page.goto(productUrl, { waitUntil: "networkidle2" });
        await page
          .waitForSelector(".js-dropdowns", { timeout: 5000 })
          .catch(() => {
            console.log(`Dropdown not found for ${product["Product Name"]}`);
            return;
          });
        const sizeOptions = await page.evaluate(() => {
          const dropdownDiv = document.querySelector(
            ".ar-dropdown-wrapper.js-swatches__size"
          );
          if (!dropdownDiv) return null; // If the .js-dropdowns div is not found
          const sizeOptions = dropdownDiv.querySelectorAll(
            ".ar-dropdown__option-anchor"
          );
          if (!sizeOptions.length) return null; // Check if options exist
          return Array.from(sizeOptions).map((option) => {
            const spans = option.querySelectorAll("span"); // Select all span elements within the option
            return Array.from(spans).map((span) => span.textContent.trim()); // Use textContent to get all text, then trim
          });
        });
        const availableSizes = sizeOptions
          .filter(([size, status]) => !status.includes("Sold Out")) // Filter out sold out sizes
          .map(([size, status]) => `${size} - ${status}`); // Format as 'Size - Status'
        const formattedSizes = `"${availableSizes.join(", ")}"`;

        product.sizes = formattedSizes || "No available sizes";

        const prices = await page.evaluate(() => {
          const priceDiv = document.querySelector(".product-price");
          if (!priceDiv) return null;

          const standardPrice =
            priceDiv.querySelector(".price-standard span")?.innerText?.trim() ||
            "N/A"; // Get standard price
          const salesPrice =
            priceDiv.querySelector(".price-sales span")?.innerText?.trim() ||
            "N/A"; // Get sales price

          return { standardPrice, salesPrice };
        });

        product.standardPrice = prices?.standardPrice || "N/A";
        product.salesPrice = prices?.salesPrice || "N/A";
      }

      if (product["Brand"].toLowerCase() === "abercombie") {
        await page.goto(productUrl, { waitUntil: "networkidle2" });
        await page
          .waitForSelector(".sitg-input-outer-wrapper", { timeout: 5000 })
          .catch(() => {
            console.log(`Dropdown not found for ${product["Product Name"]}`);
            return;
          });
        const sizeOptions = await page.evaluate(() => {
          const sizeWrappers = document.querySelectorAll(
            ".sitg-input-inner-wrapper"
          );
          if (!sizeWrappers.length) return null; // If no sizes found

          return Array.from(sizeWrappers).map((wrapper) => {
            const sizeText = wrapper
              .querySelector(".sitg-label-text")
              ?.textContent?.trim();
            const isUnavailable =
              wrapper.getAttribute("data-state") === "disabled" ||
              wrapper.getAttribute("data-variant") === "unavailable";
            const status = isUnavailable ? "Sold Out" : "Available";
            return { sizeText, status };
          });
        });
        const availableSizes = sizeOptions
          .filter(({ status }) => status !== "Sold Out") // Filter out sold out sizes
          .map(({ sizeText, status }) => `${sizeText} - ${status}`); // Format as 'Size - Status'
        const formattedSizes = `"${availableSizes.join(", ")}"`;
        product.sizes = formattedSizes || "No available sizes";
        const prices = await page.evaluate(() => {
          const priceDiv = document.querySelector(
            "[data-testid='product-price-text-wrapper']"
          );
          if (!priceDiv) return null; // If no price div is found
          const standardPrice =
            priceDiv
              .querySelector("[data-variant='original']")
              ?.textContent?.trim() || "N/A";
          const salesPrice =
            priceDiv
              .querySelector("[data-variant='discount']")
              ?.textContent?.trim() || "N/A";

          return { standardPrice, salesPrice };
        });

        product.standardPrice = prices?.standardPrice || "N/A";
        product.salesPrice = prices?.salesPrice || "N/A";
      }
      if (product["Brand"].toLowerCase() === "alo") {
        await page.goto(productUrl, { waitUntil: "networkidle2" });
        await page
          .waitForSelector(".product__data", { timeout: 5000 })
          .catch(() => {
            console.log(`Dropdown not found for ${product["Product Name"]}`);
            return;
          });
        const sizeOptions = await page.evaluate(() => {
          const sizeItems = document.querySelectorAll(
            ".button-size-selector__list .button-size-selector__item"
          );

          if (!sizeItems.length) return null; // If no sizes found

          return Array.from(sizeItems).map((item) => {
            const sizeText = item
              .querySelector("button span")
              ?.textContent?.trim();
            const isOutOfStock = item
              .querySelector("button")
              .classList.contains("out-of-stock");
            const status = isOutOfStock ? "Sold Out" : "Available";

            return { sizeText, status };
          });
        });
        const availableSizes = sizeOptions
          .filter(({ status }) => status !== "Sold Out") // Filter out sold-out sizes
          .map(({ sizeText, status }) => `${sizeText} - ${status}`); // Format as 'Size - Status'

        const formattedSizes = `"${availableSizes.join(", ")}"`;
        console.log(formattedSizes);
        product.sizes = formattedSizes || "No available sizes";

        const prices = await page.evaluate(() => {
          const priceDiv = document.querySelector(".Price");
          if (!priceDiv) return null;
          const salesPrice =
            priceDiv.querySelector(".sale__price")?.innerText?.trim() || "N/A";
          const standardPrice =
            priceDiv
              .querySelector(".product__price--sale s")
              ?.innerText?.trim() || "N/A";

          return { standardPrice, salesPrice };
        });

        product.standardPrice = prices?.standardPrice || "N/A";
        product.salesPrice = prices?.salesPrice || "N/A";
      }
    }
    fs.writeFileSync(
      "updated_sizes.csv",
      [
        "Brand",
        "Product Name",
        "Color",
        "Product URL",
        "Sizes",
        "Standard Price",
        "Sales Price",
      ].join(",") +
        "\n" +
        results
          .map((product) =>
            [
              product["Brand"],
              product["Product Name"],
              product["Color"],
              product["Product URL"],
              product.sizes,
              product.standardPrice,
              product.salesPrice,
            ].join(",")
          )
          .join("\n")
    );

    await browser.close();
  });
