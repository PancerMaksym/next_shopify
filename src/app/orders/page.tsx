"use client";
//import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useUserStore } from "@/lib/store";
import { Address, DraftOrderInput } from "@/lib/types";
import "@/style/order.scss";
import { useState } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

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

export default function Orders() {
  const { cart, changeCart } = useUserStore();
  const [address, setAddress] = useState<Address>({
    address1: "",
    city: "",
    countryCode: "",
    firstName: "",
    lastName: "",
    phone: "",
    province: "",
    zip: "",
  });
  const [email, setEmail] = useState<string>("");

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
      email,
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
      {cart.map((el, index) => (
        <div key={index} className="order">
          <div>{el.variantId}</div>
          <div>{el.quantity} </div>
          <button onClick={() => changeCart("Delete", el)}>Delete</button>
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
          name="firstName"
          placeholder="First name"
          value={address.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last name"
          value={address.lastName}
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
