import { createClient } from "@liveblocks/client";
import { liveblocksEnhancer } from "@liveblocks/redux";
import { combineReducers, configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import monitorReducerEnhancer from "./enhancers/monitorReducer";
import logger from "./middleware/logger";

export const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function getRandomColor(): string {
  return COLORS[getRandomInt(COLORS.length)];
}

export type Shape = {
  x: number;
  y: number;
  fill: string;
};

export type User = {
  presence?: {
    selectedShape: string | null;
  };
};

type LiveblocksState = {
  others: User[];
  isStorageLoading: boolean;
};

export type State = {
  liveblocks: LiveblocksState | null;
  shapes: Record<string, Shape>;
  selectedShape: string | null;
  isDragging: boolean;
};

export type CombinedState = {
  lb: State;
  metrics: any;
  liveblocks: LiveblocksState | null;
};

const initialState: State = {
  liveblocks: null,
  shapes: {},
  selectedShape: null,
  isDragging: false,
};

const slice = createSlice({
  name: "state",
  initialState,
  reducers: {
    insertRectangle: (state) => {
      const shapeId = Date.now().toString();
      const shape: Shape = {
        x: getRandomInt(300),
        y: getRandomInt(300),
        fill: getRandomColor(),
      };
      state.shapes[shapeId] = shape;
      state.selectedShape = shapeId;
    },
    onShapePointerDown: (state, action: PayloadAction<string>) => {
      state.selectedShape = action.payload;
      state.isDragging = true;
    },
    deleteShape: (state) => {
      if (state.selectedShape) {
        delete state.shapes[state.selectedShape];
        state.selectedShape = null;
      }
    },
    onCanvasPointerUp: (state) => {
      state.isDragging = false;
    },
    onCanvasPointerMove: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      if (state.isDragging && state.selectedShape) {
        state.shapes[state.selectedShape].x = action.payload.x - 50;
        state.shapes[state.selectedShape].y = action.payload.y - 50;
      }
    },
  },
});

export const {
  insertRectangle,
  onShapePointerDown,
  deleteShape,
  onCanvasPointerUp,
  onCanvasPointerMove,
} = slice.actions;

export function makeStore() {
  return configureStore({
    reducer: combineReducers({
      lb: slice.reducer,
      metrics: (state = {}) => state,
    }),
    middleware: [logger],
    enhancers: [
      // liveblocksEnhancer<State>({
      //   client,
      //   presenceMapping: { selectedShape: true },
      //   storageMapping: { shapes: true },
      // }),
      monitorReducerEnhancer,
    ],
  });
}

const store = makeStore();

export const selectShapes = (state: CombinedState) => state.lb.shapes;
export const selectedSelectedShape = (state: CombinedState) => state.lb.selectedShape;
export const selectIsStorageLoading = (state: CombinedState) => state.liveblocks?.isStorageLoading;
export const selectOthers = (state: CombinedState) => state.liveblocks?.others;

export type AppDispatch = typeof store.dispatch;
type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch; // Export a hook that can be reused to resolve types
export const useAppSelector: TypedUseSelectorHook<CombinedState> = useSelector;

export default store;
