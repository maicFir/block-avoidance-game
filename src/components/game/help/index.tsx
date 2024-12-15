/**
 * @description 请添加组件描述
 * @author maicFir
 */
"use client";
import React, { memo, useEffect, useState } from "react";
import { Fade, Paper, Popper, Typography } from "@mui/material";
import {
  Help as HelpIcon,
  ArrowBack as ArrowBackIcon,
  SpaceBar as SpaceBarIcon,
} from "@mui/icons-material";

interface Props {}

const Index: React.FC<Props> = (props) => {
  const {} = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;
  const handleClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    event.stopPropagation();
  };
  useEffect(() => {
    document.body.addEventListener("click", (e) => {
      setAnchorEl(null);
    });
    return () => {
      document.body.removeEventListener("click", (e) => {
        setAnchorEl(null);
      });
    };
  }, []);
  return (
    <>
      <HelpIcon className="cursor-pointer" onClick={(e) => handleClick(e)} />
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        transition
        sx={{ zIndex: 1000 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper sx={{ border: 1, p: "10px", borderColor: "#e5e5e5" }}>
              <Typography component={"div"} sx={{ padding: "5px" }}>
                <Typography>
                  <ArrowBackIcon /> : Move Left
                </Typography>
                <Typography>
                  <ArrowBackIcon sx={{ transform: "rotate(180deg)" }} /> : Move
                  Right
                </Typography>
                <Typography>
                  <ArrowBackIcon sx={{ transform: "rotate(90deg)" }} /> /{" "}
                  <SpaceBarIcon /> : Jump up
                </Typography>
              </Typography>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default memo(Index);
