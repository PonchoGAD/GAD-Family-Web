export const shorten = (a?: string, l = 6, r = 4) =>
  a ? `${a.slice(0, l)}…${a.slice(-r)}` : "";

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
