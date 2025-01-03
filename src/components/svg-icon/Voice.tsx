/**
 * @description 请添加组件描述
 * @author maicFir
 */
import React, {memo} from "react";

import { SvgIconProps} from "./index";

const Voice: React.FC<SvgIconProps> = props => {
    const {
        width = 20,
        height = 20,
        onClick
  } = props;
    return <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9633" onClick={onClick} width={ width} height={ height}><path d="M864 157.333333V725.333333a117.333333 117.333333 0 1 1-64-104.533333V376l-469.333333 37.546667V768a117.333333 117.333333 0 0 1-112.618667 117.248L213.333333 885.333333a117.333333 117.333333 0 1 1 53.333334-221.866666V205.12l597.333333-47.786667zM213.333333 714.666667a53.333333 53.333333 0 1 0 0 106.666666 53.333333 53.333333 0 0 0 0-106.666666z m533.333334-42.666667a53.333333 53.333333 0 1 0 0 106.666667 53.333333 53.333333 0 0 0 0-106.666667z m53.333333-445.333333l-469.333333 37.546666v85.12l469.333333-37.546666v-85.12z" fill="#1677FF" p-id="9634"></path></svg>;
};

export default memo(Voice);
