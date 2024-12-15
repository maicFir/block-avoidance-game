export * from "./RandomPicker";

/**
 *
 * @returns true 移动端 false pc端
 */
export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };