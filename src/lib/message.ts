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
    password: "Password",
    date: "Date",
    link: "Link",
    content: "Content",
    push_grass: "Push grass",
    pushing: "Pushing…",
    pushed: (ref: string) =>
      `Successfully pushed grass with commit ${ref}. It will appear once deployment is complete.`,
  },
  error: {
    invalid_date: "Enter a valid date in YYYY-MM-DD format.",
    invalid_link: "The link is invalid.",
    password_required: "Enter your password.",
    key_storage_failed: "Failed to encrypt the API key or access browser storage.",
    api_key_missing: "No saved API key found. Enter your API key.",
    decryption_failed: "Failed to decrypt the API key. Check your password or saved key.",
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
