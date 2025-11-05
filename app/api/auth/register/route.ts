import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import getMongoClientPromise from "../../../../lib/mongodb";
import { signToken } from "../../../../lib/auth";

type Body = { name?: string; email?: string; password?: string };

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "name, email and password are required" },
        { status: 400 }
      );
    }

    const clientPromise = getMongoClientPromise();
    if (!clientPromise)
      return NextResponse.json(
        { ok: false, error: "MONGODB_URI not configured" },
        { status: 500 }
      );

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing)
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 409 }
      );

    const passwordHash = await hash(password, 10);
    const now = new Date();
    const res = await users.insertOne({
      name,
      email: email.toLowerCase(),
      passwordHash,
      taskIds: [],
      createdAt: now,
    });

    const user = {
      id: res.insertedId.toString(),
      name,
      email: email.toLowerCase(),
    };
    const token = signToken({ sub: user.id, email: user.email });

    return NextResponse.json({ ok: true, user, token });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
