"use client";
//import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useUserStore } from "@/lib/store";
import {
  Address,
  Cart,
  CartLinesRemoveResponse,
  CartLinesUpdateResponse,
  orderInput,
  GetCartResponse,
} from "@/lib/types";
import "@/style/order.scss";
import { useCallback, useEffect, useState } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useRouter } from "next/navigation";
import Image from "next/image";

countries.registerLocale(enLocale);

const CREATE_ORDER = `
  mutation orderCreate($order: OrderCreateOrderInput!) {
    orderCreate(order: $order) {
      order {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CATR_ADD_IDENTITY = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      userErrors {
        field
        message
      }
    }
  }
`;

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

const UPDATE_CART = `
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
`;

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
  const { cartId, customer, orders, setOrders, dbId, setCartId, setDbId } = useUserStore();

  const router = useRouter();
  const [cart, setCart] = useState<Cart[]>([]);
  const [address, setAddress] = useState<Address>({
    address1: "",
    city: "",
    countryCode: "",
    province: "",
    zip: "",
  });
  const [email, setEmail] = useState<string>("");

  const getCart = useCallback(async () => {
    try {
      let after: string | null = null;
      let items = [];

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
  }, [customer]);

  const updateCart = async () => {
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
  };

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
  }, [customer]);

  useEffect(() => {
    getCart();
    getOrders();
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else {
      setAddress((prev) => ({
        ...prev,

        [name]:
          name === "countryCode"
            ? !!countries.getAlpha2Code(value, "en")
              ? countries.getAlpha2Code(value, "en")
              : value
            : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customer) {
      const orderInput: orderInput = {
        lineItems: cart.map((el) => {
          return {
            productId: el.id,
            quantity: el.quantity,
            variantId: el.merchandise.product.id,
          };
        }),
        customer: {
          toAssociate: {
            id: customer?.id,
          },
        },
        billingAddress: address,
      };

      const result = await fetch("/api/admin-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: CREATE_ORDER,
          variables: { input: orderInput },
        }),
      });
      const data = await result.json();
      const response = await fetch(`/api/users?id=${dbId}`, {
        method: "DELETE",
      });

      if(response){
        setDbId(null)
        setCart([])
        setCartId(null)
      }
    }
  };

  if (customer === undefined) {
    return <div>Loading</div>;
  }
  
  if(customer === null) {
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

      <form onSubmit={handleSubmit} className="personal_data">
        <input
          type="text"
          name="address1"
          placeholder="Addres"
          value={address.address1}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={address.city}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="countryCode"
          placeholder="Country Code (e.g. UA)"
          value={address.countryCode}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="province"
          placeholder="Province"
          value={address.province}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="zip"
          placeholder="Zip"
          value={address.zip}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={email}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>
      <div className="orders">
        <h2>Orders:</h2>
        {orders?.map((order) => (
          <div className="order">
            {order.order.lineItems.edges.map((edge) => (
              <div className="line">
                <div>{edge.node.varant.title}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
