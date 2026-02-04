import { useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildSearchParams,
  parseSearchQuery,
  type SearchQueryState,
} from "./SearchFormState";

type SetQueryOptions = {
  replace?: boolean;
  scroll?: boolean;
};

export function useSearchQuery() {
  const router = useRouter();
  const sp = useSearchParams();

  const state = useMemo<SearchQueryState>(() => {
    return parseSearchQuery(new URLSearchParams(sp.toString()));
  }, [sp]);

  const setState = useCallback(
    (next: SearchQueryState, options: SetQueryOptions = {}) => {
      const nextParams = buildSearchParams(next);
      const url = `/search?${nextParams.toString()}`;
      const replace = options.replace ?? false;
      const scroll = options.scroll ?? false;

      if (replace) router.replace(url, { scroll });
      else router.push(url, { scroll });
    },
    [router]
  );

  const patchState = useCallback(
    (patch: Partial<SearchQueryState>, options: SetQueryOptions = {}) => {
      setState({ ...state, ...patch }, options);
    },
    [setState, state]
  );

  return { state, setState, patchState };
}

