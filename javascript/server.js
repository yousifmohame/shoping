const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Paymob credentials
const PAYMOB_API_KEY = 'ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBd056RXdPQ3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5fUW5hX2g0WGtJa1ZQQUQxVGRQdEVZTENxMFZPRWpZNk5Kd0FWc3dLbHc3SzVQUURqTDlvTmk1MHFuOGp3am5hcVhOZlZiVmxtRkhuWlRhRlNTSDFHUQ=='; // Replace with your Paymob API key
const PAYMOB_INTEGRATION_ID = '4879330'; // Replace with your Paymob Integration ID
const PAYMOB_MERCHANT_ID = '1007108'; // Replace with your Paymob Merchant ID
const PAYMOB_IFRAME_ID = '882261'; // Replace with your Paymob Iframe ID

// Route to create the payment order and generate payment link
app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;

    try {
        // Step 1: Get authentication token from Paymob API
        const authResponse = await axios.post('https://accept.paymobsolutions.com/api/auth/tokens', {
            api_key: PAYMOB_API_KEY,
        });

        const token = authResponse.data.token;

        // Step 2: Create the payment order
        const orderResponse = await axios.post('https://accept.paymobsolutions.com/api/ecommerce/orders', {
            amount_cents: amount,
            currency: 'EGP', // Currency (can change based on your needs)
            integration_id: PAYMOB_INTEGRATION_ID,
            merchant_id: PAYMOB_MERCHANT_ID,
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const orderId = orderResponse.data.id;

        // Step 3: Create the payment link (payment key)
        const paymentLinkResponse = await axios.post('https://accept.paymobsolutions.com/api/acceptance/payment_keys', {
            amount_cents: amount,
            currency: 'EGP',
            integration_id: PAYMOB_INTEGRATION_ID,
            order_id: orderId,
            iframe_id: PAYMOB_IFRAME_ID,
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const paymentUrl = paymentLinkResponse.data.payment_url;

        // Step 4: Return the payment URL to the frontend
        res.json({ payment_url: paymentUrl });
    } catch (error) {
        console.error('Error creating payment link:', error);
        res.status(500).json({ error: 'Failed to create payment link' });
    }
});

// Start the server
const port = 4000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
