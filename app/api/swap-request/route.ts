import { NextResponse } from "next/server";
import getMongoClientPromise from "../../../lib/mongodb";
import getUserFromRequest from "../../../lib/get-user";
import { ObjectId } from "mongodb";

type SwapRequestBody = {
  mySlotId: string;
  theirSlotId: string;
};

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !user.sub)
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );

    const { mySlotId, theirSlotId }: SwapRequestBody = await req.json();

    if (!mySlotId || !theirSlotId) {
      return NextResponse.json(
        { ok: false, error: "Both mySlotId and theirSlotId are required" },
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

    const userId = String(user.sub);

    // Verify both slots exist and are swappable
    const mySlot = await tasks.findOne({
      _id: new ObjectId(mySlotId),
      userId: userId,
      status: "SWAPPABLE",
    });

    const theirSlot = await tasks.findOne({
      _id: new ObjectId(theirSlotId),
      userId: { $ne: userId },
      status: "SWAPPABLE",
    });

    if (!mySlot) {
      return NextResponse.json(
        { ok: false, error: "Your slot not found or not swappable" },
        { status: 400 }
      );
    }

    if (!theirSlot) {
      return NextResponse.json(
        { ok: false, error: "Their slot not found or not swappable" },
        { status: 400 }
      );
    }

    // Check if there's already a pending request for these slots
    const existingRequest = await swapRequests.findOne({
      $or: [
        {
          requesterSlotId: new ObjectId(mySlotId),
          targetSlotId: new ObjectId(theirSlotId),
          status: "PENDING",
        },
        {
          requesterSlotId: new ObjectId(theirSlotId),
          targetSlotId: new ObjectId(mySlotId),
          status: "PENDING",
        },
      ],
    });

    if (existingRequest) {
      return NextResponse.json(
        { ok: false, error: "A swap request already exists for these slots" },
        { status: 400 }
      );
    }

    // Create the swap request
    const swapRequest = await swapRequests.insertOne({
      requesterId: userId,
      targetUserId: theirSlot.userId,
      requesterSlotId: new ObjectId(mySlotId),
      targetSlotId: new ObjectId(theirSlotId),
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update both slots to SWAP_PENDING
    await tasks.updateMany(
      {
        _id: { $in: [new ObjectId(mySlotId), new ObjectId(theirSlotId)] },
      },
      {
        $set: {
          status: "SWAP_PENDING",
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      ok: true,
      swapRequestId: swapRequest.insertedId,
      message: "Swap request created successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
