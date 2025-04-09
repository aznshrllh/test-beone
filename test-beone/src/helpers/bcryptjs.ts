import bcrypt from "bcryptjs";

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 8);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}
