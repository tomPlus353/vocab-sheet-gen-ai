import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash } from "crypto";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHashedCache(key: string): string | null {
  //create sha256 hash of key
  const hashToCheck = createHash("sha256")
    .update(key)
    .digest("hex");
  // retrieve previously content from local storage if it exists
  const cachedResponse = localStorage.getItem(hashToCheck);
  return cachedResponse;

}

export function setHashedCache(key: string, content: string): void {
  //create sha256 hash of content
  const hashToSet = createHash("sha256")
    .update(key)
    .digest("hex");
  // store content in local storage
  localStorage.setItem(hashToSet, content);
}
