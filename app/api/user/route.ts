import { NextResponse } from "next/server";
import getMongoClientPromise from "../../../lib/mongodb";
import getUserFromRequest from "../../../lib/get-user";
import { ObjectId } from "mongodb";

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
    const users = db.collection("users");
    const tasks = db.collection("tasks");

    // Get user document with taskIds
    const userDoc = await users.findOne(
      { _id: new ObjectId(user.sub) },
      { projection: { passwordHash: 0 } } // Exclude password hash
    );

    if (!userDoc) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get task details for each task ID in user's taskIds array
    const taskDetails = [];
    if (userDoc.taskIds && userDoc.taskIds.length > 0) {
      const taskObjectIds = userDoc.taskIds.map(
        (id: string) => new ObjectId(id)
      );
      const tasksFromDB = await tasks
        .find({ _id: { $in: taskObjectIds } })
        .toArray();
      taskDetails.push(...tasksFromDB);
    }

    return NextResponse.json({
      ok: true,
      user: {
        ...userDoc,
        _id: userDoc._id.toString(),
        taskDetails: taskDetails,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
