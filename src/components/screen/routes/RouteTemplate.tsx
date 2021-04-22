import { LazyExoticComponent, useContext, useEffect } from "react";
import {
  ScreenContext,
  ScreenContextInterface,
} from "components/screen/ScreenProvider";

export function RouteTemplate({
  adjustedValues,
  screen: SubscreenComponent,
}: {
  adjustedValues: Partial<ScreenContextInterface>;
  screen: LazyExoticComponent<() => JSX.Element>;
}) {
  const { adjustScreen } = useContext(ScreenContext);

  useEffect(() => {
    adjustScreen(adjustedValues);
  }, [adjustScreen, adjustedValues]);

  return <SubscreenComponent />;
}
