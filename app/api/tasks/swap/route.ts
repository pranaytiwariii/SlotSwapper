import { NextResponse } from "next/server";
import getMongoClientPromise from "../../../../lib/mongodb";
import getUserFromRequest from "../../../../lib/get-user";
import { ObjectId } from "mongodb";

type Body = { myTaskId?: string; otherTaskId?: string };

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !user.sub)
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );

    const body: Body = await req.json();
    const { myTaskId, otherTaskId } = body;
    if (!myTaskId || !otherTaskId)
      return NextResponse.json(
        { ok: false, error: "myTaskId and otherTaskId required" },
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

    const myTask = await tasks.findOne({ _id: new ObjectId(myTaskId) });
    const otherTask = await tasks.findOne({ _id: new ObjectId(otherTaskId) });
    if (!myTask || !otherTask)
      return NextResponse.json(
        { ok: false, error: "task(s) not found" },
        { status: 404 }
      );

    const userId = String(user.sub);
    if (String(myTask.userId) !== userId)
      return NextResponse.json(
        { ok: false, error: "You must own myTask to propose swap" },
        { status: 403 }
      );

    // swap owners
    const res1 = await tasks.updateOne(
      { _id: myTask._id },
      { $set: { userId: otherTask.userId } }
    );
    const res2 = await tasks.updateOne(
      { _id: otherTask._id },
      { $set: { userId: myTask.userId } }
    );

    return NextResponse.json({ ok: true, swapped: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
