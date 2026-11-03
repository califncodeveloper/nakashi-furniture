import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/products/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/product/$slug",
      params: { slug: params.slug },
    });
  },
});
