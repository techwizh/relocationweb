import { NextResponse } from "next/server";
import { requireDriverUser } from "@/lib/driver-auth";

export async function GET() {
  try {
    const user = await requireDriverUser();
    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        driverProfile: user.driverProfile
          ? {
              id: user.driverProfile.id,
              status: user.driverProfile.status,
              rejectionReason: user.driverProfile.rejectionReason,
              isAvailable: user.driverProfile.isAvailable,
              vehicle: user.driverProfile.vehicle
                ? {
                    type: user.driverProfile.vehicle.type,
                    make: user.driverProfile.vehicle.make,
                    model: user.driverProfile.vehicle.model,
                    plateNumber: user.driverProfile.vehicle.plateNumber,
                  }
                : null,
            }
          : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
