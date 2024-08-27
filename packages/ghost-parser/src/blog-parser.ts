import { JSDOM } from 'jsdom';

export class BlogParser {
  static parseList(tag: string, el: Element) {
    switch (tag) {
      case 'ul':
        return Array.from(el.children)
          .map((li) => {
            return `- ${li.textContent}`;
          })
          .join('\n');
      case 'ol':
        return Array.from(el.children)
          .map((li, i) => {
            return `${i + 1}. ${li.textContent}`;
          })
          .join('\n');
      default:
        return el.textContent ?? '';
    }
  }

  static parse(html: string) {
    const jsdom = new JSDOM(html);
    const document = jsdom.window.document.firstChild;
    const body = document.querySelector('body');
    const sections: Array<string[]> = [];
    let currentSection: string[] = [];

    for (const child of body.childNodes) {
      const nodeName = child.nodeName.toLowerCase();

      if (nodeName === 'h2') {
        if (currentSection.length > 0) {
          sections.push(currentSection.filter((line) => line.length > 0));
        }
        currentSection = [];
      }

      if (['pre', 'code', 'ul', 'ol', 'blockquote'].includes(nodeName)) {
        if (['ul', 'ol'].includes(nodeName)) {
          const prevEl = child.previousSibling;
          const prevTagName = prevEl?.nodeName.toLowerCase();
          let currentStr = this.parseList(nodeName, child as Element);
          if (
            prevEl &&
            !['ul', 'ol', 'pre', 'code', 'blockquote'].includes(prevTagName)
          ) {
            let prevStr = currentSection.pop();
            currentStr = `${prevStr}\n${currentStr}`;
          }
          currentSection.push(currentStr);
        }
        currentSection.push(child.textContent);
      } else {
        const sentences = child.textContent
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        currentSection = currentSection.concat(sentences);
      }
    }

    sections.push(currentSection.filter((line) => line.length > 0));

    // document.children.forEach((el) => {

    // });

    return sections;
  }
}
