/**
 * OMNIGRAPH APEX™ // CORE ENGINE v1.2
 * FINAL CONSOLIDATED SHIPPING VERSION
 */
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || 'dev_secret_key';

app.post('/api/pulse', (req, res) => {
    const { productData } = req.body;
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    const proofId = crypto.createHmac('sha256', SHOPIFY_API_SECRET)
                          .update(JSON.stringify(productData) + Date.now())
                          .digest('hex');
    res.json({ 
        success: true, 
        payload: {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": productData.title,
            "sku": productData.sku,
            "omnigraph_fidelity": "APEX_VERIFIED",
            "proof_signature": proofId
        } 
    });
});

app.listen(PORT, () => console.log(`--- APEX ENGINE ACTIVE ON PORT ${PORT} ---`));
