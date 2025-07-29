"use client";
import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useUserStore } from "@/lib/store";
import { CartInput } from "@/lib/types";
import "@/style/order.scss";
import { useState } from "react";

const createOrder = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      userErrors {
        code
        message
      }
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

export default function Orders() {
  const { cart, changeCart } = useUserStore();
  const [address, setAddress] = useState({
    address1: "",
    city: "",
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "",
    zip: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cartInput: CartInput = {
      input: {
        lines: cart,
        delivery: {
          addresses: [
            {
              address: {
                deliveryAddress: address,
              },
            },
          ],
        },
      },
    };

    const response = await shopifyStorefontFetch({
      query: createOrder,
      variables: {
        input: cartInput,
      },
    });

    console.log("Respons:", response);
  };


  return (
    <main className="order_page">
      {cart.map((el, index) => (
        <div key={index} className="order">
          <div>{el.merchandiseId}</div>
          <div>{el.quantity} </div>
          <button onClick={() => changeCart("Delete", el)}>Delete</button>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="personal_data">

        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={address.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={address.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address1"
          placeholder="Address"
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
          name="zip"
          placeholder="ZIP"
          value={address.zip}
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
          name="phone"
          placeholder="Phone"
          value={address.phone}
          onChange={handleChange}
          required
        />

        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
