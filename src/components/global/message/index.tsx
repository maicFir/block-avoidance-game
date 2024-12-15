/**
 * @description 自定义信息框
 * @author maicFir
 */
"use client";
import React, { useState, SyntheticEvent, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Snackbar, Alert, Button } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import style from "./index.module.scss";

type Props = {
  msg: string;
  type: "success" | "error" | "warning" | "info";
  manualClose?: boolean;
  afterClose?: () => void;
  positionCenter?: boolean;
};
const MessageDom: React.FC<Props & { show: boolean; onDestroy: () => void }> = (
  props
) => {
  const { msg, type, show = false, manualClose, onDestroy, afterClose, positionCenter = false } = props;
  const [open, setOpen] = useState(show);
  const [autoManualClose, setAutoManualClose] = useState(manualClose);
  const handleClose = (event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    onDestroy();
    afterClose?.();
  };

  useEffect(() => {
    let timer: any = null;
    if (manualClose) {
      // 5s后自动关闭
      timer = setTimeout(() => {
        setAutoManualClose(false);
        afterClose?.();
      }, 5000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [manualClose]);

  return (
    <div
      className={style.app}
      style={{
        width: "100%",
        position: "fixed",
        top: positionCenter ? "50%" : 0,
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10001,
      }}
    >
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={autoManualClose ? null : 3000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={type}
          action={
            manualClose ? (
              <Button color="inherit" size="small" onClick={handleClose}>
                <ClearIcon />
              </Button>
            ) : null
          }
        >
          {msg}
        </Alert>
      </Snackbar>
    </div>
  );
};
export const message = {
  alert: (config: Props) => {
    const div = document.createElement("div");
    div.id = "message-alter";
    document.body.appendChild(div);
    const root = createRoot(div);
    const propsConfig = {
      ...config,
      show: true,
        onDestroy: () => {
         root.unmount()
      },
    };
 
    return root.render(<MessageDom {...propsConfig} />);
  },
};
