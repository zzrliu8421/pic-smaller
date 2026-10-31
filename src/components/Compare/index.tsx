import { useCallback, useEffect, useRef, useState } from "react";
import style from "./index.module.scss";
import { Button, Flex, Popover, Space } from "antd";
import { CloseOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { createPortal } from "react-dom";
import { ImageItem, homeState } from "@/states/home";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { gstate } from "@/global";

export interface CompareState {
  x: number;
  xrate: number;
  scale: number;
  moving: boolean;
  status: "show" | "hide";
  dividerWidth: number;
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
}

export const Compare = observer(() => {
  const infoRef = useRef<Required<ImageItem>>(
    homeState.list.get(homeState.compareId!) as Required<ImageItem>,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CompareState>({
    x: 0,
    xrate: 0.5,
    scale: 0.8,
    moving: false,
    status: "show",
    dividerWidth: 2,
    containerWidth: 0,
    containerHeight: 0,
    imageWidth: 0,
    imageHeight: 0,
  });
  const [oldLoaded, setOldLoaded] = useState<boolean>(false);
  const [newLoaded, setNewLoaded] = useState<boolean>(false);

  const update = useCallback(
    (newState: Partial<CompareState>) => {
      setState({
        ...state,
        ...newState,
      });
    },
    [state],
  );

  const getState = useCallback(() => {
    return state;
  }, [state]);

  const updateRef = useRef<(newState: Partial<CompareState>) => void>(update);
  const stateRef = useRef<() => CompareState>(getState);
  useEffect(() => {
    updateRef.current = update;
    stateRef.current = getState;
  }, [update, getState]);

  useEffect(() => {
    gstate.loading = true;
  }, []);

  useEffect(() => {
    if (oldLoaded && newLoaded) {
      gstate.loading = false;
    }
  }, [oldLoaded, newLoaded]);

  useEffect(() => {
    const doc = document.documentElement;
    const bar = barRef.current!;

    let isControl = false;
    let cursorX = 0;

    const resize = () => {
      const states = stateRef.current();
      const rect = containerRef.current!.getBoundingClientRect();
      let imageWidth: number;
      let imageHeight: number;
      if (
        infoRef.current.width / infoRef.current.height >
        rect.width / rect.height
      ) {
        imageWidth = rect.width * states.scale;
        imageHeight =
          (imageWidth * infoRef.current.height) / infoRef.current.width;
      } else {
        imageHeight = rect.height * states.scale;
        imageWidth =
          (imageHeight * infoRef.current.width) / infoRef.current.height;
      }
      updateRef.current({
        x: rect.width * states.xrate,
        imageWidth,
        imageHeight,
        containerWidth: rect.width,
        containerHeight: rect.height,
      });
    };

    const mousedown = (event: MouseEvent) => {
      isControl = true;
      cursorX = event.clientX;
      updateRef.current({ moving: true });
    };

    const mouseup = () => {
      isControl = false;
      cursorX = 0;
      updateRef.current({ moving: false });
    };

    const mousemove = (event: MouseEvent) => {
      if (isControl) {
        const states = stateRef.current();
        let x = states.x + event.clientX - cursorX;
        const min = (states.containerWidth - states.imageWidth) / 2;
        const max = (states.containerWidth + states.imageWidth) / 2;
        if (x < min) {
          x = min;
        }
        if (x > max) {
          x = max;
        }
        cursorX = event.clientX;
        updateRef.current({ x, xrate: x / states.containerWidth });
      }
    };

    const wheel = (event: WheelEvent) => {
      const states = stateRef.current();
      let scale = -0.001 * event.deltaY + states.scale;
      if (scale > 1) {
        scale = 1;
      }
      if (scale < 0.1) {
        scale = 0.1;
      }

      let imageWidth: number;
      let imageHeight: number;
      if (
        infoRef.current.width / infoRef.current.height >
        states.containerWidth / states.containerHeight
      ) {
        imageWidth = states.containerWidth * scale;
        imageHeight =
          (imageWidth * infoRef.current.height) / infoRef.current.width;
      } else {
        imageHeight = states.containerHeight * scale;
        imageWidth =
          (imageHeight * infoRef.current.width) / infoRef.current.height;
      }

      const innerRate =
        (states.x - (states.containerWidth - states.imageWidth) / 2) /
        states.imageWidth;
      const x =
        innerRate * imageWidth + (states.containerWidth - imageWidth) / 2;

      updateRef.current({ scale, imageWidth, imageHeight, x });
    };

    window.addEventListener("resize", resize);
    window.addEventListener("wheel", wheel);
    bar.addEventListener("mousedown", mousedown);
    doc.addEventListener("mousemove", mousemove);
    doc.addEventListener("mouseup", mouseup);

    resize();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", wheel);
      bar.removeEventListener("mousedown", mousedown);
      doc.removeEventListener("mousemove", mousemove);
      doc.removeEventListener("mouseup", mouseup);
    };
  }, []);

  const leftStyle: React.CSSProperties = {
    width: `${state.x}px`,
  };
  const rightStyle: React.CSSProperties = {
    width: `${state.containerWidth - state.x}px`,
  };
  const barStyle: React.CSSProperties = {
    width: `${state.dividerWidth}px`,
    left: `${state.x - state.dividerWidth / 2}px`,
    opacity: state.x === 0 ? 0 : 1,
  };
  const imageStyle: React.CSSProperties = {
    opacity: newLoaded && oldLoaded ? 1 : 0,
  };
  const leftImageStyle: React.CSSProperties = {
    width: state.imageWidth,
    height: state.imageHeight,
    left: (state.containerWidth - state.imageWidth) / 2 + "px",
    ...imageStyle,
  };
  const rightImageStyle: React.CSSProperties = {
    width: state.imageWidth,
    height: state.imageHeight,
    right: (state.containerWidth - state.imageWidth) / 2 + "px",
    ...imageStyle,
  };

  let statusClass: string | undefined = undefined;
  if (state.status === "show") {
    statusClass = style.show;
  }
  if (state.status === "hide") {
    statusClass = style.hide;
  }

  return createPortal(
    <div
      className={classNames(
        style.container,
        state.moving && style.moving,
        statusClass,
      )}
      ref={containerRef}
      onAnimationEnd={(event) => {
        if (event.animationName === style.BoxHide) {
          homeState.compareId = null;
        }
      }}
    >
      <div style={leftStyle}>
        <img
          src={infoRef.current.src}
          style={leftImageStyle}
          onLoad={() => {
            setOldLoaded(true);
          }}
        />
      </div>
      <div style={rightStyle}>
        <img
          src={infoRef.current.compress.src}
          style={rightImageStyle}
          onLoad={() => {
            setNewLoaded(true);
          }}
        />
      </div>
      <div style={barStyle}>
        <Flex align="center" justify="center" ref={barRef}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.2" opacity="0.5" />
            <g>
              <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
              <line x1="9.69" y1="8" x2="21.17" y2="8" />
              <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
              <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
              <line x1="14.31" y1="16" x2="2.83" y2="16" />
              <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
            </g>
          </svg>
        </Flex>
      </div>
      <div className={classNames(style.frameTag, style.before)}>
        {gstate.locale?.progress.before}
      </div>
      <div className={classNames(style.frameTag, style.after)}>
        {gstate.locale?.progress.after}
      </div>
      <Space className={style.action}>
        <Popover
          content={
            <div className={style.help}>{gstate.locale?.previewHelp}</div>
          }
          placement="bottomRight"
        >
          <Button icon={<QuestionCircleOutlined />} />
        </Popover>
        <Button
          icon={<CloseOutlined />}
          onClick={() => {
            updateRef.current?.({ status: "hide" });
          }}
        />
      </Space>
    </div>,
    document.body,
  );
});
