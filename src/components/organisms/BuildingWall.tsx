interface Props {
  top: number;
  left?: number;
  right?: number;
  windows?: boolean;
  zIndex?: number;
}

export default function BuildingWall({
  top,
  left,
  right,
  windows = true,
  zIndex = 1,
}: Props) {
  if (!(left || right)) {
    return null;
  }

  const style =
    typeof right === "undefined"
      ? { top, left, zIndex }
      : { top, right, zIndex };

  return (
    <div className="BuildingWall" style={style}>
      {windows &&
        Array.from({ length: 160 }, (_, index) => (
          <div key={index} className="Window" />
        ))}
    </div>
  );
}
