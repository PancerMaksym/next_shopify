import { create } from "zustand";
import { ShopifyResponse, Pages, Customer, Order } from "./types";
import { shopifyStorefontFetch } from "./shopify-storefront";

const GET_CUSTOMER = `
  query customer($customerAccessToken: String!){
    customer(customerAccessToken: $customerAccessToken){
      id
      email
      firstName
      lastName
      orders(first: 10){
        edges{
          node{
            id
          }
        }
      }
    }
  }
`;

interface userStore {
  loadedPages: Pages[];
  pageCount: number;
  cartId: string | null;
  checkoutUrl: string | null;
  customer: Customer | null | undefined;
  orders: Order[] | null;
  dbId: number | null;
  setLoadedPages: (pageNum: number, newPage: ShopifyResponse) => void;
  setPageCount: (newCount: number) => void;
  setCartId: (id: string | null) => void;
  setCustomer: (customer: Customer | null) => void;
  fetchCustomer: (token: string) => Promise<void>;
  setOrders: (orders: Order[]) => void;
  setCheckoutUrl: (newUrl: string | null) => void;
  setDbId: (newId: number | null) => void;
}

export const useUserStore = create<userStore>((set) => ({
  loadedPages: [],
  pageCount: 0,
  cartId: null,
  dbId: null,
  customer: undefined,
  orders: null,
  checkoutUrl: null,

  setLoadedPages: (pageNum, newPage) => {
    set((state) => ({
      loadedPages: [...state.loadedPages, { page: pageNum, products: newPage }],
    }))
  },

  setPageCount: (newCount) => {
    set(() => ({ pageCount: newCount }))
  },

  setCartId: (id) => {set(() => (
    { cartId: id }))
  },

  setCustomer: (customer) => {
    set(() => ({ customer }))
  },

  fetchCustomer: async (token: string) => {
    try {
      const response = await shopifyStorefontFetch({
        query: GET_CUSTOMER,
        variables: { customerAccessToken: token },
      });
      console.log("resp", response)
      if (response) {
        set({ customer: response.data.customer });
      }
    } catch (error) {
      set({ customer: null });
      console.error("Error fetching customer:", error);
    }
  },

  setOrders: (orders) => {
    set({orders: orders})
  },

  setCheckoutUrl: (newUrl) => {
    set({checkoutUrl: newUrl})
  },

  setDbId: (newId) => {
    set({dbId: newId})
  },
}));
