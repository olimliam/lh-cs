import React from 'react';

type ErrorBoundaryProps = {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  resetKeys?: any[];
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.props.resetKeys &&
      prevProps.resetKeys &&
      !areArraysEqual(this.props.resetKeys, prevProps.resetKeys)
    ) {
      this.setState({ hasError: false });
    }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // fallback 있으면 그거 보여주고, 없으면 기본 UI
      return (
        this.props.fallback ?? (
          <h1>문제가 발생했어요. 잠시 후 다시 시도해주세요 🙏</h1>
        )
      );
    }

    return this.props.children;
  }
}

// 배열 비교 함수
function areArraysEqual(arr1?: any[], arr2?: any[]) {
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  return arr1.every((v, i) => v === arr2[i]);
}
