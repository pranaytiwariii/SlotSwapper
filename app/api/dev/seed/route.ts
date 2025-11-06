import { NextResponse } from "next/server";
import getMongoClientPromise from "../../../../lib/mongodb";
import { hash } from "bcryptjs";

export async function POST() {
  try {
    if (process.env.NODE_ENV === "production")
      return NextResponse.json(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );

    const clientPromise = getMongoClientPromise();
    if (!clientPromise)
      return NextResponse.json(
        { ok: false, error: "MONGODB_URI not configured" },
        { status: 500 }
      );

    const client = await clientPromise;
    const db = client.db();

    const users = db.collection("users");
    const tasks = db.collection("tasks");

    // clear existing for a repeatable seed
    await users.deleteMany({});
    await tasks.deleteMany({});

    const alicePass = await hash("secret123", 10);
    const bobPass = await hash("secret456", 10);

    const now = new Date();
    const a = await users.insertOne({
      name: "Alice",
      email: "alice@example.com",
      passwordHash: alicePass,
      taskIds: [],
      createdAt: now,
    });
    const b = await users.insertOne({
      name: "Bob",
      email: "bob@example.com",
      passwordHash: bobPass,
      taskIds: [],
      createdAt: now,
    });

    const aliceId = a.insertedId.toString();
    const bobId = b.insertedId.toString();

    const t1 = await tasks.insertOne({
      userId: aliceId,
      title: "Alice Morning Meeting",
      date: "2025-11-06",
      start: "09:00",
      end: "10:00",
      description: "Alice first task",
      status: "SWAPPABLE",
      createdAt: now,
    });
    const t2 = await tasks.insertOne({
      userId: bobId,
      title: "Bob Team Sync",
      date: "2025-11-06",
      start: "10:00",
      end: "11:00",
      description: "Bob first task",
      status: "SWAPPABLE",
      createdAt: now,
    });
    const t3 = await tasks.insertOne({
      userId: aliceId,
      title: "Alice Workshop",
      date: "2025-11-07",
      start: "14:00",
      end: "16:00",
      description: "Technical workshop",
      status: "BUSY",
      createdAt: now,
    });
    const t4 = await tasks.insertOne({
      userId: bobId,
      title: "Bob Client Call",
      date: "2025-11-07",
      start: "11:00",
      end: "12:00",
      description: "Important client meeting",
      status: "SWAPPABLE",
      createdAt: now,
    });

    const t1Id = t1.insertedId.toString();
    const t2Id = t2.insertedId.toString();
    const t3Id = t3.insertedId.toString();
    const t4Id = t4.insertedId.toString();

    // Update users with their task IDs
    await users.updateOne({ _id: a.insertedId }, {
      $push: { taskIds: { $each: [t1Id, t3Id] } },
    } as any);
    await users.updateOne({ _id: b.insertedId }, {
      $push: { taskIds: { $each: [t2Id, t4Id] } },
    } as any);

    return NextResponse.json({
      ok: true,
      seeded: true,
      users: [
        { id: aliceId, email: "alice@example.com" },
        { id: bobId, email: "bob@example.com" },
      ],
      tasks: [t1Id, t2Id, t3Id, t4Id],
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
