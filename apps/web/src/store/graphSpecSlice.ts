import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

// 图形规范类型定义
export interface GraphSpec {
  version: string;
  naming?: {
    nodePrefix?: string;
    alphabetRange?: string;
    labelFormat?: string;
  };
  palette: {
    nodeFill: Record<string, string> & { default?: string };
    nodeStroke: string;
    edgeOut: string;
    edgeIn: string;
    weightText: string;
    background: string;
    selection?: string;
    highlight?: string;
    legendBg?: string;
  };
  node: {
    radius: { min: number; max: number };
    shadow?: { blur: number; opacity: number };
    label?: {
      font?: string;
      padding?: number;
      anchor?: string;
      bg?: string;
    };
  };
  edge: {
    style: string;
    dualChannel: boolean;
    curveOffset: number;
    arrow?: {
      size: number;
      markerUnits?: string;
      expose?: boolean;
    };
    strokeWidth: { min: number; max: number };
    opacity?: { min: number; max: number };
    hitArea?: string;
    truncateAtNodeRadius?: boolean;
  };
  weightLabel: {
    visible: boolean;
    font?: string;
    placement?: string;
    offset?: number;
    autoScaleWithZoom?: boolean;
    format?: string;
  };
  layout: {
    mode: string;
    force?: {
      linkDistance: number;
      charge: number;
      collide: number;
      centerStrength?: number;
    };
    fitToView?: {
      padding: number;
      minZoom: number;
      maxZoom: number;
    };
    preventOverlap?: boolean;
  };
  legend?: {
    draggable?: boolean;
    collapsible?: boolean;
    position?: { x: number; y: number };
    persist?: string;
    items?: Array<{
      icon: string;
      label: string;
    }>;
  };
  interaction?: {
    hoverHighlight?: boolean;
    clickSelect?: boolean;
    tooltips?: {
      enabled: boolean;
      format?: string;
    };
    keyboard?: Record<string, string>;
    reset?: { enabled: boolean };
  };
  animation?: {
    duration: number;
    easing: string;
    teachingFlow?: Array<{
      id: string;
      label: string;
      effect: Array<{
        type: string;
        targets?: string;
        times?: number;
        to?: number;
        direction?: string;
        color?: string;
        widthMap?: string;
        scale?: number;
        nodes?: string;
        sizeMap?: string;
        colorMap?: string;
        text?: string;
        anchor?: string;
      }>;
    }>;
    flowParticle?: {
      enabled: boolean;
      speed: number;
      size: number;
    };
  };
  a11y?: {
    contrastMin?: number;
    focusRing?: boolean;
  };
  export?: {
    png?: boolean;
    svg?: boolean;
  };
}

interface GraphSpecState {
  spec: GraphSpec | null;
  loading: boolean;
  error: string | null;
}

const initialState: GraphSpecState = {
  spec: null,
  loading: false,
  error: null
};

const graphSpecSlice = createSlice({
  name: 'graphSpec',
  initialState,
  reducers: {
    setSpec: (state, action: PayloadAction<GraphSpec>) => {
      state.spec = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearSpec: (state) => {
      state.spec = null;
      state.error = null;
    }
  }
});

export const { setSpec, setLoading, setError, clearSpec } = graphSpecSlice.actions;

// 选择器
export const selectSpec = (state: RootState) => state.graphSpec?.spec || null;
export const selectSpecLoading = (state: RootState) => state.graphSpec?.loading || false;
export const selectSpecError = (state: RootState) => state.graphSpec?.error || null;

export default graphSpecSlice.reducer;
