const cheerio = require('cheerio')
const fetch = require('node-fetch')
const axios = require('axios')

const url = 'https://www.instant-gaming.com/en/search/?query=sekiro'
const iphone8 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A5370a Safari/604.1'

async function webRequest(urls) {
    try {

        const res = await fetch(url)
        const html = await res.text()
        //console.log(html);
        const $ = cheerio.load(html);
        const childrens = $('div[class="search"]').children();
        const list = [];
        const ss = childrens.map(function(i, el) {
            // this === el
            list.push($(el).attr('data-price'))
          })
          const region =$(childrens).find($('.mainshadow').attr('data-region'))
          //console.log('ENTERO', ss[0]);
          console.log('ddddddddddddddddddddddd...................', list);
        
        //   ss.map(res=>{

        //       console.log('content', $(res).contents().get());
        //   })


    } catch (err) {
        console.log('ERROR> ', err);
    }


}

webRequest()
