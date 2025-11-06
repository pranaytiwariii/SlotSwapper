import { NextResponse } from "next/server";
import getMongoClientPromise from "../../../lib/mongodb";
import getUserFromRequest from "../../../lib/get-user";
import { ObjectId } from "mongodb";

type SwapResponseBody = {
  requestId: string;
  accepted: boolean;
};

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !user.sub)
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );

    const { requestId, accepted }: SwapResponseBody = await req.json();

    if (!requestId) {
      return NextResponse.json(
        { ok: false, error: "requestId is required" },
        { status: 400 }
      );
    }

    if (typeof accepted !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "accepted field must be a boolean" },
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
    const tasks = db.collection("tasks");
    const swapRequests = db.collection("swapRequests");
    const users = db.collection("users");

    const userId = String(user.sub);

    // Find the swap request and verify the user is the target user
    const swapRequest = await swapRequests.findOne({
      _id: new ObjectId(requestId),
      targetUserId: userId,
      status: "PENDING",
    });

    if (!swapRequest) {
      return NextResponse.json(
        { ok: false, error: "Swap request not found or not authorized" },
        { status: 404 }
      );
    }

    if (accepted) {
      // ACCEPTED: Exchange ownership of the slots
      const session = client.startSession();

      try {
        await session.withTransaction(async () => {
          // Get both slots
          const requesterSlot = await tasks.findOne(
            { _id: swapRequest.requesterSlotId },
            { session }
          );
          const targetSlot = await tasks.findOne(
            { _id: swapRequest.targetSlotId },
            { session }
          );

          if (!requesterSlot || !targetSlot) {
            throw new Error("One or both slots not found");
          }

          // Exchange the ownership
          await tasks.updateOne(
            { _id: swapRequest.requesterSlotId },
            {
              $set: {
                userId: swapRequest.targetUserId,
                status: "BUSY",
                updatedAt: new Date(),
              },
            },
            { session }
          );

          await tasks.updateOne(
            { _id: swapRequest.targetSlotId },
            {
              $set: {
                userId: swapRequest.requesterId,
                status: "BUSY",
                updatedAt: new Date(),
              },
            },
            { session }
          );

          // Update user task arrays
          await users.updateOne(
            { _id: new ObjectId(swapRequest.requesterId) },
            {
              $pull: { taskIds: swapRequest.requesterSlotId.toString() },
              $push: { taskIds: swapRequest.targetSlotId.toString() },
            },
            { session }
          );

          await users.updateOne(
            { _id: new ObjectId(swapRequest.targetUserId) },
            {
              $pull: { taskIds: swapRequest.targetSlotId.toString() },
              $push: { taskIds: swapRequest.requesterSlotId.toString() },
            },
            { session }
          );

          // Mark swap request as accepted
          await swapRequests.updateOne(
            { _id: new ObjectId(requestId) },
            {
              $set: {
                status: "ACCEPTED",
                respondedAt: new Date(),
                updatedAt: new Date(),
              },
            },
            { session }
          );
        });

        return NextResponse.json({
          ok: true,
          message: "Swap completed successfully",
        });
      } finally {
        await session.endSession();
      }
    } else {
      // REJECTED: Set slots back to SWAPPABLE
      await tasks.updateMany(
        {
          _id: { $in: [swapRequest.requesterSlotId, swapRequest.targetSlotId] },
        },
        {
          $set: {
            status: "SWAPPABLE",
            updatedAt: new Date(),
          },
        }
      );

      // Mark swap request as rejected
      await swapRequests.updateOne(
        { _id: new ObjectId(requestId) },
        {
          $set: {
            status: "REJECTED",
            respondedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        ok: true,
        message: "Swap request rejected",
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
