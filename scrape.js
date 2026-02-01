const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const axios = require("axios");
const fs = require("fs");

puppeteer.use(StealthPlugin());

(async () => {

  const browser = await puppeteer.launch({
    headless: false,
    targetFilter: target => !!target.url(),
  });

  var page = await browser.pages();
  page = page[0];

  await page.goto("https://csgoskins.gg/containers/paris-2023-contenders-sticker-capsule");

  //console.log(await page.content());

  const cdnLinks = await page.$$eval( ".left-4.right-4.absolute.group.top-\\[140px\\].lazy-hover", 
    links => links.map(link => link.getAttribute("data-lazy-hover-src")))


  const stickerNames = await page.$$eval(".mx-auto.max-h-\\[237px\\]", names => names.map(name => name.getAttribute("alt")))
  
  for (let i = 0; i < cdnLinks.length; i++){
    const url = cdnLinks[i];
    const name = stickerNames[i];
  const safeName = name.replace(/\|/g, ".");

    
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "image/avif,image/webp,image/*,*/*"
      }
    });

    const data = Buffer.from(response.data);

    const dirPath = "./server/data/images/paris2023/contender-sticker";
    const filePath = dirPath + `/${safeName}.webp`;

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, data);
    console.log(`File created: ${filePath}`);
  }



  await page.close()
  await browser.close()
})(); 
