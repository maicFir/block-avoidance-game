/**
 * @description 请添加组件描述
 * @author maicFir
 */
import React, { memo } from "react";

import { SvgIconProps } from "./index";

const Left: React.FC<SvgIconProps> = (props) => {
  const { width = 20, height = 20, onClick, className = "" } = props;
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      onClick={onClick}
        className={className}
          id="left-icon"
    >
      <path d="M966.656 567.296q0 43.008-20.48 58.368t-65.536 15.36l-64.512 0q-44.032 0-93.696 0.512t-96.768 0.512l-74.752 0q-38.912 0-61.952 7.68t-22.016 35.328q0 20.48-1.024 48.64t-1.024 49.664q0 35.84-19.456 45.568t-50.176-13.824q-30.72-24.576-72.704-57.856t-85.504-68.096-86.016-68.608-75.264-59.392q-30.72-24.576-31.232-46.592t28.16-45.568q28.672-24.576 68.608-56.832t82.944-66.56 84.48-68.096 74.24-60.416q35.84-28.672 58.88-22.016t23.04 43.52l0 25.6q0 14.336 0.512 29.696t1.024 30.208 0.512 26.112q1.024 25.6 16.384 32.256t41.984 6.656q29.696 0 77.824-0.512t100.352-0.512 101.376-0.512 79.872-0.512q13.312 0 27.648 2.048t26.112 9.728 19.456 21.504 7.68 36.352q0 27.648 0.512 53.248t0.512 57.344z"></path>
    </svg>
  );
};

export default memo(Left);
