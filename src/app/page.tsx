"use client";
import "@/style/page.scss";
import { shopifyFetch } from "@/lib/shopify";
import { useEffect, useState } from "react";
import Card from "@/components/Card";

const PRODUCTS_QUERY = `
  query Products($first: Int, $after: String, $last: Int, $before: String) {
    products(first: $first, after: $after, last: $last, before: $before) {
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

interface Product {
  id: string;
  title: string;
  images: {
    nodes: {
      url: string;
    }[];
  };
}

interface ShopifyResponse {
  data: {
    products: {
      edges: {
        node: Product;
      }[];
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        endCursor: string;
        startCursor: string;
      };
    };
  };
}

export default function Home() {
  const [store, setStore] = useState<ShopifyResponse | null>(null);

  const generateNewData = async (variant?: "Next" | "Prev") => {
    const variables = !variant
      ? { first: 4 }
      : variant == "Next"
      ? { first: 4, after: store?.data.products.pageInfo.endCursor }
      : { last: 4, before: store?.data.products.pageInfo.startCursor };

    const newData: ShopifyResponse = await shopifyFetch({
      query: PRODUCTS_QUERY,
      variables,
    });

    console.log("newData: ", newData);
    console.log("Store: ", store);
    setStore(newData);
  };

  useEffect(() => {
    generateNewData();
  }, []);

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
            <button onClick={() => generateNewData("Prev")}>Prev</button>
          )}
          {store?.data?.products?.pageInfo?.hasNextPage && (
            <button onClick={() => generateNewData("Next")}>Next</button>
          )}
        </div>
      </main>
      <footer className={"footer"}></footer>
    </div>
  );
}
