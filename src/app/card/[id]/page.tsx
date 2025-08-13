"use client";
import Image from "next/image";
import { useEffect, useState, use } from "react";
import "@/style/cardPage.scss";
import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useUserStore } from "@/lib/store";

const PRODUCTS_QUERY = `
  query Product($id: ID) {
    product(id: $id) {
      id
      title
      description
      handle
      tags
      images(first: 5) {
        nodes {
          url
        }
      }
      variants(first:5){
        nodes{
          id
          title
          image {
            url
          }
          price{
            amount
          }
        }
      }
    }
  }
`;

export interface ProductData {
  id: string;
  title: string;
  description: string;
  handle: string;
  tags: string[];
  images: {
    nodes: {
      url: string;
    }[];
  };
  variants: {
    nodes: {
      id: string;
      title: string;
      image: {
        url: string;
      };
      price: {
        amount: string;
      };
    }[];
  };
}

const CardPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const decodedParam: { id: string } = use(params);
  const id = decodeURIComponent(decodedParam.id);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [count, setCount] = useState(1);
  const { changeCart } = useUserStore();

  const setNewData = async () => {
    const response = await shopifyStorefontFetch({
      query: PRODUCTS_QUERY,
      variables: { id },
    });

    setProduct(response.data.product);
  };

  useEffect(() => {
    setNewData();
  });

  const handlePrevPhoto = () => {
    if (!product) return;
    setPhotoIdx(
      (prev) =>
        (prev - 1 + product.images.nodes.length) % product.images.nodes.length
    );
  };

  const handleNextPhoto = () => {
    if (!product) return;
    setPhotoIdx((prev) => (prev + 1) % product.images.nodes.length);
  };

  if (product == null) {
    return <div>Loading</div>;
  }

  return (
    <main>
      <div className="photoBlock">
        {product.images.nodes.length > 1 ? (
          <button onClick={handlePrevPhoto}>&lt;</button>
        ) : null}

        <Image
          src={product?.images.nodes[photoIdx]?.url || "/placeholder.jpg"}
          alt={product?.title || "Product image"}
          width={900}
          height={1600}
        />
        {product.images.nodes.length > 1 ? (
          <button onClick={handleNextPhoto}>&gt;</button>
        ) : null}
      </div>
      <div className="variants">
        {product.variants.nodes.map((node, index) => {
          return (
            <div key={index} className="var">
              <Image
                src={node.image?.url || "/placeholder.jpg"}
                alt={node.title}
                width={200}
                height={300}
              />
              <div>${node.price.amount}</div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div>
          <button onClick={() => setCount((prev) => prev - 1)}>-</button>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 0)}
            min={1}
          />
          <button onClick={() => setCount((prev) => prev + 1)}>+</button>
        </div>
        <button type="submit" onClick={() => changeCart("Add", {quantity: count, variantId: product.variants.nodes[0].id, })}>Add</button>
      </form>

      <h3>{product.title}</h3>
      <h4>{product.description}</h4>
    </main>
  );
};

export default CardPage;
