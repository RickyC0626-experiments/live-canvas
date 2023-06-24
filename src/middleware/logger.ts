import { PayloadAction, Store } from "@reduxjs/toolkit";

const logger = (store: any) => (next: Function) => (action: PayloadAction) => {
  console.group(action.type);
  console.info("Dispatching", action);
  let result = next(action);
  console.log("Next state", (store as Store).getState());
  console.groupEnd();
  return result;
};

export default logger;
