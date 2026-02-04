import { NextResponse } from "next/server";

/**
 * GET /api/bitrix24-check — проверить, видит ли сервер BITRIX24_WEBHOOK_URL.
 * Не показывает значение переменной, только факт настройки.
 */
export async function GET() {
  const url = process.env.BITRIX24_WEBHOOK_URL;
  const configured = Boolean(url && url.startsWith("https://"));
  return NextResponse.json({
    configured,
    hint: configured
      ? "Webhook настроен, можно отправлять заявки."
      : "Добавьте BITRIX24_WEBHOOK_URL в .env.local и перезапустите сервер.",
  });
}
