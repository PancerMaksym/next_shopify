import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const customer_id = url.searchParams.get("customer_id");

  if (!customer_id) {
    return NextResponse.json(
      { error: "customer_id required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.cart.findFirst({
      where: { customer_id },
    });
    return NextResponse.json(user);
  } catch (err) {
    console.error("Error: ", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newUser = await prisma.cart.create({
      data: {
        customer_id: body.customer_id,
        cart_id: body.cart_id,
      },
    });
    return NextResponse.json(newUser);
  } catch (err) {
    console.error("Error: ", err);
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    const deleted = await prisma.cart.delete({
      where: { id: Number(id) }, // бо id у схемі Int
    });
    return NextResponse.json(deleted);
  } catch (err) {
    console.error("Error: ", err);
  }
}
