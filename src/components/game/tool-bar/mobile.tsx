/**
 * @description 请添加组件描述
 * @author maicFir
 */
import React, { memo, useState, useEffect } from "react";
import { Typography, Button, Popper, Box } from "@mui/material";
import {
  RestartAlt as RestartAltIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  StopCircle as StopCircleIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { CoinIcon, LiveIcon, VoiceIcon, CloseVoiceIcon } from "@comp/svg-icon";
import style from "./mobile.module.scss";
interface Props {
  source: number;
  lifeTime: number;
  startText: string;
  gameVoice: boolean;
  handleOpen: () => void;
  start: () => void;
  reset: () => void;
}

const Pc = (props: Props) => {
  const { source, lifeTime, startText, gameVoice, handleOpen, start, reset } =
    props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    event.stopPropagation();
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;
  const handleStart = () => {
    start?.();
  };
  const handleReset = () => {
    reset?.();
  };
  useEffect(() => {
    document.body.addEventListener("click", () => {
      setAnchorEl(null);
    });
    return () => {
      document.body.removeEventListener("click", () => {
        setAnchorEl(null);
      });
    };
  }, []);
  return (
    <Typography
      component={"div"}
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      <Typography
        display={"flex"}
        component={"div"}
        padding={"10px"}
        gap={"10px"}
        flex={1}
      >
        <Typography
          display={"flex"}
          alignItems={"center"}
          component={"div"}
          border={"1px solid #000"}
          borderRadius={"20px"}
          padding={"5px 10px"}
          minWidth={"100px"}
        >
          <CoinIcon />: {source}
        </Typography>
        <Typography
          component={"div"}
          display={"flex"}
          alignItems={"center"}
          border={"1px solid #000"}
          borderRadius={"20px"}
          padding={"5px 10px"}
          minWidth={"100px"}
        >
          <LiveIcon />: {lifeTime}
        </Typography>
      </Typography>
      <Typography
        component={"div"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        padding={"0 10px"}
      >
        <MenuIcon onClick={(e) => handleClick(e)}></MenuIcon>
      </Typography>
      <Popper id={id} open={open} anchorEl={anchorEl}>
        <Box padding={"10px 0"} marginTop={"16px"}>
          <Button onClick={handleStart} className={style["start-button"]}>
            {startText}{" "}
            {startText === "start" ? (
              <PlayCircleOutlineIcon />
            ) : (
              <StopCircleIcon />
            )}
          </Button>
          <Button onClick={handleReset} className={style["reset-button"]}>
            reset <RestartAltIcon />
          </Button>
          <Button onClick={handleOpen} className={style["start-button"]}>
            {gameVoice ? <CloseVoiceIcon /> : <VoiceIcon />}
          </Button>
        </Box>
      </Popper>
    </Typography>
  );
};

export default memo(Pc);
