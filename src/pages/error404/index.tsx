import { goto } from "@/router";
import style from "./index.module.scss";
import { Button } from "antd";
import { observer } from "mobx-react-lite";
import { gstate } from "@/global";

const Error404 = observer(() => {
  return (
    <div className={style.container}>
      <svg className={style.aperture} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9.2" opacity="0.4" />
        <g>
          <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
          <line x1="9.69" y1="8" x2="21.17" y2="8" />
          <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
          <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
          <line x1="14.31" y1="16" x2="2.83" y2="16" />
          <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
        </g>
      </svg>
      <div className={style.title}>404</div>
      <div className={style.desc}>{gstate.locale?.error404.description}</div>
      <Button
        type="primary"
        onClick={() => {
          goto("/", null, "replace");
        }}
      >
        {gstate.locale?.error404.backHome}
      </Button>
    </div>
  );
});

export default Error404;
