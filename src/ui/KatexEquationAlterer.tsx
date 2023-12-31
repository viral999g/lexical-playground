/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import "./KatexEquationAlterer.scss";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as React from "react";
import { useCallback, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import Button from "../ui/Button";
import KatexRenderer from "./KatexRenderer";
import DropdownColorPicker from "./DropdownColorPicker";
import { IconPicker } from "react-fa-icon-picker";

type Props = {
  initialEquation?: string;
  onConfirm: (
    equation: string,
    inline: boolean,
    fontColor?: string,
    bgColor?: string
  ) => void;
  showPreview?: boolean;
  inputLabel?: string;
  type?: string;
};

export default function KatexEquationAlterer({
  onConfirm,
  initialEquation = "",
  showPreview = true,
  inputLabel = "Equation",
  type = "equation",
}: Props): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [equation, setEquation] = useState<string>(initialEquation);
  const [inline, setInline] = useState<boolean>(true);

  const [fontColor, setFontColor] = useState<string>("#344054");
  const [bgColor, setBgColor] = useState<string>("#F2F4F7");
  const [icon, setIcon] = useState("");

  const onClick = useCallback(() => {
    onConfirm(equation, inline, fontColor, bgColor, icon);
  }, [onConfirm, equation, inline, fontColor, bgColor, icon]);

  const onCheckboxChange = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);

  return (
    <>
      {showPreview && (
        <div className="KatexEquationAlterer_defaultRow">
          Inline
          <input type="checkbox" checked={inline} onChange={onCheckboxChange} />
        </div>
      )}
      <div className="KatexEquationAlterer_defaultRow">{inputLabel}</div>
      <div className="KatexEquationAlterer_centerRow">
        {inline ? (
          <input
            onChange={(event) => {
              setEquation(event.target.value);
            }}
            value={equation}
            className="KatexEquationAlterer_textArea"
            style={{ borderRadius: 5, borderWidth: 1 }}
          />
        ) : (
          <textarea
            onChange={(event) => {
              setEquation(event.target.value);
            }}
            value={equation}
            className="KatexEquationAlterer_textArea"
          />
        )}
      </div>
      {type === "tag" && (
        <>
          <div
            className="toolbar mt-3 flex justify-between"
            style={{ height: "auto", padding: 0 }}
          >
            <div>
              Font Color
              <DropdownColorPicker
                disabled={false}
                buttonClassName="toolbar-item color-picker"
                buttonAriaLabel="Formatting text color"
                buttonIconClassName="icon font-color"
                color={fontColor}
                onChange={setFontColor}
                title="text color"
              />
            </div>
            <div>
              Background Color
              <DropdownColorPicker
                disabled={false}
                buttonClassName="toolbar-item color-picker"
                buttonAriaLabel="Formatting text color"
                buttonIconClassName="icon bg-color"
                color={bgColor}
                onChange={setBgColor}
                title="bg color"
              />
            </div>
          </div>
          <div className="icon-picker">
            Icon
            <IconPicker value={icon} onChange={(v) => setIcon(v)} />
          </div>
        </>
      )}
      {showPreview && (
        <>
          <div className="KatexEquationAlterer_defaultRow">Visualization</div>
          <div className="KatexEquationAlterer_centerRow">
            <ErrorBoundary onError={(e) => editor._onError(e)} fallback={null}>
              <KatexRenderer
                equation={equation}
                inline={false}
                onDoubleClick={() => null}
              />
            </ErrorBoundary>
          </div>
        </>
      )}
      <div className="KatexEquationAlterer_dialogActions">
        <Button onClick={onClick}>Confirm</Button>
      </div>
    </>
  );
}
