import { create } from "zustand";
import { ShopifyResponse, Pages, Cart } from "./types";

interface userStore {
  loadedPages: Pages[];
  pageCount: number;
  cart: Cart[];
  setLoadedPages: (pageNum: number, newPage: ShopifyResponse) => void;
  setPageCount: (newCount: number) => void;
  changeCart: (type: "Add"|"Delete"|"Change", data:Cart ) => void;
}

export const useUserStore = create<userStore>((set) => ({
  loadedPages: [],
  pageCount: 0,
  cart: [],
  setLoadedPages: (pageNum, newPage) => {
    set((state) => ({
      loadedPages: [...state.loadedPages, { page: pageNum, products: newPage }],
    }));
  },
  setPageCount: (newCount) => {
    set(() => ({
      pageCount: newCount,
    }));
  },
  changeCart: (type, data) => {
    if(type === "Add"){
      console.log(1)
      set((state) => ({
        cart: [...state.cart, data]
      }))
    }else if(type === "Change"){
      set((state)=>({
        cart: state.cart.map((el) => el.merchandiseId === data.merchandiseId ? data : el)
      }))
    }else if(type === "Delete"){
      set((state) => ({
        cart: state.cart.filter((el) => el.merchandiseId !== data.merchandiseId)
      }))
    }
  },
}));
