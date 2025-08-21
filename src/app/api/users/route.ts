import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const customer_id = url.searchParams.get("customer_id");

  if (!customer_id) {
    return NextResponse.json({ error: "customer_id required" }, { status: 400 });
  }

  try {
    const users = await prisma.cart.findFirst({
      where: { customer_id },
    });
    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();

  const newUser = await prisma.cart.create({
    data: {
      customer_id: body.customer_id,
      cart_id: body.cart_id,
    },
  });

  return NextResponse.json(newUser);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    const deleted = await prisma.cart.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json(deleted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

