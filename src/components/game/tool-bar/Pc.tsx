/**
 * @description 请添加组件描述
 * @author maicFir
 */
import React, {memo } from "react";
import { Typography, Button } from "@mui/material";
import {
    RestartAlt as RestartAltIcon,
    PlayCircleOutline as PlayCircleOutlineIcon,
    StopCircle as StopCircleIcon,
  } from "@mui/icons-material";
import { CoinIcon, LiveIcon, VoiceIcon, CloseVoiceIcon } from "@comp/svg-icon";
interface Props {
    source: number;
    lifeTime: number;
    startText: string;
    gameVoice: boolean;
    handleOpen: () => void;
    start: () => void;
    reset: () => void;
}

const Pc =  (props: Props) => {
const { source, lifeTime, startText, gameVoice, handleOpen, start, reset } = props;
  const handleStart = () => {
        start?.();
  }
  const handleReset = () => {
    reset?.();
}
  return  <Typography
  component={"div"}
  display={"flex"}
  justifyContent={"space-between"}
  alignItems={"center"}
>
  <Typography
    component={"div"}
    padding={"10px"}
    display={"grid"}
    gridTemplateColumns={"1fr 1fr"}
    gap={"10px"}
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
  >
    <Button onClick={handleStart} className="start-button">
      {startText}{" "}
      {startText === "start" ? (
        <PlayCircleOutlineIcon />
      ) : (
        <StopCircleIcon />
      )}
    </Button>
    <Button onClick={handleReset} className="reset-button">
      reset <RestartAltIcon />
    </Button>
    <Button onClick={handleOpen}>
      {gameVoice ? <CloseVoiceIcon /> : <VoiceIcon />}
    </Button>
  </Typography>
</Typography>;
};

export default memo(Pc);
