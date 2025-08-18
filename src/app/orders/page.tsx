"use client";
//import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useUserStore } from "@/lib/store";
import {
  Address,
  Cart,
  CartLinesRemoveResponse,
  CartLinesUpdateResponse,
  DraftOrderInput,
  GetCartResponse,
} from "@/lib/types";
import "@/style/order.scss";
import { useEffect, useState } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { shopifyStorefontFetch } from "@/lib/shopify-storefront";

countries.registerLocale(enLocale);

const createOrder = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        invoiceUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_CART = `
  query getCart($id: ID!, $after: String){
    cart(id: $id){
      lines(first:100, after: $after){
        nodes{
          id,
          quantity
        }
        pageInfo{
          hasNextPage
          endCursor
        }
      }
      
    }
  }
`;

const UPDATE_CART = `
mutation cartLinesUpdate($cartId: ID!, $lines: CartLineUpdateInput) {
  cartLinesUpdate(cartId:cartId, lines:$lines){
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
mutation cartLinesRemove($cartId: ID!, $lineIds: [String]) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds){
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

export default function Orders() {
  const { cartId } = useUserStore();
  const [cart, setCart] = useState<Cart[]>([]);
  const [address, setAddress] = useState<Address>({
    address1: "",
    city: "",
    countryCode: "",
    province: "",
    zip: "",
  });
  const [email, setEmail] = useState<string>("");

  const getCart = async () => {
    try {
      let after: string | null = null;
      let items: Cart[] = [];

      while (true) {
        console.log("id: ", cartId)
        const response: GetCartResponse = await shopifyStorefontFetch({
          query: GET_CART,
          variables: { id: cartId, after },
        });

        const edges = response.data?.cart?.lines.edges ?? [];
        items.push(
          ...edges.map((edge) => ({
            variantId: edge.node.variantId,
            quantity: edge.node.quantity,
          }))
        );
        console.log("resp: ", response)
        if (!response.data?.cart?.lines.pageInfo.hasNextPage) break;
        else{
        after = response.data?.cart.lines.pageInfo.endCursor;}
      }

      setCart(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };


  const updateCart = async () => {
    try {
      const response: CartLinesUpdateResponse = await shopifyStorefontFetch({
        query: UPDATE_CART,
        variables: {
          cartId,
          lines: cart?.map((c) => ({ id: c.variantId, quantity: c.quantity })),
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

      if (response.data.cartLinesRemove.cart?.id) {
        await getCart();
      }
    } catch (error) {
      console.error("Error removing cart line:", error);
    }
  };


  useEffect(() => {
    getCart();
  });

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

    const DraftOrderInput: DraftOrderInput = {
      lineItems: cart,
      shippingAddress: address,
    };

    const result = await fetch("/api/admin-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: createOrder,
        variables: { input: DraftOrderInput },
      }),
    });
    const data = await result.json();
    console.log("Respons:", data);
  };

  return (
    <main className="order_page">
      {cart?.map((el, index) => (
        <div key={index} className="order">
          <div>{el.variantId}</div>
          <div>{el.quantity} </div>
          <button onClick={() => removeCart(el.variantId)}>Delete</button>
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
    </main>
  );
}
