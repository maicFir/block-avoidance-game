import { useState, useEffect } from "react";
import { isMobile } from "@/utils";
import { truncate } from "fs";
/**
 *
 * @returns 判断客户端是否是pc显示还是phone显示
 */
export const useIsPc = () => {
  // 默认就是PC
  const [isPc, setIsPc] = useState<boolean>(true);
  useEffect(() => {
    const handleSetPc = () => {
      setIsPc(!isMobile());
    };
    handleSetPc();
    window.addEventListener("resize", handleSetPc);
    return () => {
      window.removeEventListener("resize", handleSetPc);
    };
  }, []);

  return {
    isPc,
  };
};
