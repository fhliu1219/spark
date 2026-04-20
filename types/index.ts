export type Prompt = {
  id: string;
  text: string;
};

export type Profile = {
  id: string;
  name: string;
  age: number;
  photo: string;
  promptId: string;
  promptAnswer: string;
  suggestedOpener: string;
};

export type UserState = {
  promptId: string;
  promptAnswer: string;
  liked: string[];
  passed: string[];
  matched: string[];
};
