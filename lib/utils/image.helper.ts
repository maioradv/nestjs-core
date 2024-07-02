import { BinaryLike, createHash } from "crypto";

export function checksumFromBuffer(buffer: BinaryLike) {
  return createHash('md5').update(buffer).digest("base64");
}