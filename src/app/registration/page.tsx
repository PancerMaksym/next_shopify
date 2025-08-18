'use client'

import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useRouter } from "next/navigation";
import * as React from "react";

interface CustomerInput {
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
	password: string;
}

const CUSTOMER_CREATE = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      userErrors {
        field
        message
			}
			customer{
				id
			}
		}
  }
`;

export default function  Registration () {
	const router = useRouter();

	const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

    const customerInput: CustomerInput = {
      email: formData.get("email") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
    };

		try {
      const response = await shopifyStorefontFetch({
        query: CUSTOMER_CREATE,
        variables: { input: customerInput },
      });

      console.log("Customer create response:", response);
			router.push("/login")
    } catch (error) {
      console.error("Error creating customer:", error);
    }
	}

	return(
		<main className="reg">
			<form id="registrationData" onSubmit={handleSubmit} className="personal_data">
        <input
          type="text"
          name="firstName"
          placeholder="First name"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last name"
          required
        />
        <input
          type="phone"
          name="phone"
          placeholder="Phone"
          required
        />
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
        <button type="submit">Submit</button>
      </form>
		</main>
	)
}
