"use client";
import Image from "next/image";
import { useEffect, useState, use } from "react";
import "@/style/cardPage.scss";
import { shopifyStorefontFetch } from "@/lib/shopify-storefront";
import { useUserStore } from "@/lib/store";
import { useRouter } from "next/navigation";

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

const CART_ADD = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_CREATE = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface ProductData {
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
  const router = useRouter();
  const decodedParam: { id: string } = use(params);
  const id = decodeURIComponent(decodedParam.id);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [count, setCount] = useState(1);
  const [selectedVar, setSelectedVar] = useState(0);
  const { cartId, setCartId, setCheckoutUrl, customer, setDbId } = useUserStore();

  const handleAddCart = async () => {
    if (!localStorage.getItem("accessToken")) {
      router.push("/registration");
    }
    try {
      if (cartId) {
        const response = await shopifyStorefontFetch({
          query: CART_ADD,
          variables: {
            cartId: cartId,
            lines: [
              {
                merchandiseId: product?.variants.nodes[selectedVar].id,
                quantity: count,
              },
            ],
          },
        });
      } else {
        const response = await shopifyStorefontFetch({
          query: CART_CREATE,
          variables: {
            input: {
              lines: [
                {
                  merchandiseId: product?.variants.nodes[selectedVar].id,
                  quantity: count,
                },
              ],
            },
          },
        });
        if (response) {
          const res = await fetch("/api/users", {
            method: "POST",
            body: JSON.stringify({ customer_id: customer?.id, cart_id: response.data.cartCreate.cart.id }),
          });
          const data = await res.json();
          setDbId(data.id)
          setCartId(response.data.cartCreate.cart.id);
          
          setCheckoutUrl(response.data.cartCreate.cart.checkoutUrl);
        }
      }
    } catch (error) {
    }
  };

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
            <div
              key={index}
              onClick={() => setSelectedVar(index)}
              className={index === selectedVar ? "active var" : "var"}
            >
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
        <button type="submit" onClick={() => handleAddCart()}>
          Add
        </button>
      </form>

      <h3>{product.title}</h3>
      <h4>{product.description}</h4>
    </main>
  );
};

export default CardPage;
