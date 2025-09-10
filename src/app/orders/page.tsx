"use client";
import { useUserStore } from "@/lib/store";
import {
  Cart,
  CartLinesRemoveResponse,
  GetCartResponse,
} from "@/lib/types";
import "@/style/order.scss";
import { useCallback, useEffect, useState } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useRouter } from "next/navigation";
import Link from "next/link";

countries.registerLocale(enLocale);

const GET_ORDER = `
  query order($id: ID!) {
    order(id: $id) {
      id
      name
      invoiceUrl
    }
  }
`;

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
                price {
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

/*const UPDATE_CART = `
  mutation cartLinesUpdate($cartId: ID!, $lines: CartLineUpdateInput) {
    cartLinesUpdate(cartId:$cartId, lines:$lines){
      cart{
        id
      }
      useErrors{
        field,
        message
      }
    }
  }
`;*/

const REMOVE_CART = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds){
      cart{
        id
      }
    }
  }
`;

export default function Orders() {
  const {
    cartId,
    customer,
    orders,
    setOrders,
  } = useUserStore();

  const router = useRouter();
  const [cart, setCart] = useState<Cart[]>([]);

  const getCart = useCallback(async () => {
    try {
      let after: string | null = null;
      const items = [];

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

      setCart(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, [cartId]);

  /*const updateCart = async () => {
    try {
      const response: CartLinesUpdateResponse = await shopifyStorefontFetch({
        query: UPDATE_CART,
        variables: {
          cartId,
          lines: cart?.map((c) => ({ id: c.id, quantity: c.quantity })),
        },
      });

      if (response.data.cartLinesUpdate.cart?.id) {
        await getCart();
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };*/

  const removeCart = async (lineId: string) => {
    try {
      const response: CartLinesRemoveResponse = await shopifyStorefontFetch({
        query: REMOVE_CART,
        variables: { cartId, lineIds: [lineId] },
      });

      if (response) {
        await getCart();
      }
    } catch (error) {
      console.error("Error removing cart line:", error);
    }
  };

  const getOrders = useCallback(async () => {
    const newOrders = [];
    if (customer) {
      for (const edge of customer?.orders.edges) {
        const result = await fetch("/api/admin-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: GET_ORDER,
            variables: { id: edge.node.id },
          }),
        });
        const data = await result.json();
        newOrders.push(data);
      }

      setOrders(newOrders);
    }
  }, [customer, setOrders]);

  useEffect(() => {
    getCart();
    getOrders();
  }, [customer, getCart, getOrders]);

  if (customer === undefined) {
    return <div>Loading</div>;
  }

  if (customer === null) {
    router.push("/registration");
  }

  return (
    <main className="order_page">
      {cart?.map((el, index) => (
        <div key={index} className="order">
          <div>{el.merchandise.product.title}</div>
          <div>{el.quantity} </div>
          <button onClick={() => removeCart(el.id)}>Delete</button>
        </div>
      ))}

      <Link href="/orders/payment">Go to payment</Link>

      <div className="orders">
        <h2>Orders:</h2>
        {orders?.map((order, index) => (
          <div className="order" key={index}>
            {order.order.lineItems.edges.map((edge, order_index) => (
              <div className="line" key={order_index}>
                <div>{edge.node.varant.title}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
