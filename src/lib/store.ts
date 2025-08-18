import { create } from "zustand";
import { ShopifyResponse, Pages, Cart } from "./types";

interface userStore {
  loadedPages: Pages[];
  pageCount: number;
  cartId: string;
  setLoadedPages: (pageNum: number, newPage: ShopifyResponse) => void;
  setPageCount: (newCount: number) => void;
  setCartId: (id: string) => void;
}

export const useUserStore = create<userStore>((set) => ({
  loadedPages: [],
  pageCount: 0,
  cartId: "",
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
  setCartId: (id) => {
    set(()=>({
      cartId: id
    }))
  }
}));
