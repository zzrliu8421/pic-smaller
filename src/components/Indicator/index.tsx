import style from "./index.module.scss";
import clsx from "classnames";

export interface IndicatorProps {
  size?: "large";
  white?: boolean;
}

/** 电平表指示器：方块从左到右依次点亮 */
export function Indicator({ size, white = false }: IndicatorProps) {
  const bars = [];
  for (let i = 0; i < 5; i++) {
    bars.push(<span key={i} style={{ animationDelay: `${i * 0.12}s` }} />);
  }
  return (
    <span
      className={clsx(
        style.container,
        size === "large" && style.large,
        white && style.white,
      )}
    >
      {bars}
    </span>
  );
}
