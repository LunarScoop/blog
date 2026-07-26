export interface DraftQueryOptions {
  includeDrafts?: boolean;
}

export const shouldIncludeDrafts = ({ includeDrafts }: DraftQueryOptions = {}) =>
  includeDrafts ?? import.meta.env.DEV;

export const isVisibleByDraftState = (draft: boolean, includeDrafts: boolean) =>
  includeDrafts || !draft;

export const compareDatesDescending = (left: Date, right: Date) => right.getTime() - left.getTime();
