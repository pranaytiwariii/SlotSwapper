import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // Do not throw here (same reasoning as other libs). Caller should handle missing secret.
}

export function signToken(payload: object, options?: jwt.SignOptions) {
  if (!JWT_SECRET)
    throw new Error("JWT_SECRET is not defined in the environment");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d", ...(options ?? {}) });
}

export function verifyToken(token: string) {
  if (!JWT_SECRET)
    throw new Error("JWT_SECRET is not defined in the environment");
  return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
}

export default { signToken, verifyToken };
