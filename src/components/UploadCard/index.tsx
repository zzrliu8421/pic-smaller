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
      <Flex vertical align="center" className={style.inner}>
        {/* 快门光圈：拖入时叶片张开 */}
        <svg className={style.aperture} viewBox="0 0 100 100" fill="none">
          <circle className={style.ring} cx="50" cy="50" r="46" />
          <g className={style.blades}>
            <line x1="59.6" y1="33.4" x2="83.5" y2="74.8" />
            <line x1="40.4" y1="33.4" x2="88.2" y2="33.4" />
            <line x1="30.8" y1="50" x2="54.7" y2="8.6" />
            <line x1="40.4" y1="66.6" x2="16.5" y2="25.2" />
            <line x1="59.6" y1="66.6" x2="11.8" y2="66.6" />
            <line x1="69.2" y1="50" x2="45.3" y2="91.4" />
          </g>
          <circle className={style.core} cx="50" cy="50" r="10" />
        </svg>
        <Typography.Text className={style.title}>
          {gstate.locale?.uploadCard.title}
        </Typography.Text>
        <div className={style.subTitle}>
          {sprintf(
            gstate.locale?.uploadCard.subTitle ?? "",
            formats.join(" / "),
          )}
        </div>
        <div className={style.chips}>
          {formats.map((item) => (
            <span key={item} className={style.chip}>
              {item}
            </span>
          ))}
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
