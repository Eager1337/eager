import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "../components/skyelite/SectionPage";

export const Route = createFileRoute("/skyelite/story")({
  head: () => ({ meta: [{ title: "Our Story, SkyElite" }] }),
  component: () => (
    <SectionPage
      eyebrow="Our story"
      title="Built for the few who refuse to wait."
      body="SkyElite was founded on a simple idea: private aviation should feel personal. From the first call to the last touchdown, every detail is handled by people who actually fly."
      highlights={[
        { k: "120+", v: "Airports served" },
        { k: "24/7", v: "Concierge" },
        { k: "8 min", v: "Avg. quote" },
      ]}
    />
  ),
});
