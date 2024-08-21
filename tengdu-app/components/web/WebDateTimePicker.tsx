import { createElement } from "react-native-web";

import "./WebDateTimePickerStyles.module.css";

interface WebDateTimeProps {
  value: Date;
  onChange: (event) => void;
}

export default function DateTimePicker({ value, onChange }: WebDateTimeProps) {
  return createElement("input", {
    type: "date",
    valueAsDate: value,
    onInput: onChange,
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });
}
