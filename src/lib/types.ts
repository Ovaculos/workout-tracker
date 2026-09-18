export type WorkoutType = {
  name: string;
  description: string;
  type: 'number' | 'string';
  ranking: 'higher' | 'lower' | 'none';
};

export type WorkoutEntry = {
  id: string;
  workoutName: string;
  value: number | string;
  createdAt: string;
};

export type PersonWorkout = WorkoutEntry & {
  person: string;
  pictureVersion: number | null;
};

export type WorkoutOptions = {
  people: string[];
  pictureVersions: Record<string, number | null>;
  workoutTypes: WorkoutType[];
};

export type SearchOption = {
  name: string;
  picture?: string | null;
};

export type ActionMode = 'person' | 'type' | 'workout';

export type WorkoutActions = {
  open: (mode: ActionMode) => void;
};

export type FormResult = {
  success?: boolean;
  error?: string;
};
