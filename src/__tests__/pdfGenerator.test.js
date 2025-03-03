const { generatePDF } = require('../pdfGenerator');
const fs = require('fs').promises;
const path = require('path');

describe('PDF Generator Tests', () => {
    const outputPath = path.join(__dirname, 'output');

    // 在所有测试开始前创建输出目录
    beforeAll(async () => {
        try {
            await fs.mkdir(outputPath, { recursive: true });
        } catch (error) {
            console.error('创建输出目录失败:', error);
        }
    });

    // 在所有测试结束后清理输出目录
    afterAll(async () => {
        try {
            const files = await fs.readdir(outputPath);
            await Promise.all(
                files.map(file => fs.unlink(path.join(outputPath, file)))
            );
            await fs.rmdir(outputPath);
        } catch (error) {
            console.error('清理输出目录失败:', error);
        }
    });

    test('从 HTML 生成 PDF', async () => {
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>测试页面</title>
                </head>
                <body>
                    <h1>测试标题</h1>
                    <p>这是一个测试段落，包含中文内容。</p>
                </body>
            </html>
        `;

        const options = {
            format: 'A4',
            printBackground: true
        };

        const pdfBuffer = await generatePDF({ html }, options);

        expect(pdfBuffer).toBeInstanceOf(Buffer);
        expect(pdfBuffer.length).toBeGreaterThan(0);

        await fs.writeFile(path.join(outputPath, 'html-test.pdf'), pdfBuffer);
    }, 30000);

    test('使用自定义尺寸生成 PDF', async () => {
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>自定义尺寸测试</title>
                    <style>
                        body {
                            width: 67cm;
                            height: 38cm;
                            margin: 0;
                            padding: 0;
                            background: linear-gradient(180deg, #1d4a43 0%, #2a6b61 100%);
                            color: white;
                        }
                    </style>
                </head>
                <body>
                    <h1>自定义尺寸测试</h1>
                    <p>这是一个 67cm x 38cm 的页面。</p>
                </body>
            </html>
        `;

        const options = {
            width: '67cm',
            height: '38cm',
            printBackground: true,
            margin: {
                top: '0',
                right: '0',
                bottom: '0',
                left: '0'
            }
        };

        const pdfBuffer = await generatePDF({ html }, options);

        expect(pdfBuffer).toBeInstanceOf(Buffer);
        expect(pdfBuffer.length).toBeGreaterThan(0);

        await fs.writeFile(path.join(outputPath, 'custom-size-test.pdf'), pdfBuffer);
    }, 30000);
});
