import { Flex, Typography } from "antd";
import style from "./index.module.scss";
import { useEffect, useRef } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { gstate } from "@/global";
import { ImageInput } from "../ImageInput";
import { state } from "./state";
import { createImageList } from "@/engines/transform";
import { getFilesFromEntry, getFilesFromHandle } from "@/functions";
import { sprintf } from "sprintf-js";
import { Mimes } from "@/mimes";

export const UploadCard = observer(() => {
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dragLeave = () => {
      state.dragActive = false;
    };
    const dragOver = (event: DragEvent) => {
      event.preventDefault();
      state.dragActive = true;
    };
    const drop = async (event: DragEvent) => {
      event.preventDefault();
      state.dragActive = false;
      const files: Array<File> = [];
      if (event.dataTransfer?.items) {
        // https://stackoverflow.com/questions/55658851/javascript-datatransfer-items-not-persisting-through-async-calls
        const list: Array<Promise<void>> = [];
        for (const item of event.dataTransfer.items) {
          if (typeof item.getAsFileSystemHandle === "function") {
            list.push(
              (async () => {
                const handle = await item.getAsFileSystemHandle!();
                const result = await getFilesFromHandle(handle);
                files.push(...result);
              })(),
            );
            continue;
          }
          if (typeof item.webkitGetAsEntry === "function") {
            list.push(
              (async () => {
                const entry = await item.webkitGetAsEntry();
                if (entry) {
                  const result = await getFilesFromEntry(entry);
                  files.push(...result);
                }
              })(),
            );
          }
        }
        await Promise.all(list);
      } else if (event.dataTransfer?.files) {
        const list = event.dataTransfer?.files;
        for (let index = 0; index < list.length; index++) {
          const file = list.item(index);
          if (file) {
            files.push(file);
          }
        }
      }

      files.length > 0 && createImageList(files);
    };

    const target = dragRef.current!;
    target.addEventListener("dragover", dragOver);
    target.addEventListener("dragleave", dragLeave);
    target.addEventListener("drop", drop);

    return () => {
      target.removeEventListener("dragover", dragOver);
      target.removeEventListener("dragleave", dragLeave);
      target.removeEventListener("drop", drop);
    };
  }, []);

  const formats = Object.keys(Mimes).map((item) => item.toUpperCase());

  return (
    <Flex
      justify="center"
      align="center"
      className={classNames(style.container, state.dragActive && style.active)}
    >
      {/* 四角印刷套准标记 */}
      <span className={classNames(style.reg, style.regTL)} />
      <span className={classNames(style.reg, style.regTR)} />
      <span className={classNames(style.reg, style.regBL)} />
      <span className={classNames(style.reg, style.regBR)} />

      <Flex vertical align="center" className={style.inner}>
        {/* REC 指示灯 */}
        <span className={style.rec} />
        <Typography.Text className={style.title}>
          {gstate.locale?.uploadCard.title}
        </Typography.Text>
        <div className={style.subTitle}>
          {sprintf(
            gstate.locale?.uploadCard.subTitle ?? "",
            formats.join(" · "),
          )}
        </div>
        <div className={style.pasteHint}>
          {gstate.locale?.uploadCard.pasteHint}
        </div>
      </Flex>
      <ImageInput ref={fileRef} />
      <div
        className={style.mask}
        ref={dragRef}
        onClick={() => {
          fileRef.current?.click();
        }}
      />
    </Flex>
  );
});
