const puppeteer = require('puppeteer');

let browserInstance = null;
let pageCount = 0;
const MAX_PAGES = 50; // 最大页面处理数量
const MEMORY_THRESHOLD = 1024 * 1024 * 1024; // 1GB内存阈值
const MAX_RETRIES = 3; // 最大重试次数

const chromePaths = {
    darwin: '/Applications/Chromium.app/Contents/MacOS/Chromium',
    linux: process.env.CHROME_PATH || '/usr/bin/chromium',
    win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
};

async function getBrowser() {
    try {
        if (browserInstance) {
            try {
                const pages = await browserInstance.pages();
                if (pages.length > 0) {
                    return browserInstance;
                }
            } catch (error) {
                console.log('检测到浏览器实例异常:', error.message);
            }
            // 如果检测失败，清理旧实例
            await cleanup();
        }

        console.log('正在创建新的浏览器实例...');

        // 创建新的浏览器实例
        browserInstance = await puppeteer.launch({
            headless: 'new',
            pipe: false,
            ignoreHTTPSErrors: true,
            dumpio: true,
            timeout: 60000,
            executablePath: chromePaths[process.platform],
            args: ['--no-sandbox', '--disable-gpu']
        });

        // 等待浏览器完全启动
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 验证浏览器实例是否可用
        try {
            const page = await browserInstance.newPage();
            await page.close();
        } catch (error) {
            console.error('浏览器实例验证失败:', error);
            await cleanup();
            throw new Error('浏览器实例创建失败');
        }

        pageCount = 0;

        browserInstance.on('disconnected', () => {
            console.log('浏览器实例断开连接');
            browserInstance = null;
            pageCount = 0;
        });

        console.log('浏览器实例创建成功');
        return browserInstance;
    } catch (error) {
        console.error('创建浏览器实例失败:', error);
        // 确保清理任何可能存在的实例
        await cleanup();
        throw error;
    }
}

/**
 * 生成PDF
 * @param {string|object} source - URL字符串或者包含HTML内容的对象 {html: string}
 * @param {object} options - PDF生成选项
 * @param {number} retryCount - 重试次数
 */
async function generatePDF(source, options = {}, retryCount = 0) {
    let page = null;
    let browser = null;

    try {
        console.log(`开始生成PDF (尝试 ${retryCount + 1}/${MAX_RETRIES})`);
        browser = await getBrowser();

        page = await browser.newPage();
        pageCount++;

        // 设置页面参数
        await page.setViewport({width: 1920, height: 1080});

        console.log('正在加载页面...');

        // 根据source类型处理页面内容
        if (typeof source === 'string') {
            // 如果是URL，直接导航
            await page.goto(source, {
                waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
                timeout: 60000
            });
        } else if (source.html) {
            // 如果是HTML内容，直接设置
            await page.setContent(source.html, {
                waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
                timeout: 60000
            });
        } else {
            throw new Error('无效的源数据，需要提供URL或HTML内容');
        }

        console.log('正在生成PDF...');
        const pdfBuffer = await page.pdf({
            format: options.format,
            ...options
        });
        console.log('PDF生成成功');
        return pdfBuffer;

    } catch (error) {
        console.error(`PDF生成错误 (尝试 ${retryCount + 1}/${MAX_RETRIES}):`, error);

        if (page) {
            try {
                pageCount--;
                await page.close();
            } catch (e) {
                console.error('关闭页面失败:', e.message);
            }
        }

        // 如果遇到严重错误，重启浏览器实例
        await cleanup();

        // 重试逻辑
        if (retryCount < MAX_RETRIES) {
            const waitTime = (retryCount + 1) * 3000;
            console.log(`等待 ${waitTime}ms 后重试...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return generatePDF(source, options, retryCount + 1);
        }

        throw error;
    } finally {
        if (page) {
            try {
                pageCount--;
                await page.close();
            } catch (e) {
                console.error('关闭页面失败:', e.message);
            }
        }
    }
}

// 添加优雅退出处理
async function cleanup() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
        pageCount = 0;
    }
}

// 定期检查内存使用情况
setInterval(async () => {
    const usage = process.memoryUsage();
    if (usage.heapUsed > MEMORY_THRESHOLD) {
        console.log('定期检查：内存使用过高，重启浏览器实例');
        await cleanup();
    }
}, 5 * 60 * 1000); // 每5分钟检查一次

// 监听进程退出信号
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

module.exports = {
    generatePDF,
    cleanup
};
