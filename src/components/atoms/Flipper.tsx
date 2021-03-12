import { Button } from "antd";
import { MdSwapCalls } from "react-icons/md";
import { ReactNode } from "react";

interface Props {
  left?: ReactNode;
  onFlip(): void;
  right?: ReactNode;
}

export default function Flipper({ left, onFlip, right }: Props) {
  return (
    <div style={{ position: "relative" }}>
      <div>
        {left}
        <Button type="primary" onClick={onFlip}>
          <MdSwapCalls />
        </Button>
        {right}
      </div>
    </div>
  );
}
