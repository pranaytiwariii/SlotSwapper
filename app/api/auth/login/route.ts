import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import getMongoClientPromise from "../../../../lib/mongodb";
import { signToken } from "../../../../lib/auth";

type Body = { email?: string; password?: string };

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "email and password are required" },
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

    const userDoc = await users.findOne({ email: email.toLowerCase() });
    if (!userDoc)
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );

    const match = await compare(password, userDoc.passwordHash);
    if (!match)
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );

    const user = {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
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
