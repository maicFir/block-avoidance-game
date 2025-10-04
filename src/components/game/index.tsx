"use client";
import React, { memo, useEffect, useRef, useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import useSound from "use-sound";
import { message } from "@comp/global";
import { symbolData } from "./mock";
import Help from "./help";
import ToolBarPc from "./tool-bar/Pc";
import ToolBarMobile from "./tool-bar/mobile";
import Login from "./login";
import { Character, FallingObject } from "./util";
import style from "./index.module.scss";

interface Props {}

const Index: React.FC<Props> = (props) => {
  const {} = props;
  const is_pc_media = useMediaQuery("(min-width:1025px)");
  const [play, { stop: stopGameStart }] = useSound("/mp3/game_start.mp3");

  const canvasDom = useRef<HTMLCanvasElement>(null);
  const [gameVoice, setGameVoice] = useState(false);
  const [startText, setStartText] = useState("start");
  const [source, setSource] = useState(0);
  const [lifeTime, setLifeTime] = useState(3);
  let startGame = useRef<any>(null);
  let plauseGame = useRef<any>(null);
  const character_obj = useRef<any>(null);

  // 按键状态
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(false);
  const leftRef = useRef(false);
  const rightRef = useRef(false);

  // 同步状态到ref
  useEffect(() => {
    leftRef.current = left;
  }, [left]);

  useEffect(() => {
    rightRef.current = right;
  }, [right]);

  useEffect(() => {
    const canvas: any = canvasDom.current;
    const ctx = canvas.getContext("2d");
    canvas.width = is_pc_media ? 800 : window.innerWidth;
    canvas.height = 600;

    // 移除这里的Character创建，避免重复创建
    // Character对象只在startGame函数中创建
    let fallingObjects: any = [];
    let score = 0;
    let gameOver = false;
    let paused = false;
    let gameRunning = false;

    const gameInit = () => {
      if (gameOver) {
        console.log("game over");
        message.alert({
          type: "warning",
          msg: "game over, please reset again!",
        });
        return;
      }
      if (!paused || !gameRunning) return;

      // 确保character对象存在
      if (!character_obj.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 根据按键状态控制角色移动
      character_obj.current.move(leftRef.current, rightRef.current);
      character_obj.current.update();
      character_obj.current.draw(ctx);

      // 添加和更新掉落物体
      if (Math.random() < 0.05) {
        fallingObjects.push(new FallingObject(canvas, symbolData));
      }

      fallingObjects.forEach((object: any, index: any) => {
        object.update();
        object.draw(ctx);

        if (object.checkCollision(character_obj.current)) {
          character_obj.current.lives -= 1;
          setLifeTime(character_obj.current.lives);
          fallingObjects.splice(index, 1);
          if (character_obj.current.lives <= 0) {
            gameOver = true;
            gameRunning = false;
            setStartText("start");
          }
        }
      });

      score += 1;
      setSource(score);
      requestAnimationFrame(gameInit);
    };

    // 开始游戏
    startGame.current = () => {
      character_obj.current = new Character(
        canvas.width / 2 - 25,
        canvas.height - 50,
        canvas
      );
      fallingObjects = [];
      score = 0;
      setSource(0);
      gameOver = false;
      gameRunning = true;
      setLeft(false);
      setRight(false);
      setLifeTime(3);
      paused = true;
      setStartText("pause");
      gameInit();
    };

    // 暂停/开始游戏
    plauseGame.current = () => {
      if (!gameRunning) {
        // 如果游戏还没开始，则开始游戏
        startGame.current();
        return;
      }
      
      paused = !paused;
      if (paused) {
        setStartText("pause");
        gameInit();
      } else {
        setStartText("start");
        stopGameStart();
      }
    };

    // 监听键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault(); // 防止默认行为
      
      if (e.key === "ArrowLeft") {
        setLeft(true); // 持续按下左键时，角色会向左移动
      }
      if (e.key === "ArrowRight") {
        setRight(true); // 持续按下右键时，角色会向右移动
      }
      if ([" ", "ArrowUp"].includes(e.key)) {
        // 确保使用最新的character对象
        if (character_obj.current) {
          character_obj.current.jump();
        }
      }
      if (e.key === "Enter") {
        // Enter键启动/暂停游戏
        plauseGame.current?.();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault(); // 防止默认行为
      
      if (e.key === "ArrowLeft") {
        setLeft(false); // 松开左键时，停止向左移动
      }
      if (e.key === "ArrowRight") {
        setRight(false); // 松开右键时，停止向右移动
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
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

  // 移动左 - 按下
  const handleMoveLeftStart = () => {
    setLeft(true); // 持续左移
    setRight(false); // 停止右移
  };

  // 移动右 - 按下
  const handleMoveRightStart = () => {
    setRight(true); // 持续右移
    setLeft(false); // 停止左移
  };

  // 停止移动
  const handleMoveStop = () => {
    setLeft(false);
    setRight(false);
  };

  // 跳跃
  const handleJump = () => {
    if (character_obj.current) {
      character_obj.current.jump();
    }
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
        <Login />
              
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
        pb={"10px"}
          component={"div"}
        >
          Please press Enter to start the game <Help />
        </Typography>
      </Typography>

    
    </Box>
  );
};

export default memo(Index);
