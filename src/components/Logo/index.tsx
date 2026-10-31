import { Typography } from "antd";
import style from "./index.module.scss";
import { observer } from "mobx-react-lite";

interface LogoProps {
  iconSize?: number;
  title?: string;
}

export const Logo = observer(({ title = "Pic Smaller" }: LogoProps) => {
  return (
    <div className={style.container}>
      {/* 仪器铭牌：黑方块 + 缺口圆环（镜头符号） */}
      <span className={style.mark}>
        <svg viewBox="0 0 20 20" fill="none">
          <circle
            cx="10"
            cy="10"
            r="5.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeDasharray="26 9"
            strokeLinecap="butt"
          />
          <circle cx="10" cy="10" r="1.6" fill="currentColor" />
        </svg>
      </span>
      <Typography.Text className={style.title}>{title}</Typography.Text>
    </div>
  );
});
