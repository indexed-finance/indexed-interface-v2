import { Button, Divider } from "antd";
import { MdArrowDownward, MdSwapCalls } from "react-icons/md";

interface Props {
  onFlip(): void;
  disabled?: boolean;
}

export default function Flipper({ disabled, onFlip }: Props) {
  return (
    <Divider style={{ marginBottom: 0 }}>
      <Button type="default" onClick={onFlip}>
        {disabled ? <MdArrowDownward /> : <MdSwapCalls />}
      </Button>
    </Divider>
  );
}
