import { Switch } from "antd";
import { actions, selectors } from "features";
import { useDispatch, useSelector } from "react-redux";

export default function ModeSwitch() {
  const dispatch = useDispatch();
  const theme = useSelector(selectors.selectTheme);

  return (
    <Switch
      checked={theme === "dark"}
      checkedChildren="🌙 Dark"
      unCheckedChildren="🔆 Light"
      onClick={() => dispatch(actions.themeToggled())}
    />
  );
}
