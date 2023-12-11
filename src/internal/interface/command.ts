export interface CommandInterface {
  name: string;
  description: string;

  modOnly?: boolean;
  adminOnly?: boolean;
  testOnly?: boolean;

  options?: Object[];
  execute(...args: any): void;
}
