export function searchId(str:string|undefined): number | undefined {
  if(!str) return undefined;
  const num = !isNaN(+str) ? +str : undefined
  return num && num < 2e9 && num > 0 ? num : undefined
}