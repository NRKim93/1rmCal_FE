export type APIResponse<
  T extends Record<string, unknown> | undefined = undefined
> = {
  message: string;
  code: number;
} & (T extends undefined ? object : T);