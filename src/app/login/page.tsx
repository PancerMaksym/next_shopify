'use client'

import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useRouter } from "next/navigation";
import * as React from "react";

interface CustomerAccessTokenCreateInput {
  email: string;
  password: string;
}

const CUSTOMER_CREATE = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken{
        accessToken
        expiresAt
      }
		}
  }
`;

export default function Login() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const customerAccessTokenCreateInput: CustomerAccessTokenCreateInput = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await shopifyStorefontFetch({
        query: CUSTOMER_CREATE,
        variables: { input: customerAccessTokenCreateInput },
      });

      localStorage.setItem("accessToken", response.data.customerAccessTokenCreate.customerAccessToken.accessToken)
      router.push("/")
    } catch (error) {
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="email" 
          placeholder="Email" 
          required 
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button>Login</button>
      </form>
    </main>
  );
}
