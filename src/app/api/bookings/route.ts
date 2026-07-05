import { NextResponse } from "next/server";
import type { CityId } from "@/lib/locations";
import { grantBookingAccess } from "@/lib/booking-access";
import { getCustomerUser } from "@/lib/customer-auth";
import { isMpesaPaymentSkipped } from "@/lib/payment-config";
import { prisma } from "@/lib/prisma";
import { isValidKenyanPhone } from "@/lib/phone";
import type { VehicleTypeId } from "@/lib/vehicles";
import { getVehicleById } from "@/lib/vehicles";
import type { City, VehicleType } from "@prisma/client";

const CITY_MAP: Record<CityId, City> = {
  mombasa: "MOMBASA",
  nairobi: "NAIROBI",
};

const VEHICLE_MAP: Record<VehicleTypeId, VehicleType> = {
  van: "VAN",
  pickup: "PICKUP",
  canter: "CANTER",
  lorry: "LORRY",
};

type BookingPayload = {
  cityId: CityId;
  contactName: string;
  contactPhone: string;
  pickupSubCounty: string;
  pickupWard: string;
  pickupLandmark?: string;
  dropoffSubCounty: string;
  dropoffWard: string;
  dropoffLandmark?: string;
  scheduledAt: string;
  vehicleType: VehicleTypeId;
  notes?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingPayload;
    const vehicle = getVehicleById(payload.vehicleType);
    const customer = await getCustomerUser();

    if (!vehicle) {
      return NextResponse.json({ error: "Invalid vehicle type." }, { status: 400 });
    }

    if (!payload.contactName?.trim()) {
      return NextResponse.json({ error: "Contact name is required." }, { status: 400 });
    }

    if (!isValidKenyanPhone(payload.contactPhone)) {
      return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
    }

    if (
      !payload.pickupSubCounty ||
      !payload.pickupWard ||
      !payload.dropoffSubCounty ||
      !payload.dropoffWard ||
      !payload.scheduledAt
    ) {
      return NextResponse.json(
        { error: "Sub-county, ward, and move date are required." },
        { status: 400 },
      );
    }

    const bookingData = {
      customerId: customer?.role === "CUSTOMER" ? customer.id : null,
      city: CITY_MAP[payload.cityId],
      contactName: payload.contactName.trim(),
      contactPhone: payload.contactPhone,
      pickupSubCounty: payload.pickupSubCounty,
      pickupWard: payload.pickupWard.trim(),
      pickupLandmark: payload.pickupLandmark?.trim() || null,
      dropoffSubCounty: payload.dropoffSubCounty,
      dropoffWard: payload.dropoffWard.trim(),
      dropoffLandmark: payload.dropoffLandmark?.trim() || null,
      scheduledAt: new Date(payload.scheduledAt),
      vehicleType: VEHICLE_MAP[payload.vehicleType],
      estimatedPrice: vehicle.basePriceKes,
      notes: payload.notes?.trim() || null,
    };

    if (isMpesaPaymentSkipped()) {
      const booking = await prisma.$transaction(async (tx) => {
        const created = await tx.booking.create({
          data: {
            ...bookingData,
            status: "PAID",
          },
        });

        await tx.payment.create({
          data: {
            bookingId: created.id,
            amount: vehicle.basePriceKes,
            phoneNumber: payload.contactPhone,
            status: "COMPLETED",
            mpesaReceipt: "DEV-SKIP",
            resultDesc: "Payment skipped for development.",
          },
        });

        return created;
      });

      await grantBookingAccess(booking.id);

      return NextResponse.json({
        bookingId: booking.id,
        redirectTo: `/book/${booking.id}/chat`,
      });
    }

    const booking = await prisma.booking.create({
      data: {
        ...bookingData,
        status: "PENDING_PAYMENT",
      },
    });

    await grantBookingAccess(booking.id);

    return NextResponse.json({
      bookingId: booking.id,
      redirectTo: `/book/${booking.id}/pay`,
    });
  } catch {
    return NextResponse.json({ error: "Could not create booking." }, { status: 500 });
  }
}
