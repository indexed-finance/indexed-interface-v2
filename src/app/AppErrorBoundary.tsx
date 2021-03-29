import { Component, ReactNode, useEffect } from "react";
import { actions } from "features";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { useTranslation } from "i18n";

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
  const translate = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    message.error(translate("AN_UNKNOWN_ERROR_HAS_OCCURRED_..."));

    dispatch(actions.restartedDueToError());
    onResolved();
  }, [dispatch, onResolved, translate]);

  return <>{children}</>;
}
