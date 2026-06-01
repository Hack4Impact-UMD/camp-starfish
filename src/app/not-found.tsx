import ErrorPage from "./error";

export default function NotFoundPage() {
  return <ErrorPage error={Error("This page does not exist.")} />;
}