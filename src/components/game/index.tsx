/**
 * @description game
 * @author maicFir
 */
"use client";
import React, { memo, useEffect, useRef, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import {
  RestartAlt as RestartAltIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  StopCircle as StopCircleIcon,
} from "@mui/icons-material";
import useSound from "use-sound";
import { message } from "@comp/global";
import { CoinIcon, LiveIcon, VoiceIcon, CloseVoiceIcon } from "@comp/svg-icon";
// import { queryGmgnSymbolListApi } from "@src/services/api";
import { symbolData } from "@src/api/game/mock";
import Help from "./help";
import { Character } from "./character";
import { FallingObject } from "./falling-object";

import style from "./index.module.scss";

interface Props {}

const Index: React.FC<Props> = (props) => {
  const {} = props;
  const [play, { stop: stopGameStart }] = useSound("/mp3/game_start.mp3");
  const canvasDom = useRef<HTMLCanvasElement>(null);
  const startDom = useRef<any>(null);
  const resetDom = useRef<any>(null);
  // 游戏背景音乐
  const [gameVoice, setGameVoice] = useState(false);
  const [startText, setStartText] = useState("start"); // 开始or暂停
  // 分数
  const [source, setSource] = useState(0);
  // 生命
  const [lifeTime, setLifeTime] = useState(3);

  useEffect(() => {
    const canvas: any = canvasDom.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 800; // 设置画布宽度
    canvas.height = 600; // 设置画布高度

    // 初始化角色
    let character = new Character(
      canvas.width / 2 - 25,
      canvas.height - 50,
      canvas
    );
    let fallingObjects: any = [];
    let score = 0;
    let gameOver = false;
    let left = false,
      right = false,
      paused = false; // 暂停标识

    const gameInit = () => {
      if (gameOver) {
        console.log("game over");
        message.alert({
          type: "warning",
          msg: "game over, please reset again!",
        });
        return;
      }
      if (!paused) {
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除画布
      // 控制角色
      character.move(left, right);
      character.update();
      character.draw();

      // 添加和更新掉落物体
      if (Math.random() < 0.05) {
        fallingObjects.push(new FallingObject(canvas, symbolData));
      }

      fallingObjects.forEach((object: any, index: any) => {
        object.update();
        object.draw();

        if (object.checkCollision(character)) {
          character.lives -= 1;
          setLifeTime(character.lives);
          fallingObjects.splice(index, 1); // 移除已碰撞的物体
          if (character.lives <= 0) {
            gameOver = true;
          }
        }
      });

      // 更新分数
      score += 1;
      setSource(score);
      requestAnimationFrame(gameInit);
    };
    // 开始游戏
    const againGame = () => {
      character = new Character(
        canvas.width / 2 - 25,
        canvas.height - 50,
        canvas
      );
      fallingObjects = [];
      score = 0;
      gameOver = false;
      left = false;
      right = false;
      paused = true;
      gameInit();
    };
    // 暂停或者开始游戏
    const plauseGame = () => {
      paused = !paused; // 切换暂停状态
      if (paused) {
        setStartText("pause");
        gameInit(); // 恢复游戏循环
      } else {
        setStartText("start");
        stopGameStart();
      }
    };

    // 监听键盘事件
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") left = true;
      if (e.key === "ArrowRight") right = true;
      if (e.key === " " || e.key === "ArrowUp") character.jump();
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft") left = false;
      if (e.key === "ArrowRight") right = false;
    });
    // 监听空格键
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        againGame();
      }
    });
    startDom.current.addEventListener("click", () => {
      plauseGame();
    });
    // 重新开始
    resetDom.current.addEventListener("click", () => {
      againGame();
    });
    // 启动游戏
    // gameInit();
  }, []);

  const handleOpen = () => {
    setGameVoice(!gameVoice);
    if (!gameVoice) {
      play();
    } else {
      stopGameStart();
    }
  };
  return (
    <Box className={style["app"]} display={"flex"} justifyContent={"center"}>
      <Typography
        component={"div"}
        width={"800px"}
        bgcolor={"#e5e5e5"}
        borderRadius={"20px"}
        height={"700px"}
        margin={"auto"}
      >
        <Typography
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
            <Button ref={startDom}>
              {startText}{" "}
              {startText === "start" ? (
                <PlayCircleOutlineIcon />
              ) : (
                <StopCircleIcon />
              )}
            </Button>
            <Button ref={resetDom}>
              reset <RestartAltIcon />
            </Button>
            <Button onClick={handleOpen}>
              {gameVoice ? <CloseVoiceIcon /> : <VoiceIcon />}
            </Button>
          </Typography>
        </Typography>
        <canvas
          className="canvas"
          ref={canvasDom}
          width={800}
          height={600}
        ></canvas>
        <Typography
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          paddingTop={"10px"}
        >
          Please press Enter to start the game <Help />
        </Typography>
      </Typography>
    </Box>
  );
};

export default memo(Index);
