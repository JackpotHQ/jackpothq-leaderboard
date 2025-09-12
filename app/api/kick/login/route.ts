import { cookies } from "next/headers";

function base64url(buf: ArrayBuffer) {
  const bytes = Buffer.from(buf).toString("base64");
  return bytes.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function sha256(input: string) {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return base64url(hash);
}
function rand(n = 43) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
  return Array.from(crypto.getRandomValues(new Uint8Array(n)), b => chars[b % chars.length]).join("");
}

export async function GET() {
  const clientId = process.env.KICK_CLIENT_ID!;
  const redirectUri = process.env.KICK_REDIRECT_URI!;
  const scopes = process.env.KICK_SCOPES || "user:read";

  // PKCE
  const verifier = rand(64);
  const challenge = await sha256(verifier);
  const state = rand(24);

  // store verifier & state in httpOnly cookies for the callback to read
  const jar = await cookies();
  jar.set("kick_pkce_verifier", verifier, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  jar.set("kick_oauth_state", state, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });

  const authUrl = new URL("https://id.kick.com/oauth/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return Response.redirect(authUrl.toString(), 302);
}
