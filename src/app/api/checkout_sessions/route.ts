import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil"
});

interface CartItem {
  merchandise: {
    product: {
      title: string;
    };
    price: {
      amount: number;
    };
  };
  quantity: number;
}


export async function POST(request: NextRequest) {
  try {
    const { cart, customerId } = await request.json();

    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: cart.map((item: CartItem) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.merchandise.product.title,
            },
            unit_amount: item.merchandise.price.amount * 100,
          },
          quantity: item.quantity,
        })),
        metadata: {
          customerId,
        },
      });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error", error);
    return NextResponse.json(
      { error: `ServerError: ${error}` },
      { status: 500 }
    );
  }
}
