import { Button, Divider } from "antd";
import { MdSwapCalls } from "react-icons/md";

interface Props {
  onFlip(): void;
}

export default function Flipper({ onFlip }: Props) {
  return (
    <Divider style={{ marginBottom: 0 }}>
      <Button type="primary" onClick={onFlip}>
        <MdSwapCalls />
      </Button>
    </Divider>
  );
}
