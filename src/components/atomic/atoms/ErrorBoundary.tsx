import { Component, ReactNode, useEffect } from "react";
import { LOCALSTORAGE_KEY } from "config";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { useTranslator } from "hooks";

export class ErrorBoundary extends Component<
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

    if (process.env.NODE_ENV !== "production") {
      debugger;
    }

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
    message.error(tx("AN_UNKNOWN_ERROR_HAS_OCCURRED_..."));

    window.localStorage.removeItem(LOCALSTORAGE_KEY);
    window.location.reload();
  }, [dispatch, onResolved, tx, errorCount]);

  return <>{children}</>;
}
