import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("kick_access_token")?.value;
  if (!token) {
    return Response.json({ authenticated: false }, { status: 200 });
  }

  try {
    const r = await fetch("https://api.kick.com/public/v1/users", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return Response.json(
        { authenticated: true, error: true, status: r.status, bodyPreview: text.slice(0, 120) },
        { status: 200 }
      );
    }

    const json = await r.json();
    const user = json?.data?.[0] || null;

    return Response.json({ authenticated: true, me: user }, { status: 200 });
  } catch (e: any) {
    return Response.json(
      { authenticated: true, error: true, message: e?.message || "unknown error" },
      { status: 200 }
    );
  }
}
