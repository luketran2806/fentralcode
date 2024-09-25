// https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&country=us&proxy_format=protocolipport&format=text&timeout=20000

// grab top 100.

// Aritzia ✅
// Abercombie & fitch  ✅
// The frankie shop ✅
// reformation ✅
// sandro ✅
// maje ✅
// Oak & Fort ✅
// alo ✅
// mango ✅

// add in photos Scraped Image URL for aritizia, aber, reformation

//frank&oak?

// grab top selling or top-rated?

// https://www.aritzia.com/us/en/sale?prefn1=isSale&prefv1=True&prefn2=subDepartment&prefv2=Blazers|Bodysuits|Dresses|Jackets%20&%20Coats|Jumpsuits%20&%20Rompers|Leggings|Pants|Shirts%20&%20Blouses|Shorts|Skirts|Sweaters|T-Shirts%20&%20Tops|Vests&srule=TEST%204%20TOP%20RATED&lastViewed=58

// https://www.abercrombie.com/shop/us/womens-clearance?facet=ads_f36005_ntk_cs%3A%28%22Activewear%22+%22Bodysuits%22+%22Blouses%22+%22Graphic+Tees%22+%22Tees+%26+Tanks%22+%22Shirts%22+%22Hoodies+%26+Sweatshirts%22+%22Sweaters%22+%22Jeans%22+%22Pants%22+%22Sweatpants+%26+Leggings%22+%22Shorts%22+%22Skirts%22+%22Jumpsuits%22+%22Dresses%22+%22Rompers%22+%22Bralettes%22+%22Sleepwear%22+%22Jackets+%26+Coats%22%29&filtered=true&rows=90&sort=metricorderedunits&start=0

// https://thefrankieshop.com/collections/womens-sale?sort_by=best-selling&filter.v.availability=1&filter.p.product_type=Bikini+Bottom&filter.p.product_type=Bikini+Set&filter.p.product_type=Bikini+Top&filter.p.product_type=Blazer&filter.p.product_type=Blouse&filter.p.product_type=Bodysuit&filter.p.product_type=Bralette&filter.p.product_type=Cape&filter.p.product_type=Cardigan&filter.p.product_type=Coat&filter.p.product_type=Dress&filter.p.product_type=Jacket&filter.p.product_type=Jeans&filter.p.product_type=Jumpsuit&filter.p.product_type=Knit+Vest&filter.p.product_type=Leggings&filter.p.product_type=Lingerie&filter.p.product_type=One+Piece&filter.p.product_type=Pants&filter.p.product_type=Romper&filter.p.product_type=Shirt&filter.p.product_type=Shorts&filter.p.product_type=Skirt&filter.p.product_type=Sweater&filter.p.product_type=Sweatpants&filter.p.product_type=Sweatshirt&filter.p.product_type=T-Shirt&filter.p.product_type=Tank&filter.p.product_type=Top&filter.p.product_type=Trench&filter.p.product_type=Vest

// https://www.thereformation.com/sale?pmpt=qualifying&prefn1=subclass&prefv1=Dresses%7CTops%7CJeans%7CJumpsuits%7COne%20Piece%7COuterwear%7CPants%7CShorts%7CSkirts%7CSweaters%7CTwo%20pieces&srule=Best%20of&gtmAction=remove&gtmType=Type&gtmValue=Two%20pieces&categoryFilterRemoved=Type&page=2

// https://us.sandro-paris.com/en/womens/sale/see-all/#packshot

// https://us.maje.com/en/sale-see-all/?start=0&sz=36

// https://oakandfort.com/collections/womens-sale?shopify_products%5BrefinementList%5D%5Bmeta.custom.availability%5D%5B0%5D=Available%20Online

// https://www.aloyoga.com/collections/womens-sale-all?sort_by=best-selling&ProductType=Women%3AOne+Piece%3ABodysuits%2CWomen%3ABras%2CWomen%3AOne+Piece%3ADresses%2CWomen%3AOuterwear%3ACoverups%3AHoodies%2CWomen%3AOuterwear%3AJackets%2CWomen%3ABottoms%3ALeggings%2CWomen%3ATops%3ALong+Sleeves%2CWomen%3AOne+Piece%3AOnesies%2CWomen%3ABottoms%3APants%2CWomen%3AOuterwear%3ACoverups%3APullovers%2CWomen%3ATops%3AShort+Sleeves%2CWomen%3ABottoms%3AShorts%2CWomen%3ABottoms%3ASkirts%2CWomen%3ABottoms%3ASweatpants%2CWomen%3ATops%3ATanks%2CWomen%3AOuterwear%3AVests

