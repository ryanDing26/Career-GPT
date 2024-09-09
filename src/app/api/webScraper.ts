import puppeteer, { ElementHandle } from 'puppeteer';
import { LinkedIn } from '../lib/types';

export const webScraper = {
    async getTop10Connections(keywords: string): Promise<string> {
        // Launch the browser and open a new blank page
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        // Navigate the page to a URL
        await page.goto('https://www.linkedin.com/login');
      
        // Set screen size
        await page.setViewport({width: 1080, height: 1024});
      
        // Type login information into search box
        await page.type('#username', `${process.env.LINKEDIN_LOGIN}`);
        await page.type('', `${process.env.LINKEDIN_PASS}`)
    
        // Click the signin button
        await page.click('.btn__primary--large from__button--floating')
    
        // GPT-4o parses some prompt, takes in the keyword, and if there is a certainty that web scraping can accomplish this prompt, does so by inputting keywords into LinkedIn
        await page.type('.search-global-typeahead__input', `${keywords}`)
    
        // This is the people's button that appears after a search query; we click it so that we can access connections that are best suited with keywords
        await page.click('.artdeco-pill artdeco-pill--slate artdeco-pill--choice artdeco-pill--2 search-reusables__filter-pill-button search-reusables__filter-pill-button')
        
        // Each page displays 10 profiles with the following classes, we select all of them
        const profiles = await page.$$('.reusable-search__result-container')
        const linkedIns: LinkedIn[] = []
        
        await Promise.all(profiles.map(async (profile: ElementHandle<Element>) => {
            const name = await page.evaluate((el: Element) =>  { return el.querySelector('.entity-result__title-text.t-16')?.textContent?.trim() || ''; }, profile);
            const description = await page.evaluate((el: Element) => { return el.querySelector('.entity-result__primary-subtitle.t-14.t-black.t-normal')?.textContent?.trim() || ''; }, profile);
            if (name && description) {
                let profile: LinkedIn = {
                    name: name,
                    position: description
                };
                linkedIns.push(profile)
            }
        }));
      
        await browser.close();

        // Formats response
        let sentences: string[] = [];
        linkedIns.forEach((linkedIn) => { sentences.push(`${linkedIn.name} | ${linkedIn.position}`); });
        const response = sentences.join('\n');
        return `Here are the top 10 connections for the keywords "${keywords}":\n${response}`;
    }
}