import { Component, ReactNode, useEffect } from "react";
import { actions } from "features";
import { message } from "antd";
import { sleep } from "helpers";
import { useDispatch } from "react-redux";
import { useTranslator } from "hooks";

const timeInSeconds = [1, 1, 3, 5, 8, 13, 21, 99, 999];

export class AppErrorBoundary extends Component<
  {
    children: ReactNode;
  },
  {
    hasError: boolean;
    errorHistory: Array<{ error: any; errorInfo: any }>;
  }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorHistory: [] };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errors: [error] };
  }

  clearError = () => this.setState({ hasError: false });

  componentDidCatch(error: any, errorInfo: any) {
    console.info(
      "---- [Error Boundary] ----",
      {
        error,
        errorInfo,
      },
      "---- [Error Boundary] ----"
    );

    this.state.errorHistory.push({
      error,
      errorInfo,
    });
  }

  render() {
    return this.state.hasError ? (
      <ErrorHandler
        onResolved={this.clearError}
        errorCount={this.state.errorHistory.length}
      >
        {this.props.children}
      </ErrorHandler>
    ) : (
      this.props.children
    );
  }
}

function ErrorHandler({
  errorCount,
  children,
  onResolved,
}: {
  errorCount: number;
  children: ReactNode;
  onResolved(): void;
}) {
  const tx = useTranslator();
  const dispatch = useDispatch();

  useEffect(() => {
    const timeToWait = timeInSeconds[errorCount] * 1000;

    message.error(tx("AN_UNKNOWN_ERROR_HAS_OCCURRED_..."));

    sleep(timeToWait).then(() => {
      dispatch(actions.restartedDueToError());
      onResolved();
    });
  }, [dispatch, onResolved, tx, errorCount]);

  return <>{children}</>;
}
