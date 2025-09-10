import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil"
});

export async function POST(request: NextRequest) {
  try {
    const { amount, customerId } = await request.json();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: "usd",
      metadata: { customerId },
    });
    
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error", error);
    return NextResponse.json(
      { error: `ServerError: ${error}` },
      { status: 500 }
    );
  }
}
