/**
 * @description 请添加组件描述
 * @author maicFir
 */
import React, {memo} from "react";
import { SvgIconProps } from "./index";

const LiveIcon: React.FC<SvgIconProps> = props => {
  const {
    width = 20,
    height = 20
  } = props;
    return <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5109" width={ width } height={ height}><path d="M891.904 377.856c-1.024 102.912-37.376 184.32-93.696 254.976-75.264 95.232-163.328 176.64-266.752 242.176-15.872 9.728-22.528 9.728-37.888-1.024-115.2-76.288-217.088-166.4-293.376-281.6-49.152-73.728-79.872-155.648-62.976-244.736 21.504-115.2 97.28-196.096 218.624-204.8 48.128-3.584 98.816 10.752 136.704 46.592 15.36 14.336 24.064 12.8 39.936 0 94.208-75.264 232.96-52.736 303.104 43.52 34.816 47.616 51.712 98.304 56.32 144.896z" fill="#d81e06" p-id="5110"></path></svg>;
};

export default memo(LiveIcon);
