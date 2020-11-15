const cheerio = require('cheerio')
const fetch = require('node-fetch')
const axios = require('axios')




function ElementData(args) {
    this.region = args.region
    this.price = args.price
    this.platform = args.platform
    this.link = args.name
    this.name = args.name
}

async function main(){
    try{
        const url = 'https://www.instant-gaming.com/en/search/?query=sekiro'
        const html = await webRequest(url);
        const $ = cheerio.load(html);
        const div_search_children = getDomTree($);
        const elementsData = getElementsData($, div_search_children);
        console.log(elementsData);
    }catch(err){
        console.log('WASAP',err);
    }
    
}

async function webRequest(url) {
    try {
        const res = await fetch(url)
        const html = await res.text()
        return html
    } catch (err) {
        console.log('WEBERR',err);
    }
}

function getDomTree($){
    return $('div[class="search"]').children();
}

function getElementsData($, div_search_children){
    const elementsData = [];
    div_search_children.map(function (i, el) {
        const obj = {
            region: $(el).attr('data-region'),
            price: $(el).attr('data-price'),
        }
        $(el).children().map((index, element) => {
            const element_class = $(element).attr('class');
            if (element_class.includes('badge')) {
                const platform = element_class.split(' ')[1];
                obj['platform'] = platform;
            }
            if (element_class.includes('cover')) {
                const link = $(element).attr('href');
                obj['link'] = link;
            }
            if (element_class.includes('name')) {
                const name = $(element).html()
                obj['name'] = name;
            }
        })
        elementsData.push(new ElementData(obj))
    })
    return elementsData;
}

main()
