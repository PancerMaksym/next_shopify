"use client";
import "@/style/page.scss";
import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useSearchParams } from "next/navigation";
import { Pages, ShopifyResponse } from "@/lib/types";
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
  query Products($after: String) {
    products(first: 4, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export default function Home() {
  const [store, setStore] = useState<ShopifyResponse | null>(null);
  const searchParams = useSearchParams().get("page");
  const page = searchParams ? Number(searchParams) - 1 : 0;
  const [cursor, setCursor] = useState<string | null>(null);
  const { loadedPages, setPage } = useUserStore();

  const handleOnClick = (variant?: "Next" | "Prev") => {
    const delta = variant == "Next" ? 1 : -1;

    const updatedUrl = new URL(window.location.href);
    updatedUrl.searchParams.set("page", (page + delta + 1).toString());
    window.history.pushState({}, "", updatedUrl);

    window.dispatchEvent(new Event("popstate"));
  };

  const findCursor = async () => {
    let after: string | null = null;
    for (let index = 0; index < page; index++) {
      const response = await shopifyStorefontFetch({
        query: PAGE_QUERY,
        variables: {
          after: after,
        },
      });

      after = response.data.products.pageInfo.endCursor;
    }
    setCursor(after);
  };

  const fetchProducts = async () => {
    const existing = loadedPages.find((el: Pages) => el.page === page);
    console.log("Page: ", page);
    console.log("Loaded: ", loadedPages);
    console.log("Exist: ", existing);

    if (existing) {
      console.log(1);
      setStore(existing.products);
    } else {
      console.log(2);
      const newData: ShopifyResponse = await shopifyStorefontFetch({
        query: PRODUCTS_QUERY,
        variables: {
          after: cursor,
        },
      });
      setPage(page, newData);
      setStore(newData);
    }
  };

  useEffect(() => {
    findCursor();
  }, [page]);

  useEffect(() => {
    if (page === 0 || cursor !== null) {
      fetchProducts();
    }
  }, [cursor, page]);

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
          {store?.data?.products?.pageInfo?.hasPreviousPage && (
            <button onClick={() => handleOnClick("Prev")}>Prev</button>
          )}
          {store?.data?.products?.pageInfo?.hasNextPage && (
            <button onClick={() => handleOnClick("Next")}>Next</button>
          )}
        </div>
      </main>
      <footer className={"footer"}></footer>
    </div>
  );
}
