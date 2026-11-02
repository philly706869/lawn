export const message = {
  lawn: {
    monday: "Mon",
    wednesday: "Wed",
    friday: "Fri",
    less: "Less",
    more: "More",
  },
  mod: {
    api_key: "API Key",
    date: "Date",
    link: "Link",
    content: "Content",
    push_grass: "Push grass",
    pushing: "Pushing…",
    pushed: (ref: string) =>
      `Successfully pushed grass with commit ${ref}. It will appear once deployment is complete.`,
  },
  error: {
    api_key_missing: "Enter your API key.",
    invalid_date: "Enter a valid date in YYYY-MM-DD format.",
    invalid_link: "The link is invalid.",
    load: {
      fetch: "Failed to load data: network request failed",
      status: (status: string) => `Failed to load data: ${status}`,
      parse: "Failed to load data: parsing failed",
    },
    save: {
      fetch: "Failed to save data: network request failed",
      conflict: "Failed to save data: data SHA mismatch",
      status: (status: string) => `Failed to save data: ${status}`,
      parse: "Failed to save data: parsing failed",
    },
    dispatch: {
      fetch: "Data dispatch failed: fetch failed",
      status: (status: string) => `Data dispatch failed: status is not ok: ${status}`,
    },
  },
};
