import { create } from "zustand";
import { ShopifyResponse, Pages } from "./types";

interface userStore {
  loadedPages: Pages[];
  pages: number;
  setPage: (pageNum: number, newPage: ShopifyResponse) => void;
}

export const useUserStore = create<userStore>((set, get) => ({
  loadedPages: [],
  pages: 0,
  setPage: (pageNum, newPage) => {
    set((state) => ({
      loadedPages: [...state.loadedPages, { page: pageNum, products: newPage }],
    }));
  },
}));
