/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import "./KatexEquationAlterer.css";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as React from "react";
import { useCallback, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import Button from "../ui/Button";
import KatexRenderer from "./KatexRenderer";
import DropdownColorPicker from "./DropdownColorPicker";

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

  const [fontColor, setFontColor] = useState<string>("#000");
  const [bgColor, setBgColor] = useState<string>("#fff");

  const onClick = useCallback(() => {
    onConfirm(equation, inline, fontColor, bgColor);
  }, [onConfirm, equation, inline, fontColor, bgColor]);

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
          <div>
            Font
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
            Bg
            <DropdownColorPicker
              disabled={false}
              buttonClassName="toolbar-item color-picker"
              buttonAriaLabel="Formatting text color"
              buttonIconClassName="icon font-color"
              color={bgColor}
              onChange={setBgColor}
              title="bg color"
            />
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
