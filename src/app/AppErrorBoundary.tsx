import { Component, ReactNode, useEffect } from "react";
import { actions } from "features";
import { message } from "antd";
import { useDispatch } from "react-redux";

export default class AppErrorBoundary extends Component<
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
  }

  render() {
    return this.state.hasError ? (
      <ErrorHandler onResolved={this.clearError}>
        {this.props.children}
      </ErrorHandler>
    ) : (
      this.props.children
    );
  }
}

function ErrorHandler({
  children,
  onResolved,
}: {
  children: ReactNode;
  onResolved(): void;
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    message.error(
      <>
        An unknown error has occurred. <br /> If this happens again, please
        report this as a bug.
      </>
    );

    dispatch(actions.restartedDueToError());
    onResolved();
  }, [dispatch, onResolved]);

  return <>{children}</>;
}
