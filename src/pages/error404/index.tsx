import { goto } from "@/router";
import style from "./index.module.scss";
import { Button } from "antd";
import { observer } from "mobx-react-lite";
import { gstate } from "@/global";

const Error404 = observer(() => {
  return (
    <div className={style.container}>
      <span className={style.seal} aria-hidden>
        缩
      </span>
      <div className={style.code}>404</div>
      <div className={style.rule} />
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
