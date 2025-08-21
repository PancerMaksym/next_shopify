"use client";

import { useEffect, useCallback } from "react";
import { useUserStore } from "@/lib/store";

export default function ClientInit() {
  const { fetchCustomer, customer, setCartId, setDbId } = useUserStore();
  const stableFetchCustomer = useCallback(fetchCustomer, [customer]);

  const fetchCart = useCallback(async () => {
    if (customer) {
      try {
        const response = await fetch(`/api/users?customer_id=${customer.id}`);
        const data = await response.json();

        setCartId(data.cart_id)
        setDbId(data.id)
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  }, [customer]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      stableFetchCustomer(token);
    }
  }, [stableFetchCustomer]);

  useEffect(() => {
    fetchCart();
  }, [customer]);

  return null;
}
