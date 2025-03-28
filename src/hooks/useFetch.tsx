import { useEffect, useCallback, useReducer } from "react";

// Define action types for the reducer
const FETCH_START = "FETCH_START";
const FETCH_SUCCESS = "FETCH_SUCCESS";
const FETCH_ERROR = "FETCH_ERROR";

// Define types for state and actions
interface FetchState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

interface FetchAction<T> {
  type: string;
  payload?: T | string;
}

// Reducer function to manage fetch state
const fetchReducer = <T,>(
  state: FetchState<T>,
  action: FetchAction<T>
): FetchState<T> => {
  switch (action.type) {
    case FETCH_START:
      return { ...state, loading: true, error: null, data: [] as T };
    case FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload as T,
        error: null,
      };
    case FETCH_ERROR:
      return { ...state, loading: false, error: action.payload as string };
    default:
      return state;
  }
};

// Custom hook using useReducer
const useFetch = <T,>(url: string) => {
  // Initialize state with useReducer
  const [state, dispatch] = useReducer(fetchReducer<T>, {
    data: [] as T,
    loading: false,
    error: null,
  });

  // Function to fetch data from the API
  const fetchData = useCallback(async () => {
    dispatch({ type: FETCH_START });

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch data");

      const result: T = await response.json();
      dispatch({ type: FETCH_SUCCESS, payload: result });
    } catch (err) {
      dispatch({ type: FETCH_ERROR, payload: (err as Error).message });
    }
  }, [url]);

  // Fetch data on mount and when URL changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refresh: fetchData,
  };
};

export default useFetch;
