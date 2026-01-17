import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await prisma.record.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Get records error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { timeEntries, ...rest } = body;

    // Calculate sum from time entries
    let suma = 0;
    if (timeEntries && Array.isArray(timeEntries)) {
      suma = timeEntries.reduce(
        (total: number, entry: any) => total + (parseFloat(entry?.hours ?? 0) || 0),
        0
      );
    }

    const record = await prisma.record.create({
      data: {
        ...rest,
        timeEntries: timeEntries || [],
        suma,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Create record error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia rekordu" },
      { status: 500 }
    );
  }
}
