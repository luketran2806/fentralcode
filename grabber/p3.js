// Aritzia ✅ ✅
// Abercombie & fitch  ✅ ✅
// The frankie shop ✅ ✅
// reformation ✅
// sandro ✅ ✅
// maje ✅ ✅
// Oak & Fort ✅
// alo ✅ ✅
// mango ✅

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
      const productUrl = product["Product URL"]; // Assuming this field exists in the CSV

      await page.goto(productUrl, { waitUntil: "networkidle2" });

      switch (product["Brand"].toLowerCase()) {
        case "frankie":
          await page
            .waitForSelector(".prd-Detail_Grid", { timeout: 5000 })
            .catch(() => {
              console.log(`Dropdown not found for ${product["Product Name"]}`);
              return;
            });
          const sizeOptionsFrankie = await page.evaluate(() => {
            const sizeSelect = document.querySelector(
              ".prd-DetailVariants_Rows"
            );
            if (!sizeSelect) return null;
            const sizeOptions = Array.from(
              sizeSelect.querySelectorAll("option")
            ).slice(1);
            return sizeOptions.map((option) => {
              const sizeText = option.innerText.trim().split("\n")[0];
              const isUnavailable = option.innerText.includes("Notify me");
              const status = isUnavailable ? "Sold Out" : "Available";
              return { sizeText, status };
            });
          });
          const availableSizesFrankie = sizeOptionsFrankie
            .filter(({ status }) => status !== "Sold Out")
            .map(({ sizeText }) => `${sizeText} - Available`);
          product.sizes =
            `"${availableSizesFrankie.join(", ")}"` || "No available sizes";

          const pricesFrankie = await page.evaluate(() => {
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
          product.standardPrice = pricesFrankie?.standardPrice || "N/A";
          product.salesPrice = pricesFrankie?.salesPrice || "N/A";
          break;

        case "aritzia":
          await page
            .waitForSelector(".js-dropdowns", { timeout: 5000 })
            .catch(() => {
              console.log(`Dropdown not found for ${product["Product Name"]}`);
              return;
            });
          const sizeOptionsAritzia = await page.evaluate(() => {
            const dropdownDiv = document.querySelector(
              ".ar-dropdown-wrapper.js-swatches__size"
            );
            if (!dropdownDiv) return null;
            const sizeOptions = dropdownDiv.querySelectorAll(
              ".ar-dropdown__option-anchor"
            );
            if (!sizeOptions.length) return null;
            return Array.from(sizeOptions).map((option) => {
              const spans = option.querySelectorAll("span");
              return Array.from(spans).map((span) => span.textContent.trim());
            });
          });
          const availableSizesAritzia = sizeOptionsAritzia
            .filter(([size, status]) => !status.includes("Sold Out"))
            .map(([size]) => `${size} - Available`);
          product.sizes =
            `"${availableSizesAritzia.join(", ")}"` || "No available sizes";

          const pricesAritzia = await page.evaluate(() => {
            const priceDiv = document.querySelector(".product-price");
            if (!priceDiv) return null;
            const standardPrice =
              priceDiv
                .querySelector(".price-standard span")
                ?.innerText?.trim() || "N/A";
            const salesPrice =
              priceDiv.querySelector(".price-sales span")?.innerText?.trim() ||
              "N/A";
            return { standardPrice, salesPrice };
          });
          product.standardPrice = pricesAritzia?.standardPrice || "N/A";
          product.salesPrice = pricesAritzia?.salesPrice || "N/A";
          break;

        case "abercombie":
          await page
            .waitForSelector(".sitg-input-outer-wrapper", { timeout: 5000 })
            .catch(() => {
              console.log(`Dropdown not found for ${product["Product Name"]}`);
              return;
            });
          const sizeOptionsAbercombie = await page.evaluate(() => {
            const sizeWrappers = document.querySelectorAll(
              ".sitg-input-inner-wrapper"
            );
            if (!sizeWrappers.length) return null;
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
          const availableSizesAbercombie = sizeOptionsAbercombie
            .filter(({ status }) => status !== "Sold Out")
            .map(({ sizeText }) => `${sizeText} - Available`);
          product.sizes =
            `"${availableSizesAbercombie.join(", ")}"` || "No available sizes";

          const pricesAbercombie = await page.evaluate(() => {
            const priceDiv = document.querySelector(
              "[data-testid='product-price-text-wrapper']"
            );
            if (!priceDiv) return null;
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
          product.standardPrice = pricesAbercombie?.standardPrice || "N/A";
          product.salesPrice = pricesAbercombie?.salesPrice || "N/A";
          break;

        case "alo":
          await page
            .waitForSelector(".product__data", { timeout: 5000 })
            .catch(() => {
              console.log(`Dropdown not found for ${product["Product Name"]}`);
              return;
            });
          const sizeOptionsAlo = await page.evaluate(() => {
            const sizeItems = document.querySelectorAll(
              ".button-size-selector__list .button-size-selector__item"
            );
            if (!sizeItems.length) return null;
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
          const availableSizesAlo = sizeOptionsAlo
            .filter(({ status }) => status !== "Sold Out")
            .map(({ sizeText }) => `${sizeText} - Available`);
          product.sizes =
            `"${availableSizesAlo.join(", ")}"` || "No available sizes";

          const pricesAlo = await page.evaluate(() => {
            const priceDiv = document.querySelector(".Price");
            if (!priceDiv) return null;
            const salesPrice =
              priceDiv.querySelector(".sale__price")?.innerText?.trim() ||
              "N/A";
            const standardPrice =
              priceDiv
                .querySelector(".product__price--sale s")
                ?.innerText?.trim() || "N/A";
            return { standardPrice, salesPrice };
          });
          product.standardPrice = pricesAlo?.standardPrice || "N/A";
          product.salesPrice = pricesAlo?.salesPrice || "N/A";
          break;

        case "maje":
          await page
            .waitForSelector(".product-details-contianer", { timeout: 5000 })
            .catch(() => {
              console.log(`Dropdown not found for ${product["Product Name"]}`);
              return;
            });
          const sizeOptionsMaje = await page.evaluate(() => {
            const sizeList = document.querySelectorAll(".option-item");
            if (!sizeList.length) return null; // If no sizes found
            const sizes = Array.from(sizeList).map((item) => {
              const sizeText = item
                .querySelector(".option-value")
                ?.textContent.trim();
              const notificationvalue = item.textContent.trim();
              const isUnavailable = notificationvalue.includes("notified");
              const status = isUnavailable ? "Sold Out" : "Available";
              return { sizeText, status };
            });
            return sizes.filter(({ sizeText }) => sizeText); // Filter out undefined sizeText
          });
          const availableSizesMaje = sizeOptionsMaje
            .filter(({ status }) => status !== "Sold Out") // Filter out sold-out sizes
            .map(({ sizeText }) => `${sizeText} - Available`); // Format as 'Size - Available'
          product.sizes = availableSizesMaje.length
            ? `"${availableSizesMaje.join(", ")}"`
            : "No available sizes";
          const pricesMaje = await page.evaluate(() => {
            const priceDiv = document.querySelector(
              ".prices-add-to-cart-actions"
            );
            if (!priceDiv) return null;
            const standardPrice =
              priceDiv
                .querySelector(".strike-through .value")
                ?.getAttribute("content") || "N/A";
            const salesPrice =
              priceDiv
                .querySelector(".sales .value")
                ?.getAttribute("content") || "N/A";

            return { standardPrice, salesPrice };
          });

          product.standardPrice = pricesMaje?.standardPrice || "N/A";
          product.salesPrice = pricesMaje?.salesPrice || "N/A";
          break;
        case "sandro":
          await page
            .waitForSelector(".product-details-contianer", { timeout: 5000 })
            .catch(() => {
              console.log(`Dropdown not found for ${product["Product Name"]}`);
              return;
            });
          const sizeOptionsSandro = await page.evaluate(() => {
            const sizeList = document.querySelectorAll(".option-item");
            if (!sizeList.length) return null; // If no sizes found
            const sizes = Array.from(sizeList).map((item) => {
              const sizeText = item
                .querySelector(".option-value")
                ?.textContent.trim();
              const notificationvalue = item.textContent.trim();
              const isUnavailable = notificationvalue.includes("notification");
              const status = isUnavailable ? "Sold Out" : "Available";
              return { sizeText, status };
            });
            return sizes.filter(({ sizeText }) => sizeText); // Filter out undefined sizeText
          });
          const availableSizesSandro = sizeOptionsSandro
            .filter(({ status }) => status !== "Sold Out") // Filter out sold-out sizes
            .map(({ sizeText }) => `${sizeText} - Available`); // Format as 'Size - Available'
          product.sizes = availableSizesSandro.length
            ? `"${availableSizesSandro.join(", ")}"`
            : "No available sizes";
          const pricesSandro = await page.evaluate(() => {
            const priceDiv = document.querySelector(
              ".prices-add-to-cart-actions"
            );
            if (!priceDiv) return null;
            const standardPrice =
              priceDiv
                .querySelector(".strike-through .value")
                ?.getAttribute("content") || "N/A";
            const salesPrice =
              priceDiv
                .querySelector(".sales .value")
                ?.getAttribute("content") || "N/A";

            return { standardPrice, salesPrice };
          });

          product.standardPrice = pricesSandro?.standardPrice || "N/A";
          product.salesPrice = pricesSandro?.salesPrice || "N/A";
          break;
        case "oakandfort":
          break;
        case "mango":
          break;
        default:
          console.log(`No processing for brand: ${product["Brand"]}`);
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
