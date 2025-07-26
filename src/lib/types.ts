export interface Product {
  id: string;
  title: string;
  images: {
    nodes: {
      url: string;
    }[];
  };
}

export interface ShopifyResponse {
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

export interface CountPage{
  data: {
    products: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      }
    }
  }
}

export interface Pages{
  page: number; 
  products: ShopifyResponse
}