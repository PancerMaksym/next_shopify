"use client";

import { useEffect, useCallback, memo } from "react";
import { useUserStore } from "@/lib/store";

const ClientInit = memo(function ClientInit() {
  const { fetchCustomer, customer, setCartId, setDbId, setCustomer } = useUserStore();

  const stableFetchCustomer = useCallback(fetchCustomer, [fetchCustomer]);

  const fetchCart = useCallback(async () => {
    if (customer) {
      try {
        const response = await fetch(`/api/users?customer_id=${customer.id}`);
        const data = await response.json();
        if (data) {
          console.log("data: ", data);
          setCartId(data.cart_id);
          setDbId(data.id);
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  }, [customer, setCartId, setDbId]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      stableFetchCustomer(token);
    } else {
      setCustomer(null);
    }
  }, [stableFetchCustomer, setCustomer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return null;
});

ClientInit.displayName = "ClientInit";

export default ClientInit;
