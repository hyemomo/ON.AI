import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";

export default function Test() {
  const [value, setValue] = useState("");

  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue ?? "");
        }}
      />
    </div>
  );
}
