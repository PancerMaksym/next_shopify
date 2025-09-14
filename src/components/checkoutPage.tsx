"use client";

import React from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from "@stripe/react-stripe-js";
import { Cart } from "@/lib/types";

const CREATE_ORDER = `
  mutation orderCreate($order: OrderCreateOrderInput!) {
    orderCreate(order: $order) {
      userErrors {
        field
        message
      }
      
    }
  }
`;

const CheckoutPage = ({
  cart,
  customerId,
}: {
  cart: Cart[];
  customerId: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const totalAmount = cart.reduce((acc, el) => acc + el.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const checkoutSession = await fetch("/api/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart,
        customerId,
      }),
    });

    if (checkoutSession.status === 200) {
      await fetch(`/api/users?id=${customerId}`, {
        method: "DELETE",
      });

      const orderInput = {
        order: {
          customer: {
            toAssociate: {
              id: customerId,
            },
          },
          lineItems: {
            nodes: cart.map((el) => ({
              id: el.merchandise.product.id,
              title: el.merchandise.product.title,
              quantity: el.quantity,
              taxLines: [
                {
                  title: "State tax",
                  priceSet: {
                    shopMoney: {
                      amount: el.merchandise.price,
                      currencyCode: "EUR",
                    },
                  },
                },
              ],
            })),
          },
        },
      };

      await fetch("/api/admin-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: CREATE_ORDER,
          variables: { order: orderInput },
        }),
      });
    }
  };

  return (
    <div className="checkout">
      {!!customerId && (
        <form onSubmit={handleSubmit}>
          <AddressElement options={{ mode: "shipping" }} />
          <br/>
          <PaymentElement />
          <button>Pay {totalAmount}$</button>
        </form>
      )}
    </div>
  );
};

export default CheckoutPage;
