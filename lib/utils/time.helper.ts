export function toMs(str:string): number {
  const matches = str.match(/(\d+)/);
  const number = +matches[0] ?? 0
  const mode = str.replace(matches[0],'')
  const unit = 1000;
  const conversion = {
    d: unit * 60 * 60 * 24,
    h: unit * 60 * 60,
    m: unit * 60,
    s: unit,
  }
  return conversion[mode] * number ?? 0
}