type Reservation = unknown;

type Reserve = {
  (from: Date, to: Date, destination: string): Reservation;
  (from: Date, destination: string): Reservation;
  (destination: string): Reservation;
};

function call<T extends [unknown, string, ...unknown[]], R>(
  f: (...args: T) => R,
  ...args: T
): R {
  return f(...args);
}

function is<T>(a: T, ...b: [T, ...T[]]): boolean {
  return b.every((_) => _ === a);
}

class RequestBuilder {
  protected data: object | null = null;
  protected method: "get" | "post" | null = null;

  setMethod(method: "get" | "post") {}
}

type None = unknown;

interface Option<T> {
  flatMap<U>(f: (value: T) => None): None;
  flatMap<U>(f: (value: T) => Option<U>): Option<U>;
}
