import { StoreEnhancer, StoreEnhancerStoreCreator } from "@reduxjs/toolkit";

const round = (number: number) => Math.round(number * 100) / 100;

const monitorReducerEnhancer: StoreEnhancer = (createStore: StoreEnhancerStoreCreator) => (
  reducer,
  initialState,
) => {
  const monitoredReducer = (state: any, action: any) => {
    const start = performance.now();
    const newState = reducer(state, action);
    const end = performance.now();
    const diff = round(end - start);

    console.log("Reducer process time: ", diff);

    return {
      ...newState,
      metrics: {
        reducerProcessTime: diff,
      },
    };
  };

  return createStore(monitoredReducer, initialState);
};

export default monitorReducerEnhancer;
