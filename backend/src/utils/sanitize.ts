export const sanitize = (u: any) => {
  if (!u) return null;
  const { passwordHash, __v, ...rest } = u.toObject ? u.toObject() : u;
  return rest;
};