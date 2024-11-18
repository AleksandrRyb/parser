import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebScraper {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private readonly url: string;
    private readonly textDir: string;
    private readonly imagesDir: string;

    constructor(url: string) {
        this.url = url;
        this.textDir = path.join(__dirname, '..', 'text');
        this.imagesDir = path.join(__dirname, '..', 'images');
    }

    private async initializeBrowser(): Promise<void> {
        this.browser = await puppeteer.launch({ headless: true });
        this.page = await this.browser.newPage();
    }

    private async createDirectories(): Promise<void> {
        await fs.mkdir(this.textDir, { recursive: true });
        await fs.mkdir(this.imagesDir, { recursive: true });
    }

    private async navigateToPage(): Promise<void> {
        if (!this.page) throw new Error('Страница не инициализирована');
        await this.page.goto(this.url, { waitUntil: 'networkidle0' });
    }

    private async extractTextContent(): Promise<string> {
        if (!this.page) throw new Error('Страница не инициализирована');
        return this.page.evaluate(() => {
            const textNodes = document.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a');
            return Array.from(textNodes, node => node.textContent?.trim())
                .filter((text): text is string => text !== undefined && text !== null && text.length > 0)
                .join('\n');
        });
    }

    private async saveTextContent(content: string): Promise<void> {
        await fs.writeFile(path.join(this.textDir, 'content.txt'), content);
    }

    private async extractImages(): Promise<Array<{ src: string; alt: string }>> {
        if (!this.page) throw new Error('Страница не инициализирована');
        return this.page.evaluate(() => {
            return Array.from(document.images, img => ({
                src: img.src,
                alt: img.alt
            }));
        });
    }

    private async downloadImage(src: string, index: number): Promise<void> {
        if (!src.startsWith('http')) return;

        const imageName = `image-${index}${path.extname(src) || '.jpg'}`;
        const imagePath = path.join(this.imagesDir, imageName);

        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);

            const buffer = await response.arrayBuffer();
            await fs.writeFile(imagePath, Buffer.from(buffer));
            console.log(`Загружено: ${imageName}`);
        } catch (error) {
            console.error(`Не удалось загрузить: ${imageName}`, error);
        }
    }

    public async scrape(): Promise<void> {
        try {
            console.log('Создание директорий...');
            await this.createDirectories();

            console.log('Запуск браузера...');
            await this.initializeBrowser();

            console.log(`Переход на страницу ${this.url}...`);
            await this.navigateToPage();

            console.log('Извлечение текстового содержимого...');
            const textContent = await this.extractTextContent();
            await this.saveTextContent(textContent);
            console.log('Текстовое содержимое сохранено в text/content.txt');

            console.log('Извлечение информации об изображениях...');
            const images = await this.extractImages();

            console.log('Загрузка изображений...');
            for (let i = 0; i < images.length; i++) {
                await this.downloadImage(images[i].src, i);
            }

            console.log('Скрапинг успешно завершен!');
        } catch (error) {
            console.error('Произошла ошибка:', error);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

async function measureExecutionTime(fn: () => Promise<void>): Promise<void> {
    const start = performance.now();
    await fn();
    const end = performance.now();
    const executionTime = (end - start) / 1000;
    console.log(`Общее время выполнения: ${executionTime.toFixed(2)} секунд`);
}

const parser = new WebScraper('https://mymeet.ai');
measureExecutionTime(() => parser.scrape());