import { NextResponse } from "next/server";
import getMongoClientPromise from "../../../lib/mongodb";
import getUserFromRequest from "../../../lib/get-user";
import { ObjectId } from "mongodb";

type TaskBody = {
  title?: string;
  start?: string;
  end?: string;
  date?: string;
  description?: string;
};

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !user.sub)
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );

    const clientPromise = getMongoClientPromise();
    if (!clientPromise)
      return NextResponse.json(
        { ok: false, error: "MONGODB_URI not configured" },
        { status: 500 }
      );

    const client = await clientPromise;
    const db = client.db();
    const tasks = db.collection("tasks");

    const userId = String(user.sub);
    const docs = await tasks.find({ userId }).toArray();
    return NextResponse.json({ ok: true, tasks: docs });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !user.sub)
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );

    const body: TaskBody = await req.json();
    const { title, start, end, date, description } = body;
    if (!title || !date)
      return NextResponse.json(
        { ok: false, error: "title and date required" },
        { status: 400 }
      );

    const clientPromise = getMongoClientPromise();
    if (!clientPromise)
      return NextResponse.json(
        { ok: false, error: "MONGODB_URI not configured" },
        { status: 500 }
      );

    const client = await clientPromise;
    const db = client.db();
    const tasks = db.collection("tasks");
    const users = db.collection("users");

    const now = new Date();
    const doc = {
      userId: String(user.sub),
      title,
      start: start ?? null,
      end: end ?? null,
      date,
      description: description ?? null,
      status: "SWAPPABLE", // Default status for new tasks
      createdAt: now,
    };

    // Insert the task
    const res = await tasks.insertOne(doc as any);
    const taskId = res.insertedId.toString();

    // Add task ID to user's taskIds array
    await users.updateOne({ _id: new ObjectId(user.sub) }, {
      $push: { taskIds: taskId },
    } as any);

    return NextResponse.json({
      ok: true,
      task: { _id: taskId, id: taskId, ...doc },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !user.sub)
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );

    const url = new URL(req.url);
    const taskId = url.searchParams.get("id");
    if (!taskId)
      return NextResponse.json(
        { ok: false, error: "Task ID required" },
        { status: 400 }
      );

    const clientPromise = getMongoClientPromise();
    if (!clientPromise)
      return NextResponse.json(
        { ok: false, error: "MONGODB_URI not configured" },
        { status: 500 }
      );

    const client = await clientPromise;
    const db = client.db();
    const tasks = db.collection("tasks");
    const users = db.collection("users");

    // Verify task ownership
    const task = await tasks.findOne({ _id: new ObjectId(taskId) });
    if (!task)
      return NextResponse.json(
        { ok: false, error: "Task not found" },
        { status: 404 }
      );

    if (task.userId !== String(user.sub))
      return NextResponse.json(
        { ok: false, error: "Not authorized to delete this task" },
        { status: 403 }
      );

    // Delete the task
    await tasks.deleteOne({ _id: new ObjectId(taskId) });

    // Remove task ID from user's taskIds array
    await users.updateOne({ _id: new ObjectId(user.sub) }, {
      $pull: { taskIds: taskId },
    } as any);

    return NextResponse.json({ ok: true, deleted: taskId });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
