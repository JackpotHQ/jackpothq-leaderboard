import { cookies } from "next/headers";

export async function GET() {
  const jar = await cookies();
  // jar.delete("kick_access_token", { path: "/" });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "/";
  return Response.redirect(`${appUrl}/`, 302);
}
