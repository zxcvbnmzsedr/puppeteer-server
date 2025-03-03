const express = require('express');
const bodyParser = require('body-parser');
const { generatePDF } = require('./pdfGenerator');

const app = express();
const port = process.env.PORT || 3000;

// 增加请求体大小限制
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 从URL生成PDF
app.post('/generate-pdf/url', async (req, res) => {
    try {
        const { url, options } = req.body;

        if (!url) {
            return res.status(400).json({ error: '请提供URL' });
        }

        const pdfBuffer = await generatePDF(url, options);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF生成错误:', error);
        res.status(500).json({ error: 'PDF生成失败' });
    }
});

// 从HTML内容生成PDF
app.post('/generate-pdf/html', async (req, res) => {
    try {
        const { html, options } = req.body;

        if (!html) {
            return res.status(400).json({ error: '请提供HTML内容' });
        }

        const pdfBuffer = await generatePDF({ html }, options);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF生成错误:', error);
        res.status(500).json({ error: 'PDF生成失败' });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
