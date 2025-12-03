import { useState, useCallback, useReducer } from 'react';
import { EmailBlock, BuilderState } from '../types/email-builder';

type BuilderAction =
  | { type: 'ADD_BLOCK'; payload: EmailBlock }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; updates: Partial<EmailBlock> } }
  | { type: 'REMOVE_BLOCK'; payload: string }
  | { type: 'MOVE_BLOCK'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SELECT_BLOCK'; payload: EmailBlock | null }
  | { type: 'SET_BLOCKS'; payload: EmailBlock[] }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_TEMPLATE'; payload: EmailBlock[] }
  | { type: 'RESET' };

const initialState: BuilderState = {
  blocks: [],
  selectedBlock: null,
  history: {
    past: [],
    future: []
  },
  currentTemplate: null,
  previewMode: 'desktop',
  isDragging: false
};

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'ADD_BLOCK':
      const newBlocksAdd = [...state.blocks, action.payload];
      return {
        ...state,
        blocks: newBlocksAdd,
        history: {
          past: [...state.history.past, state.blocks],
          future: []
        }
      };

    case 'UPDATE_BLOCK':
      const newBlocksUpdate = state.blocks.map(block =>
        block.id === action.payload.id ? { ...block, ...action.payload.updates } : block
      );
      return {
        ...state,
        blocks: newBlocksUpdate,
        selectedBlock: state.selectedBlock?.id === action.payload.id 
          ? { ...state.selectedBlock, ...action.payload.updates }
          : state.selectedBlock
      };

    case 'REMOVE_BLOCK':
      const newBlocksRemove = state.blocks.filter(block => block.id !== action.payload);
      return {
        ...state,
        blocks: newBlocksRemove,
        selectedBlock: state.selectedBlock?.id === action.payload ? null : state.selectedBlock,
        history: {
          past: [...state.history.past, state.blocks],
          future: []
        }
      };

    case 'MOVE_BLOCK':
      const newBlocksMove = [...state.blocks];
      const [movedBlock] = newBlocksMove.splice(action.payload.fromIndex, 1);
      newBlocksMove.splice(action.payload.toIndex, 0, movedBlock);
      return {
        ...state,
        blocks: newBlocksMove
      };

    case 'SELECT_BLOCK':
      return {
        ...state,
        selectedBlock: action.payload
      };

    case 'SET_BLOCKS':
      return {
        ...state,
        blocks: action.payload,
        history: {
          past: [...state.history.past, state.blocks],
          future: []
        }
      };

    case 'UNDO':
      if (state.history.past.length === 0) return state;
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      return {
        ...state,
        blocks: previous,
        history: {
          past: newPast,
          future: [state.blocks, ...state.history.future]
        }
      };

    case 'REDO':
      if (state.history.future.length === 0) return state;
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      return {
        ...state,
        blocks: next,
        history: {
          past: [...state.history.past, state.blocks],
          future: newFuture
        }
      };

    case 'LOAD_TEMPLATE':
      return {
        ...state,
        blocks: action.payload,
        history: {
          past: [...state.history.past, state.blocks],
          future: []
        }
      };

    case 'RESET':
      return {
        ...initialState,
        history: {
          past: [],
          future: []
        }
      };

    default:
      return state;
  }
}

export function useEmailBuilder() {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  const addBlock = useCallback((block: EmailBlock) => {
    dispatch({ type: 'ADD_BLOCK', payload: block });
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<EmailBlock>) => {
    dispatch({ type: 'UPDATE_BLOCK', payload: { id, updates } });
  }, []);

  const removeBlock = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_BLOCK', payload: id });
  }, []);

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'MOVE_BLOCK', payload: { fromIndex, toIndex } });
  }, []);

  const selectBlock = useCallback((block: EmailBlock | null) => {
    dispatch({ type: 'SELECT_BLOCK', payload: block });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const loadTemplate = useCallback((blocks: EmailBlock[]) => {
    dispatch({ type: 'LOAD_TEMPLATE', payload: blocks });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setPreviewMode = useCallback((mode: 'desktop' | 'tablet' | 'mobile') => {
    // This would be handled in a separate state for preview mode
  }, []);

  return {
    state,
    actions: {
      addBlock,
      updateBlock,
      removeBlock,
      moveBlock,
      selectBlock,
      undo,
      redo,
      loadTemplate,
      reset,
      setPreviewMode
    }
  };
}