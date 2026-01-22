/// <reference types="vite/client" />

// Fix for React 19 JSX type compatibility with libraries that haven't updated yet
// This is a temporary workaround until libraries like lucide-react and react-router-dom
// fully support React 19's JSX types
declare namespace React {
  interface ReactElement<
    P = unknown,
    T extends string | JSXElementConstructor<unknown> = string | JSXElementConstructor<unknown>
  > {
    type: T;
    props: P;
    key: string | null;
  }
}
