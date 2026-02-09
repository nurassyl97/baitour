import { NextResponse } from "next/server";

type BookingBody = {
  fullName: string;
  email: string;
  phone: string;
  travelDate: string;
  adults: string | number;
  children: string | number;
  specialRequests?: string;
  tourId?: string | null;
  tourName?: string | null;
  variantId?: string | null;
  price?: number | null;
  currency?: string | null;
  /** Количество ночей выбранного варианта */
  nights?: number | null;
  /** Дата вылета (выбранный вариант) */
  departureDate?: string | null;
  /** Дата прилёта (вылет + ночи) */
  arrivalDate?: string | null;
  /** Название туроператора выбранного варианта */
  operatorName?: string | null;
};

function validateBody(body: unknown): body is BookingBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.fullName === "string" &&
    b.fullName.trim().length > 0 &&
    typeof b.email === "string" &&
    b.email.trim().length > 0 &&
    typeof b.phone === "string" &&
    b.phone.trim().length > 0 &&
    typeof b.travelDate === "string" &&
    b.travelDate.trim().length > 0
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!validateBody(body)) {
      return NextResponse.json(
        { error: "Не заполнены обязательные поля: имя, email, телефон, дата поездки" },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.BITRIX24_WEBHOOK_URL;
    if (!webhookUrl || !webhookUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Интеграция с Bitrix24 не настроена" },
        { status: 503 }
      );
    }

    const adults = typeof body.adults === "number" ? body.adults : parseInt(String(body.adults), 10) || 2;
    const children = typeof body.children === "number" ? body.children : parseInt(String(body.children), 10) || 0;
    const tourName = body.tourName ?? "Тур";
    const title = `Заявка на тур: ${tourName}`;

    const formatDateForComment = (isoOrLocal: string) => {
      const match = isoOrLocal.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) return `${match[3]}.${match[2]}.${match[1]}`;
      return isoOrLocal;
    };

    const commentsParts: string[] = [
      body.tourName ? `Тур: ${body.tourName}` : "",
      body.operatorName ? `Туроператор: ${body.operatorName}` : "",
      body.price != null ? `Цена: ${body.price} ${body.currency ?? "KZT"}` : "",
      body.nights != null ? `Ночей: ${body.nights}` : "",
      body.departureDate ? `Дата вылета: ${formatDateForComment(body.departureDate)}` : "",
      body.arrivalDate ? `Дата прилёта: ${formatDateForComment(body.arrivalDate)}` : "",
      `Дата поездки (в форме): ${body.travelDate}`,
      `Взрослых: ${adults}, детей: ${children}`,
      body.tourId ? `Тур ID: ${body.tourId}` : "",
      body.variantId ? `Вариант ID: ${body.variantId}` : "",
      body.specialRequests?.trim() ? `Пожелания: ${body.specialRequests.trim()}` : "",
    ].filter(Boolean);

    const fields = {
      TITLE: title,
      NAME: body.fullName.trim(),
      PHONE: [{ VALUE: body.phone.trim(), VALUE_TYPE: "WORK" }],
      EMAIL: [{ VALUE: body.email.trim(), VALUE_TYPE: "WORK" }],
      COMMENTS: commentsParts.join("\n"),
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    const text = await res.text();
    let json: { result?: number; error?: string; error_description?: string } = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      // ignore
    }

    if (!res.ok) {
      console.warn("Bitrix24 crm.lead.add HTTP error:", res.status, json.error ?? text);
      const msg = json.error_description ?? (res.status === 401 ? "Неверный webhook (проверьте URL и токен)." : "Не удалось создать заявку в CRM. Попробуйте позже.");
      return NextResponse.json(
        { error: msg },
        { status: 500 }
      );
    }

    if (json.error) {
      console.warn("Bitrix24 crm.lead.add API error:", json.error, json.error_description);
      const msg = json.error_description ?? "У webhook нет прав на создание лидов (проверьте права в Bitrix24).";
      return NextResponse.json(
        { error: msg },
        { status: 500 }
      );
    }

    if (json.result == null) {
      console.warn("Bitrix24 returned 200 but no lead ID. Response:", text.slice(0, 300));
      return NextResponse.json(
        { error: "Bitrix24 не вернул ID лида. Проверьте URL webhook и права (CRM)." },
        { status: 500 }
      );
    }

    console.info("Bitrix24 lead created, ID:", json.result, "| name:", body.fullName?.trim());

    const referenceNumber = `TR${Date.now()}`;
    return NextResponse.json({
      success: true,
      referenceNumber,
      message: "Заявка успешно отправлена",
    });
  } catch (err) {
    console.error("Bookings API error:", err);
    return NextResponse.json(
      { error: "Произошла ошибка при отправке заявки. Попробуйте позже." },
      { status: 500 }
    );
  }
}
