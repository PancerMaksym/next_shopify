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

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  orders: {
    edges: {
      node: {
        id: string
      }
    }[]
  }
}

export interface Order {
  order: {
    lineItems: {
      edges: {
        node: {
          id: string;
          varant: {
            id: string;
            title: string;
          }
        }
      }[]
    }
  }
}

export interface CountPage {
  data: {
    products: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
    };
  };
}

export interface Pages {
  page: number;
  products: ShopifyResponse;
}

export interface Cart {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      handle: string;
    };
  };
}

export interface Address {
  address1: string;
  city: string;
  countryCode: string;
  province: string;
  zip: string;
}

export interface orderInput {
  lineItems: {
    productId: string;
    quantity: number;
    variantId: string;
  }[];
  customer: {
    toAssociate: {
      id: string;
    }
  }
  billingAddress: Address;
}

export interface GetCartResponse {
  data: {
    cart: {
      lines: {
        edges: {
          node: Cart;
        }[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    } | null;
  };
}

export interface CartLinesUpdateResponse {
  data: {
    cartLinesUpdate: {
      cart: {
        id: string;
      } | null;
      userErrors: {
        field: string[];
        message: string;
      }[];
    };
  };
}

export interface CartLinesRemoveResponse {
  data: {
    cartLinesRemove: {
      cart: {
        id: string;
      } | null;
      userErrors: {
        field: string[];
        message: string;
      }[];
    };
  };
}
