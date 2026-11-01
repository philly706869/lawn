import json from "./data.json";

export const data: {
  last_modified: string;
  grass: {
    date: string;
    link: string;
    size: number;
  }[];
} = json;
