import { Switch } from "antd";
import { actions, selectors } from "features";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "i18n";

export default function ModeSwitch() {
  const translate = useTranslation();
  const dispatch = useDispatch();
  const theme = useSelector(selectors.selectTheme);

  return (
    <Switch
      checked={["dark", "outrun"].includes(theme)}
      checkedChildren={
        theme === "outrun" ? (
          <div className="perfectly-centered">
            <OutrunEmoji /> {translate("OUTRUN")}
          </div>
        ) : (
          `🌙 ${translate("DARK")}`
        )
      }
      unCheckedChildren={`🔆 ${translate("LIGHT")}`}
      onClick={() => dispatch(actions.themeToggled())}
    />
  );
}

function OutrunEmoji() {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -2,
          left: 0,
          zIndex: 1,
        }}
      >
        🌕
      </div>
      <div
        style={{
          position: "absolute",
          top: -2,
          left: 0,
          zIndex: 2,
        }}
      >
        🌴
      </div>
    </div>
  );
}
