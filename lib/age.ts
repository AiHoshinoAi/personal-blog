/**
 * 年龄计算。出生日期只存 ISO 字符串，页面上的数字由这里算出来。
 */

/** 按 YYYY-MM-DD 拆分，避开 new Date(string) 的时区歧义 */
function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) throw new Error(`非法出生日期：${iso}`);
  return [y, m, d];
}

export function calculateAge(iso: string, now: Date = new Date()): number {
  const [birthYear, birthMonth, birthDay] = parts(iso);
  let age = now.getFullYear() - birthYear;
  const thisYearBirthday = new Date(now.getFullYear(), birthMonth - 1, birthDay);
  if (now < thisYearBirthday) age -= 1;
  return Math.max(0, age);
}

/** 周岁 + 下一个生日还剩多少天，两个数字都由日期推导 */
export function ageDetail(iso: string, now: Date = new Date()) {
  const age = calculateAge(iso, now);
  const [birthYear, birthMonth, birthDay] = parts(iso);
  let next = new Date(now.getFullYear(), birthMonth - 1, birthDay);
  if (next <= now) next = new Date(now.getFullYear() + 1, birthMonth - 1, birthDay);
  const days = Math.ceil((next.getTime() - now.getTime()) / 86_400_000);
  return { age, birthYear, daysToBirthday: days };
}
