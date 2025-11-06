import { NextResponse } from "next/server";
import getMongoClientPromise from "../../../lib/mongodb";
import getUserFromRequest from "../../../lib/get-user";

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
    const users = db.collection("users");

    const userId = String(user.sub);

    // Find all tasks that are SWAPPABLE and not owned by the current user
    const swappableSlots = await tasks
      .aggregate([
        {
          $match: {
            userId: { $ne: userId },
            status: "SWAPPABLE",
          },
        },
        {
          $addFields: {
            userObjectId: { $toObjectId: "$userId" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userObjectId",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  name: 1,
                  email: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$owner",
        },
      ])
      .toArray();

    return NextResponse.json({
      ok: true,
      swappableSlots,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
