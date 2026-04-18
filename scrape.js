const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const axios = require("axios");
const fs = require("fs");

puppeteer.use(StealthPlugin());

(async () => {

  const browser = await puppeteer.launch({
    headless: false,
  });

  var page = await browser.pages();
  page = page[0];

  await page.goto("https://csgoskins.gg/categories/weapon-case");

  //console.log(await page.content());

  const parentItems = await page.$$eval(".mx-auto.max-h-\\[237px\\]", 
    pitems => pitems.map(pitem => {
      return {
        url: pitem?.getAttribute("src") || null,
        name: pitem?.getAttribute("alt") || null
      }
    }
    ));

  for (let i = 0; i < parentItems.length; i++){
    const url = parentItems[i].url;
    const name = parentItems[i].name;
  
    const safeName = name.replace(/[|:]/g, ".");
    

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "image/avif,image/webp,image/,/*"
      }
    });

    const data = Buffer.from(response.data);

    const dirPath = "../csmultisell/public/weaponcase/";
    const filePath = dirPath + safeName + ".webp";

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, data);
    console.log(`File created: ${filePath}`);
  }



  await page.close()
  await browser.close()
})();