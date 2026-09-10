"use client";

import { useEffect, useState } from "react";

import { ageDetail } from "@/lib/age";
import { site } from "@/lib/site-data";

/**
 * 年龄由出生日期算出来，不写死。
 *
 * 页面是静态产出的：构建时会算一次（保证无 JS 也有数字），
 * 挂载后再按访问者的本地时间重算一次，跨过生日就不会显示旧值。
 * 两次结果可能不同，所以对这个文本节点关掉水合告警。
 */
export function Age() {
  const [detail, setDetail] = useState(() => ageDetail(site.birth));

  useEffect(() => {
    setDetail(ageDetail(site.birth));
  }, []);

  return (
    <span suppressHydrationWarning>
      {detail.age} 岁
      <span className="text-faint">
        （{detail.birthYear} 年生，距 {detail.age + 1} 岁生日 {detail.daysToBirthday} 天）
      </span>
    </span>
  );
}
