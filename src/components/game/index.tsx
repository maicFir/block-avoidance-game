/**
 * @description game
 * @author maicFir
 */
"use client";
import React, { memo, useEffect, useRef, useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import useSound from "use-sound";
import { message } from "@comp/global";
import { symbolData } from "@src/api/game/mock";
import Help from "./help";
import ToolBarPc from "./tool-bar/Pc";
import ToolBarMobile from "./tool-bar/mobile";
import Wheel from "./wheel";
import { Character, FallingObject } from "./util";
import style from "./index.module.scss";

interface Props {}

const Index: React.FC<Props> = (props) => {
  const {} = props;
  const is_pc_media = useMediaQuery("(min-width:1025px)");
  const [play, { stop: stopGameStart }] = useSound("/mp3/game_start.mp3");
  const canvasDom = useRef<HTMLCanvasElement>(null);
  // 游戏背景音乐
  const [gameVoice, setGameVoice] = useState(false);
  const [startText, setStartText] = useState("start"); // 开始or暂停
  // 分数
  const [source, setSource] = useState(0);
  // 生命
  const [lifeTime, setLifeTime] = useState(3);
  let startGame = useRef<any>(null);
  let plauseGame = useRef<any>(null);
  const character_obj = useRef<any>(null);

  useEffect(() => {
    const canvas: any = canvasDom.current;
    const ctx = canvas.getContext("2d");
    canvas.width = is_pc_media ? 800 : window.innerWidth; // 设置画布宽度
    canvas.height = 600; // 设置画布高度
    console.log(is_pc_media, "=is_pc_media");
    // 初始化角色
    let character = new Character(
      canvas.width / 2 - 25,
      canvas.height - 50,
      canvas
    );
    character_obj.current = character;
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
    startGame.current = () => {
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
    plauseGame.current = () => {
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
      if ([" ", "ArrowUp"].includes(e.key)) character.jump();
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft") left = false;
      if (e.key === "ArrowRight") right = false;
    });
    // 监听空格键
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        plauseGame.current?.();
      }
    });

    return () => {
      window.removeEventListener("keydown", () => {});
      window.removeEventListener("keyup", () => {});
    };
  }, [is_pc_media]);

  const handleOpen = () => {
    setGameVoice(!gameVoice);
    if (!gameVoice) {
      play();
    } else {
      stopGameStart();
    }
  };
  const handleStart = () => {
    plauseGame.current?.();
  };
  const handleReset = () => {
    startGame.current?.();
  };
  const handleMoveLeft = () => {
    character_obj.current.move(true, false);
  };
  const handleMoveRight = () => {
    character_obj.current.move(false, true);
  };
  return (
    <Box className={style["app"]} display={"flex"} justifyContent={"center"}>
      <Typography
        component={"div"}
        width={is_pc_media ? "800px" : "640px"}
        bgcolor={"#e5e5e5"}
        borderRadius={is_pc_media ? "20px" : "0px"}
        margin={"auto"}
        overflow={"hidden"}
        className="app-wrap"
      >
        {is_pc_media ? (
          <ToolBarPc
            source={source}
            lifeTime={lifeTime}
            startText={startText}
            gameVoice={gameVoice}
            handleOpen={handleOpen}
            start={handleStart}
            reset={handleReset}
          />
        ) : (
          <ToolBarMobile
            source={source}
            lifeTime={lifeTime}
            startText={startText}
            gameVoice={gameVoice}
            handleOpen={handleOpen}
            start={handleStart}
            reset={handleReset}
          />
        )}
        <Typography component={"div"} className="canvas-wrap">
          <canvas
            className="canvas"
            ref={canvasDom}
            width={is_pc_media ? 800 : 640}
            height={600}
          ></canvas>
        </Typography>

        <Typography
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          paddingTop={"10px"}
          component={"div"}
        >
          Please press Enter to start the game <Help />
        </Typography>
      </Typography>
      {is_pc_media ? (
        <></>
      ) : (
        <Wheel moveLeft={handleMoveLeft} moveRight={handleMoveRight} />
      )}
    </Box>
  );
};

export default memo(Index);
