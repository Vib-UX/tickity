/**
 * Safely converts BigInt values to strings for serialization
 */
export const safeBigIntToString = (value: any): string => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (value && typeof value.toString === "function") {
    return value.toString();
  }
  return String(value);
};

/**
 * Safely converts an array of BigInt values to strings
 */
export const safeBigIntArrayToStrings = (array: any[]): string[] => {
  return array.map(safeBigIntToString);
};

/**
 * Recursively converts all BigInt values in an object to strings
 */
export const serializeBigInts = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts);
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = serializeBigInts(obj[key]);
      }
    }
    return result;
  }

  return obj;
};
