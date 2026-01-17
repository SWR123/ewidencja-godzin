import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent deleting yourself
    if (session?.user?.id === params?.id) {
      return NextResponse.json(
        { error: "Nie możesz usunąć własnego konta" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params?.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas usuwania użytkownika" },
      { status: 500 }
    );
  }
}
