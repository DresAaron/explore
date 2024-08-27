import { RequestQueue } from 'request-queue';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class PageRetriever {
  private __requestQueue: RequestQueue;

  constructor() {
    this.__requestQueue = new RequestQueue({ maxConcurrentRequests: 6 });
  }

  async retrieveFromSitemap(
    url: string,
    options: { output: string; excludes?: string[] }
  ) {
    // get domain
    const domain = new URL(url).origin;

    // get robots.txt
    const robots = await fetch(`${domain}/robots.txt`).then((res) =>
      res.text()
    );
    // get sitemap urls from robots.txt
    const sitemapRegex = /Sitemap: (.*?)$/gm;
    const sitemapUrls: string[] = [];
    let match;
    while ((match = sitemapRegex.exec(robots)) !== null) {
      sitemapUrls.push(match[1]);
    }
    if (sitemapUrls.length === 0) {
      sitemapUrls.push(`${url}/sitemap.xml`);
    }

    const urlSet: Set<string> = new Set();
    // get all sitemaps
    await Promise.all(
      sitemapUrls.map(async (url) => {
        const xmlString = await fetch(url).then((res) => res.text());
        const locRegex = /<loc>(.*?)<\/loc>/g;
        while ((match = locRegex.exec(xmlString)) !== null) {
          const url = match[1];
          urlSet.add(url);
        }
      })
    );

    const set = new Set(Array.from(urlSet));
    let urls = Array.from(set);
    if (options.excludes?.length) {
      urls = urls.filter((url) => {
        console.log(url);
        return !options.excludes?.some((ex) => url.includes(ex));
      });
    }

    urls.forEach((url) => {
      this.__requestQueue.insert(async () => {
        const html = await this.retrieve(url);
        const paths = url.split('/').filter((p) => p.length > 0);

        fs.writeFileSync(
          path.resolve(options.output, `${paths.slice(-2).join('_')}.html`),
          html
        );
      });
    });

    await this.__requestQueue.once('queueCompleted', null);
  }

  retrieve(url: string) {
    return fetch(url).then(async (res) => {
      const text = await res.text();
      return text;
    });
  }
}
