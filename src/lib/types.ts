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

export interface Cart{
  quantity: number;
  merchandiseId: string;
}

export interface CartInput{
  input: {
    lines : Cart[];
    delivery: {
      addresses: {
        address: {
          deliveryAddress: {
            address1: string;
            city: string;
            firstName: string;
            lastName: string;
            phone: string;
            countryCode: string;
            zip: string;
          }
        }
      }[]
    }
  }
}