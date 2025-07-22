"use client";
import Image from "next/image";
import "@/style/page.scss";
import { shopifyFetch } from "@/lib/shopify";
import { useEffect, useState } from "react";

const PRODUCTS_QUERY = `
  query Products($after: String) {
    products(first: 5, after: $after) {
      edges {
        node {
          id
          title
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface Product {
  id: string;
  title: string;
}

interface ShopifyResponse {
  data: {
    products: {
      edges: {
        node: Product;
      }[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
    };
  };
}

export default function Home() {
  const [store, setStore] = useState<ShopifyResponse | null>(null);

  const generateNewData = async () => {

    const variables = store
      ? { after: store.data.products.pageInfo.endCursor }
      : { after: null };

    const newData: ShopifyResponse = await shopifyFetch({
      query: PRODUCTS_QUERY,
      variables,
    });

    console.log("newData: ", newData);
    console.log("Store: ", store);
    setStore((prev) => {
      if (!prev) return newData;

      return {
        data: {
          products: {
            edges: [
              ...newData.data.products.edges,
            ],
            pageInfo: newData.data.products.pageInfo,
          },
        },
      };
    });
  };

  useEffect(() => {
    generateNewData();
  }, []);

  return (
    <div className={"page"}>
      <main className={"main"}>
        <ul>
          {store?.data?.products?.edges?.map(({ node }) => (
            <li key={node.id}>{node.title}</li>
          ))}
        </ul>
        <button onClick={generateNewData}>click</button>
      </main>
      <footer className={"footer"}></footer>
    </div>
  );
}
