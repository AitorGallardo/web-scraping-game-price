const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

require('dotenv').config();


const url = 'https://www.g2a.com/search?query=sekiro&sort=price-lowest-first';

async function sendEmail (title = '', message = '') {

  title = title.length > 0 ? title : 'SEKIRO ESTA POR DEBAJO DE LOS 40 PAVOS';
  message.length > 0 ? message : 'DALEDALEDALE';

  try {
    let transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_USER, // generated ethereal user
        pass: process.env.MAIL_PASSWORD, // generated ethereal password
      },
    });

    var mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_TO,
      subject: title.length > 0 ? title : 'SEKIRO ESTA POR DEBAJO DE LOS 40 PAVOS',
      text: message.length > 0 ? message : 'DALEDALEDALE'
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (err) {
    console.log(err)
  }
}

async function startScraping(url) {

  try {

    async function launchAndGoToPage() {
      const maxTries = 5;
      // some times we get 'ERR_NETWORK_CHANGED' on heroku, thats why we do more attempts in order to dont wait till the script runs again
      for (let tries = 0; tries < maxTries; tries++) 
        try {
          var browser = await puppeteer.launch({ args: ['--no-sandbox'] }); // args needed to run properly on heroku
          const page = await browser.newPage();
          const mozzilla_windows_userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0';
          await page.setUserAgent(mozzilla_windows_userAgent);
          await page.goto(url);
          console.log(tries);
          return {browser, page};

        } catch (err) {
          if (tries === 4) {
            if(browser) browser.close();
            throw new Error('Not posible to launchPuppeter >> ', err);
          }
          console.log(`>>LaunchPupperAndGoToPageFunctionCatch>>Attempt N: ${tries}` , err)
        }
    }

    async function passCookieBanner(page) {
      const cookieBannerMaybeLater_buttonClass = 'button.button.button--size-large.button--type-transparent';
      const cookieBannerMaybeLater_button = await page.$(cookieBannerMaybeLater_buttonClass);
      if (cookieBannerMaybeLater_button) {
        await cookieBannerMaybeLater_button.click();
      }
    }

    const getAllGameCardElements = async () => {

      const card_body_nestedClass = 'ul.products-grid div.Card__body';
      const all_card_elements = await page.$$(card_body_nestedClass);
      return all_card_elements;
    }

    const getTextFromDomElement = async (el, element_class) => {
      const element = await el.$(element_class);
      const elementTitle = await element.getProperty('textContent');
      const elementTitleTxt = await elementTitle.jsonValue();
      return elementTitleTxt;
    }

    const getCheapestGame = async (all_card_elements) => {

      const interested_game_regions = ['EUROPE', 'GLOBAL'];
      const gameTitleElementClass = 'h3.Card__title a';

      for (let card of all_card_elements) {
        const gameTitleTxt = await getTextFromDomElement(card, gameTitleElementClass);
        if (interested_game_regions.some(e => gameTitleTxt.includes(e))) {
          return card;
        }
      }
    }

    const getGamePrice = async (e) => {
      const elementClass = 'span.Card__price-cost.price';
      const price = await getTextFromDomElement(e, elementClass);
      const integerPrice = parseInt(price.split(" ")[0])
      return integerPrice;
    }

    const { browser, page } = await launchAndGoToPage();
    await passCookieBanner(page);
    const all_card_elements = await getAllGameCardElements(page);
    const selectedGame = await getCheapestGame(all_card_elements);
    const gamePrice = await getGamePrice(selectedGame);
    await browser.close();

    const maxPrice = 30;

    if (gamePrice < maxPrice) {
      await sendEmail()
    } else {
      const message = `Current Price ${gamePrice}€`
      console.log(message);
      await sendEmail('GAME SCRIPT UP', message);
    }

  } catch (err) {
    console.log('ERROR >>> ', err);
    await sendEmail('GAME SCRIPT ERROR', err);
  }
}

startScraping(url);
