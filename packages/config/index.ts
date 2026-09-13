// Rename this application and its single paid plan for each derived project.
export const appConfig = {
  description: "A calm place to start your next chapter.",
  name: "Keel",
  plans: {
    free: { description: "Your own private workspace.", name: "Free" },
    pro: {
      description: "Everything in Free, plus private data export.",
      monthlyUsd: 12,
      name: "Pro",
    },
  },
} as const;
