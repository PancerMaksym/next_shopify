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
  cartId: string;
  customer: Customer | null;
  orders: Order[] | null;
  setLoadedPages: (pageNum: number, newPage: ShopifyResponse) => void;
  setPageCount: (newCount: number) => void;
  setCartId: (id: string) => void;
  setCustomer: (customer: Customer) => void;
  fetchCustomer: (token: string) => Promise<void>;
  setOrders: (orders: Order[]) => void
}

export const useUserStore = create<userStore>((set) => ({
  loadedPages: [],
  pageCount: 0,
  cartId: "",
  customer: null,
  orders: null,

  setLoadedPages: (pageNum, newPage) =>
    set((state) => ({
      loadedPages: [...state.loadedPages, { page: pageNum, products: newPage }],
    })),

  setPageCount: (newCount) => set(() => ({ pageCount: newCount })),

  setCartId: (id) => set(() => ({ cartId: id })),

  setCustomer: (customer) => set(() => ({ customer })),

  fetchCustomer: async (token: string) => {
    try {
      const response = await shopifyStorefontFetch({
        query: GET_CUSTOMER,
        variables: { customerAccessToken: token },
      });

      if (response.data?.customer) {
        set({ customer: response.data.customer });
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  },

  setOrders: (orders) => {
    set({orders: orders})
  },
}));
