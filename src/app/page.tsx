"use client";

import "@/style/page.scss";
import { useCallback, useEffect, useState } from "react";
import Card from "@/components/Card";
import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useSearchParams } from "next/navigation";
import { CountPage, Pages, ShopifyResponse } from "@/lib/types";
import { useUserStore } from "@/lib/store";

const PRODUCTS_QUERY = `
  query Products($after: String) {
    products(first: 4, after: $after) {
      edges {
        node {
          id
          title
          images(first:1){
            nodes{
              url
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
  }
`;

const PAGE_QUERY = `
  query Products($first: Int, $after: String) {
    products(first: $first, after: $after) {
      pageInfo{
        hasNextPage
        endCursor
      }
    }
  }
`;

export default function Home() {
  const [store, setStore] = useState<ShopifyResponse | null>(null);
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get("page"));
  const [cursor, setCursor] = useState<string | null>(null);
  const { loadedPages, setLoadedPages, pageCount, setPageCount } =
    useUserStore();

  const page =
    pageParam > pageCount ? pageCount - 1 : pageParam < 1 ? 0 : pageParam - 1;

  const handleOnClick = (variant: "Next" | "Prev" | number) => {
    let delta: number = 0;

    if (variant === "Next") delta = 1;
    else if (variant === "Prev") delta = -1;
    else if (typeof variant === "number") {
      if (variant > pageCount) delta = pageCount - page;
      else if (variant < 1) delta = 0 - page;
      else delta = variant - page;
    }

    const updatedUrl = new URL(window.location.href);
    updatedUrl.searchParams.set("page", (page + delta + 1).toString());
    window.history.pushState({}, "", updatedUrl);

    window.dispatchEvent(new Event("popstate"));
  };

  const findCursor = useCallback(async () => {
    const response = await shopifyStorefontFetch({
      query: PAGE_QUERY,
      variables: {
        first: page * 4,
      },
    });

    const after = response.data?.products.pageInfo.endCursor;
    setCursor(after);
  }, [page]);

  const checkExist = useCallback(() => {
    const existing = loadedPages.find((el: Pages) => el.page === page);
    if (existing) {
      setStore(existing.products);
    } else {
      findCursor();
    }
  }, [page, loadedPages, findCursor]);

  const fetchProducts = useCallback(async () => {
    const newData: ShopifyResponse = await shopifyStorefontFetch({
      query: PRODUCTS_QUERY,
      variables: {
        after: cursor,
      },
    });

    setLoadedPages(page, newData);
    setStore(newData);
  }, [cursor, page, setLoadedPages]);

  const getPage = async () => {
    if (pageCount === 0) {
      let newCount = 0;
      let after: string | null = null;

      while (true) {
        const newData: CountPage = await shopifyStorefontFetch({
          query: PAGE_QUERY,
          variables: { first: 4, after: after },
        });

        newCount++;
        after = await newData.data?.products?.pageInfo.endCursor;
        if (!newData.data?.products.pageInfo.hasNextPage) break;
      }

      setPageCount(newCount);
    }
  };

  useEffect(() => {
    getPage();
  });

  useEffect(() => {
    checkExist();
  }, [page, checkExist]);

  useEffect(() => {
    if (page === 0 || cursor !== null) {
      fetchProducts();
    }
  }, [cursor, fetchProducts, page]);

  return (
    <div className={"page"}>
      <main className={"main"}>
        <div className="products">
          {store?.data?.products?.edges?.map(({ node }) => (
            <Card
              photo={node?.images.nodes[0]?.url}
              title={node.title}
              id={node.id}
              key={node.id}
            />
          ))}
        </div>

        <div className="buttons">
          <button
            disabled={
              store?.data?.products?.pageInfo?.hasPreviousPage ? false : true
            }
            onClick={() => handleOnClick("Prev")}
          >
            Prev
          </button>
          {[...Array(pageCount)].map((_, index) => (
            <button
              onClick={() => {
                if (page !== index) handleOnClick(index);
              }}
              key={index}
              className={page === index ? "active button" : "button"}
            >
              {index + 1}
            </button>
          ))}
          <button
            disabled={
              store?.data?.products?.pageInfo?.hasNextPage ? false : true
            }
            onClick={() => handleOnClick("Next")}
          >
            Next
          </button>
        </div>
      </main>
      <footer className={"footer"}></footer>
    </div>
  );
}
