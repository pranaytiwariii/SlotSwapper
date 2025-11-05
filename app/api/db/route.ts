import { NextResponse } from "next/server";
import getMongoClientPromise from "../../../lib/mongodb";

function maskUri(raw: string | undefined | null) {
  if (!raw) return null;
  // If credentials present, show only the part after '@' (host and options)
  if (raw.includes("@")) {
    return raw.split("@")[1];
  }
  // Otherwise return the raw (e.g., mongodb://localhost:27017/db)
  return raw;
}

export async function GET(req: Request) {
  try {
    // Debug helper: if ?debug=1 is provided, return whether env var is loaded and a masked preview
    const url = new URL(req.url);
    if (url.searchParams.get("debug") === "1") {
      const raw = process.env.MONGODB_URI ?? null;
      return NextResponse.json({
        ok: true,
        uriDefined: !!raw,
        uriPreview: maskUri(raw),
      });
    }

    const clientPromise = getMongoClientPromise();
    if (!clientPromise) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "MONGODB_URI is not set in the runtime. Create or update .env.local and restart the dev server.",
        },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db(); // uses DB from connection string
    const collections = await db.collections();
    const names = collections.map((c) => c.collectionName);
    return NextResponse.json({ ok: true, collections: names });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
