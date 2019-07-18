/* global sails */

// PdfService.js - in api/services

'use strict';

module.exports = {
    generatePdf: async (content, options = {}) => {
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        var defaultOptions = {
            printBackground: true
        };

        options = _.merge(defaultOptions, options);

        await page.setContent(content);
        let pdf = await page.pdf(options);
        await browser.close();

        return pdf;
    }
}