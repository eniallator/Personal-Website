import { Option } from "niall-utils/functional";
import { throttled } from "niall-utils/timing";

interface Bucket {
  count: number;
  expires: number;
}

export const createRateLimiter = (windowMs: number, max: number) => {
  const buckets = new Map<string, Bucket>();

  const sweep = throttled(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.expires <= now) buckets.delete(key);
    }
  }, windowMs);

  return (key: string, now: number = Date.now()): boolean =>
    Option.from(buckets.get(key))
      .tap(sweep)
      .filter(bucket => bucket.expires > now)
      .fold(
        () => {
          buckets.set(key, { count: 1, expires: now + windowMs });
          return true;
        },
        bucket => {
          if (bucket.count >= max) return false;
          bucket.count++;
          return true;
        }
      );
};
