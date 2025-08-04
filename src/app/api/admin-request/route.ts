
export async function POST(req: Request) {
  const { query, variables } = await req.json();

  const result = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2025-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await result.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
