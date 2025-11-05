import { verifyToken } from "./auth";

export function getUserFromRequest(req: Request) {
  try {
    const auth =
      req.headers.get("authorization") || req.headers.get("Authorization");
    if (!auth) return null;
    const parts = auth.split(" ");
    if (parts.length !== 2) return null;
    const token = parts[1];
    const payload = verifyToken(token);
    return payload;
  } catch (err) {
    return null;
  }
}

export default getUserFromRequest;
