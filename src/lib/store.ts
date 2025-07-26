import { create } from "zustand";
import { ShopifyResponse, Pages } from "./types";

interface userStore {
  loadedPages: Pages[];
  pageCount: number;
  setLoadedPages: (pageNum: number, newPage: ShopifyResponse) => void;
  setPageCount: (newCount: number) => void;
}

export const useUserStore = create<userStore>((set) => ({
  loadedPages: [],
  pageCount: 0,
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
}));
