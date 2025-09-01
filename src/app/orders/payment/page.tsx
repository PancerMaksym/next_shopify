"use client";

import CheckoutPage from "@/components/checkoutPage";
import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useUserStore } from "@/lib/store";
import { Cart, GetCartResponse } from "@/lib/types";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("No NEXT_PUBLIC_STRIPE_PUBLIC_KEY");
}

const GET_CART = `
  query getCart($id: ID!, $after: String) {
    cart(id: $id) {
      lines(first: 100, after: $after) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price{
                  amount
                }
                product {
                  id
                  title
                  handle
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const Payment = () => {
  const { cartId, customer } = useUserStore();
  const router = useRouter();
  const [cart, setCart] = useState<Cart[] | null | undefined>(undefined);
  const [amount, setAmount] = useState<number>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const getCart = useCallback(async () => {
    try {
      let after: string | null = null;
      let items: Cart[] = [];

      while (true) {
        const response: GetCartResponse = await shopifyStorefontFetch({
          query: GET_CART,
          variables: { id: cartId, after },
        });
        const edges = response.data?.cart?.lines.edges ?? [];
        items.push(
          ...edges.map((edge) => ({
            id: edge.node.id,
            quantity: edge.node.quantity,
            merchandise: {
              id: edge.node.merchandise.id,
              title: edge.node.merchandise.title,
              price: edge.node.merchandise.price,
              product: {
                id: edge.node.merchandise.product.id,
                title: edge.node.merchandise.product.title,
                handle: edge.node.merchandise.product.handle,
              },
            },
          }))
        );

        if (!response.data?.cart?.lines.pageInfo.hasNextPage) {
          break;
        } else {
          after = response.data?.cart.lines.pageInfo.endCursor;
        }
      }
      console.log("Item: ", items);
      setCart(items);
    } catch (error) {
      setCart(null);
      console.error("Error fetching cart:", error);
    }
  }, [customer]);

  const getPaymentIntents = useCallback(async () => {
    try {
      if (amount && customer) {
        const customerId = customer?.id;
        console.log("customerId", customerId);
        console.log("total: ", amount);
        if (amount) {
          const response = await fetch("/api/payment-intents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, customerId }),
          });

          const data = await response.json();
          console.log("data", data);
          setClientSecret(data.clientSecret);
        }
      }
    } catch (error) {}
  }, [amount, customer]);

  useEffect(() => {
    getCart();
  }, [customer]);

  useEffect(() => {
    if (!cart) return;

    const totalAmount = cart.reduce(
      (acc, el) => acc + el.merchandise.price.amount * el.quantity,
      0
    );
    console.log("totalAmount", totalAmount);
    setAmount(totalAmount);
  }, [cart]);

  useEffect(() => {
    getPaymentIntents();
  }, [amount]);

  if (cart === undefined || !clientSecret) {
    return <div>Loading...</div>;
  }

  if (cart === null) {
    router.push("/registration");
  }

  if (customer && cart && amount && clientSecret !== undefined) {
    console.log("Total: ", amount);
    return (
      <main className="payment">
        <Elements
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <CheckoutPage cart={cart} customerId={customer.id} />
        </Elements>
      </main>
    );
  }
};

export default Payment;
