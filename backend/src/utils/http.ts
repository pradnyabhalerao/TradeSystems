export class HttpError extends Error {
  constructor(public statusCode: number, message: string) { super(message); }
}
export const idParam = (value: string | string[]) => {
  if (Array.isArray(value)) throw new HttpError(400, "Invalid identifier");
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "Invalid identifier");
  return id;
};
export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
