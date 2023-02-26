import BigPromise from "../middlewares/bigPromise";
import stripe from "stripe";

stripe(process.env.STRIPE_SECRET);
const sendStripeKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    stripekey: process.env.STRIPY_API_KEY,
  });
});

const captureStripePayment = BigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.payment,
    currency: "inr",
    automatic_payment_methods: { enabled: true },
    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

export { sendStripeKey, captureStripePayment };
