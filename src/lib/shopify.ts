

export async function shopifyFetch({ query, variables = {} }:{query:string, variables?: Record<string, any>;
}) {
  const endpoint = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const key = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  try {
    const result = await fetch(`https://${endpoint}/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': key!
      },
      body: { query, variables } && JSON.stringify({ query, variables })
    });

    return  await result.json();
  } catch (error) {
    console.error('Error:', error);
  }
}
