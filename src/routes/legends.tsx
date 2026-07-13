import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/legends")({
  component: () => <Outlet />,
});
