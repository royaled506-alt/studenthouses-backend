const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const CONSUMER_KEY = "rMyWsp404tjFLR3P376rXWUoVlBY82xSuAX51LcRFu3PQKBC";
const CONSUMER_SECRET = "2HGDcqyGNRMWuQtkXvz4Aql0BkSWIA8JvHAnV2n2JAnkjYN2pqtJ3dLqulxCbqZ1";
const PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const SHORTCODE = "174379";

async function getToken() {
  const auth = Buffer.from(CONSUMER_KEY + ":" + CONSUMER_SECRET).toString('base64');
  const res = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", { headers: { Authorization: "Basic " + auth } });
  return res.data.access_token;
}

app.post('/api/stkpush', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    let cleanPhone = phone.replace(/^0/, "254");
    const token = await getToken();
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    const password = Buffer.from(SHORTCODE + PASSKEY + timestamp).toString('base64');
    const resp = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      BusinessShortCode: SHORTCODE, Password: password, Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline", Amount: amount || 100,
      PartyA: cleanPhone, PartyB: SHORTCODE, PhoneNumber: cleanPhone,
      CallBackURL: "https://studenthouses-backend.onrender.com/api/callback",
      AccountReference: "StudentHousesKE", TransactionDesc: "Unlock Houses"
    }, { headers: { Authorization: "Bearer " + token } });
    res.json(resp.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/callback', (req, res) => { console.log(req.body); res.json({ ok: true }); });
app.get('/', (req, res) => res.send("Running"));
app.listen(10000, () => console.log("Running"));
