import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const jar = await cookies();
  const verifier = jar.get("kick_pkce_verifier")?.value;
  const expectedState = jar.get("kick_oauth_state")?.value;

  if (!code || !state || !verifier || state !== expectedState) {
    return new Response("Invalid OAuth state", { status: 400 });
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.KICK_CLIENT_ID!,
    client_secret: process.env.KICK_CLIENT_SECRET!,
    redirect_uri: process.env.KICK_REDIRECT_URI!,
    code_verifier: verifier,
    code,
  });

  const res = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    return new Response(`Token exchange failed: ${err}`, { status: 500 });
  }

  const tokens = await res.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: "Bearer";
    scope: string;
  };

  // store the access token (demo: cookie; for prod use a session store)
  const jar2 = await cookies();
  jar2.set("kick_access_token", tokens.access_token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });

  // clean transient cookies
  jar2.delete("kick_pkce_verifier");
  jar2.delete("kick_oauth_state");

  // send user back
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "/";
  return Response.redirect(`${appUrl}/`, 302);
}
