import style from "./index.module.scss";
import clsx from "classnames";

export interface IndicatorProps {
  size?: "large";
  white?: boolean;
}

/** 呼吸的朱砂圆点 */
export function Indicator({ size, white = false }: IndicatorProps) {
  return (
    <span
      className={clsx(
        style.container,
        size === "large" && style.large,
        white && style.white,
      )}
    >
      <span className={style.dot} />
      <span className={style.ring} />
    </span>
  );
}
