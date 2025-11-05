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
      title: "Alice Task A",
      date: "2025-11-06",
      start: "09:00",
      end: "10:00",
      description: "Alice first task",
      createdAt: now,
    });
    const t2 = await tasks.insertOne({
      userId: bobId,
      title: "Bob Task B",
      date: "2025-11-06",
      start: "10:00",
      end: "11:00",
      description: "Bob first task",
      createdAt: now,
    });

    const t1Id = t1.insertedId.toString();
    const t2Id = t2.insertedId.toString();

    // Update users with their task IDs
    await users.updateOne({ _id: a.insertedId }, {
      $push: { taskIds: t1Id },
    } as any);
    await users.updateOne({ _id: b.insertedId }, {
      $push: { taskIds: t2Id },
    } as any);

    return NextResponse.json({
      ok: true,
      seeded: true,
      users: [
        { id: aliceId, email: "alice@example.com" },
        { id: bobId, email: "bob@example.com" },
      ],
      tasks: [t1Id, t2Id],
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