//https://shop.mango.com/us/en/c/women/sale/see-all_8c4e3ec

// https://www.frankandoak.com/collections/women-sale?selectedCategories[]=tags%3Acustitem_fao_merch_department%3ATops&selectedCategories[]=tags%3Acustitem_fao_merch_category%3ADresses&selectedCategories[]=tags%3Asize_category%3Ashorts_skirts&selectedCategories[]=tags%3Acustitem_fao_merch_category%3ASkirts&selectedCategories[]=tags%3Acustitem_fao_merch_category%3APants&selectedCategories[]=tags%3Aattributes_hierarchy%3AWomen-Denim%20Pants&selectedCategories[]=tags%3Acustitem_fao_merch_category%3ABlazers&selectedCategories[]=tags%3Acustitem_fao_merch_department%3AOuterwear

// tying it all together data formatting:
// name, url, image

// move all files into archive including the combined_output.csv

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Path to the folder containing your scripts
const folderPath = "./"; // Change this to your target folder if needed
const archiveFolderPath = path.join(folderPath, "archive");

// Ensure the archive folder exists, if not, create it
if (!fs.existsSync(archiveFolderPath)) {
  fs.mkdirSync(archiveFolderPath);
}

// Function to move a file to the archive folder
function moveFile(file) {
  const sourcePath = path.join(folderPath, file);
  const destinationPath = path.join(archiveFolderPath, file);

  fs.rename(sourcePath, destinationPath, (err) => {
    if (err) {
      console.error(`Error moving file ${file} to archive:`, err);
    } else {
      console.log(`${file} moved to archive.`);
    }
  });
}

// Move all existing .csv files first
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  // Filter out only .csv files
  const csvFiles = files.filter((file) => path.extname(file) === ".csv");

  csvFiles.forEach((file) => {
    moveFile(file); // Move each .csv file to archive
  });

  // After moving .csv files, execute .js files
  // executeJSFiles(files);
});

// // Function to execute and move .js files
// function executeJSFiles(files) {
//   // Filter out only .js files, excluding runScripts.js
//   const jsFiles = files.filter(file => path.extname(file) === '.js' && file !== 'runScripts.js');

//   // Execute each .js file
//   jsFiles.forEach(file => {
//     const filePath = path.join(folderPath, file);

//     exec(`node "${filePath}"`, (err, stdout, stderr) => {
//       if (err) {
//         console.error(`Error executing ${file}:`, err);
//         return;
//       }

//       // Log output
//       console.log(`Output of ${file}:`);
//       console.log(stdout);

//       if (stderr) {
//         console.error(`Error in ${file}:`, stderr);
//       }

//       // After execution, move the JS file to the archive
//       moveFile(file);
//     });
//   });
// }

// const { exec } = require('child_process');

const nodePath = "/opt/homebrew/bin/node"; // Replace this with the actual path from 'which node'

const commands = [
  // { name: 'Reformation', command: `${nodePath} reformation/reformation_pp_p1.js` },
  { name: "Frankie", command: `${nodePath} frankie_pp_p1.js` },
  { name: "Abercrombie", command: `${nodePath} aber_pp_p1.js` },
  { name: "Alo", command: `${nodePath} alo_pp_p1.js` },
  { name: "Aritzia", command: `${nodePath} aritzia_pp_p1.js` },
  { name: "Maje", command: `${nodePath} maje_pp_p1.js` },
  { name: "Mango", command: `${nodePath} mango_pp_p1.js` },
  { name: "Oak and Fort", command: `${nodePath} oakandfort_pp_p1.js` },
  { name: "Reformation", command: `${nodePath} reformation_pp_p1.js` },
  { name: "Sandro", command: `${nodePath} sandro_pp_p1.js` },
];

const executeCommands = async () => {
  for (const { name, command } of commands) {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error for ${name}: ${error}`);
        return;
      }
      if (stderr) {
        console.error(`stderr for ${name}: ${stderr}`);
        return;
      }
      console.log(`stdout for ${name}: ${stdout}`);
    });
  }
};

executeCommands();
