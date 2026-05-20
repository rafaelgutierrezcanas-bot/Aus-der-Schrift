import { Redis } from "@upstash/redis";

export const kv = new Redis({
  url: process.env.blog_KV_REST_API_URL!,
  token: process.env.blog_KV_REST_API_TOKEN!,
});
