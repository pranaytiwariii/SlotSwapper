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
    const swapRequests = db.collection("swapRequests");

    const userId = String(user.sub);

    // Get all pending swap requests where user is either requester or target
    const pendingRequests = await swapRequests
      .aggregate([
        {
          $match: {
            $or: [{ requesterId: userId }, { targetUserId: userId }],
            status: "PENDING",
          },
        },
        {
          $lookup: {
            from: "tasks",
            localField: "requesterSlotId",
            foreignField: "_id",
            as: "requesterSlot",
          },
        },
        {
          $lookup: {
            from: "tasks",
            localField: "targetSlotId",
            foreignField: "_id",
            as: "targetSlot",
          },
        },
        {
          $addFields: {
            requesterObjectId: { $toObjectId: "$requesterId" },
            targetUserObjectId: { $toObjectId: "$targetUserId" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "requesterObjectId",
            foreignField: "_id",
            as: "requester",
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
          $lookup: {
            from: "users",
            localField: "targetUserObjectId",
            foreignField: "_id",
            as: "targetUser",
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
          $unwind: "$requesterSlot",
        },
        {
          $unwind: "$targetSlot",
        },
        {
          $unwind: "$requester",
        },
        {
          $unwind: "$targetUser",
        },
      ])
      .toArray();

    return NextResponse.json({
      ok: true,
      pendingRequests,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
