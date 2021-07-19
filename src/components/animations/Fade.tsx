import { ReactNode } from "react";
import { Transition, TransitionStatus } from "react-transition-group";

const DURATION = 120;

const DEFAULT_STYLE = {
  transition: `opacity ${DURATION}ms ease-in-out`,
  opacity: 0,
};
const TRANSITION_STYLES: Record<TransitionStatus, Record<string, any>> = {
  entering: { opacity: 0.6 },
  entered: { opacity: 1 },
  exiting: { opacity: 0.6 },
  exited: { opacity: 0 },
  unmounted: { opacity: 0 },
};

export function Fade({
  in: inProp,
  children,
}: {
  in: any;
  children: ReactNode;
}) {
  return (
    <Transition in={inProp} timeout={DURATION}>
      {(state) => (
        <div
          style={{
            ...DEFAULT_STYLE,
            ...TRANSITION_STYLES[state],
          }}
        >
          {children}
        </div>
      )}
    </Transition>
  );
}
