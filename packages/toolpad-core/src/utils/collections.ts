export function asArray<T>(maybeArray: T | T[]): T[] {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

type PropertiesOf<P> = Extract<keyof P, string>;

type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type Ensure<U, K extends PropertyKey> = K extends keyof U ? Require<U, K> : U & Record<K, unknown>;

/**
 * Type aware version of Object.protoype.hasOwnProperty.
 * See https://fettblog.eu/typescript-hasownproperty/
 */
export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is Ensure<X, Y> {
  return obj.hasOwnProperty(prop);
}

/**
 * Maps `obj` to a new object. The `mapper` function receices an entry array of jey and value and
 * is allowed to manipulate both. It can also return `null` to omit a property from the result.
 */
export function mapProperties<P, L extends PropertyKey, U>(
  obj: P,
  mapper: <K extends PropertiesOf<P>>(old: [K, P[K]]) => [L, U] | null,
): Record<L, U>;
export function mapProperties<U, V>(
  obj: Record<string, U>,
  mapper: (old: [string, U]) => [string, V] | null,
): Record<string, V> {
  return Object.fromEntries(
    Object.entries(obj).flatMap((entry) => {
      const mapped = mapper(entry);
      return mapped ? [mapped] : [];
    }),
  );
}

/**
 * Maps an objects' property keys. The result is a new object with the mapped keys, but the same values.
 */
export function mapKeys<U>(
  obj: Record<string, U>,
  mapper: (old: string) => string,
): Record<string, U> {
  return mapProperties(obj, ([key, value]) => [mapper(key), value]);
}

/**
 * Maps an objects' property values. The result is a new object with the same keys, but mapped values.
 */
export function mapValues<P, V>(
  obj: P,
  mapper: (old: P[PropertiesOf<P>], key: PropertiesOf<P>) => V,
): Record<PropertiesOf<P>, V> {
  return mapProperties(obj, ([key, value]) => [key, mapper(value, key)]);
}
/**
 * Filters an objects' property values. Similar to `array.filter` but for objects. The result is a new
 * object with all the properties removed for which `filter` returned `false`.
 */
export function filterValues<P>(obj: P, filter: (old: P[keyof P]) => boolean): Partial<P>;
export function filterValues<U>(
  obj: Record<string, U>,
  filter: (old: U) => boolean,
): Record<string, U>;
export function filterValues<U>(
  obj: Record<string, U>,
  filter: (old: U) => boolean,
): Record<string, U> {
  return mapProperties(obj, ([key, value]) => (filter(value) ? [key, value] : null));
}

/**
 * Filters an objects' property keys. Similar to `array.filter` but for objects. The result is a new
 * object with all the properties removed for which `filter` returned `false`.
 */
export function filterKeys<P>(obj: P, filter: (old: keyof P) => boolean): Partial<P>;
export function filterKeys<U>(
  obj: Record<string, U>,
  filter: (old: string) => boolean,
): Record<string, U>;
export function filterKeys<U>(
  obj: Record<string, U>,
  filter: (old: string) => boolean,
): Record<string, U> {
  return mapProperties(obj, ([key, value]) => (filter(key) ? [key, value] : null));
}
