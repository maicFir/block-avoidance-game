/**
 * @description 请添加组件描述
 * @author maicFir
 */
import React, {memo} from "react";
import { Box } from "@mui/material";
import { LeftIcon,RightIcon, TopIcon} from "@comp/svg-icon";
import style from "./index.module.scss";
interface Props {
    moveLeft: () => void;
    moveRight: () => void;
}

const Index: React.FC<Props> = props => {
    const { moveLeft,moveRight } = props;
    const handleMoveLeft = () => {
        console.log("left");
        moveLeft?.();
    }
    const handleMoveRight = () => {
        console.log("right");
        moveRight?.()
    }
    return <Box className={style["app"]}>
        <TopIcon className="top" />
        <LeftIcon className="left" onClick={ handleMoveLeft}/>
        <RightIcon className="right" onClick={handleMoveRight} />
    </Box>;
};

export default memo(Index);
