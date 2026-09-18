import { appendFileSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

import type { PersonWorkout, WorkoutEntry, WorkoutOptions, WorkoutType } from '$lib/types';

const imageTypes: Record<string, string> = { png: 'image/png', jpeg: 'image/jpeg', jpg: 'image/jpeg', webp: 'image/webp' };

export class InputError extends Error {}

function required(value: unknown, label: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new InputError(`${label} is required.`);
  }
  return value.trim();
}

function personName(value: unknown) {
  const name = required(value, 'Name').normalize('NFC');
  if (name === '.' || name === '..' || /[<>:"/\\|?*\x00-\x1f\x7f]/.test(name) || name.endsWith('.') || Buffer.byteLength(name) > 240) {
    throw new InputError('Use a name that is valid as a filename.');
  }
  return name;
}

export function createStore(directory: string) {
  const peopleDirectory = join(directory, 'people');
  const typesFile = join(directory, 'workoutTypes.json');
  mkdirSync(peopleDirectory, { recursive: true });
  try {
    writeFileSync(typesFile, '[]\n', { flag: 'wx' });
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'EEXIST') throw error;
  }

  function people() {
    return readdirSync(peopleDirectory, { withFileTypes: true })
      .filter((file) => file.isFile() && file.name.endsWith('.jsonl'))
      .map((file) => file.name.slice(0, -6))
      .sort((a, b) => a.localeCompare(b));
  }

  function workoutTypes(): WorkoutType[] {
    return JSON.parse(readFileSync(typesFile, 'utf8'));
  }

  function pictureFile(name: string) {
    if (!people().includes(name)) return null;
    const files = readdirSync(peopleDirectory, { withFileTypes: true });
    return files.find((file) => file.isFile() && Object.keys(imageTypes).some((extension) => file.name === `${name}.${extension}`))?.name ?? null;
  }

  function picture(name: string) {
    const filename = pictureFile(name);
    if (!filename) return null;
    return {
      contentType: imageTypes[extname(filename).slice(1)],
      body: readFileSync(join(peopleDirectory, filename))
    };
  }

  function pictureVersion(name: string) {
    const filename = pictureFile(name);
    return filename ? statSync(join(peopleDirectory, filename)).mtimeMs : null;
  }

  async function savePicture(name: string, file: unknown) {
    if (!people().includes(name)) throw new InputError('Person not found.');
    if (!(file instanceof File) || !file.size) throw new InputError('Choose a picture.');
    const extension = extname(file.name).slice(1).toLowerCase();
    if (!Object.hasOwn(imageTypes, extension)) throw new InputError('Choose a PNG, JPEG, JPG, or WebP picture.');
    const bytes = Buffer.from(await file.arrayBuffer());
    const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isJpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const isWebp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    if (!(extension === 'png' ? isPng : extension === 'webp' ? isWebp : isJpeg)) {
      throw new InputError('The picture must match its file extension.');
    }
    const previous = pictureFile(name);
    const filename = `${name}.${extension}`;
    const path = join(peopleDirectory, filename);
    writeFileSync(`${path}.tmp`, bytes);
    renameSync(`${path}.tmp`, path);
    if (previous && previous !== filename) unlinkSync(join(peopleDirectory, previous));
  }

  function addPerson(value: unknown) {
    const name = personName(value);
    if (people().some((person) => person.toLowerCase() === name.toLowerCase())) {
      throw new InputError('A person with that name already exists.');
    }
    writeFileSync(join(peopleDirectory, `${name}.jsonl`), '', { flag: 'wx' });
  }

  function addWorkoutType(input: Record<string, unknown>) {
    const name = required(input.name, 'Workout name');
    const description = required(input.description, 'Field description');
    const type = input.type;
    if (type !== 'number' && type !== 'string') throw new InputError('Choose number or string.');
    let ranking: WorkoutType['ranking'] = 'none';
    if (type === 'number') {
      if (input.ranking !== 'higher' && input.ranking !== 'lower') {
        throw new InputError('Choose whether higher or lower values are better.');
      }
      ranking = input.ranking;
    }
    const types = workoutTypes();
    if (types.some((workout) => workout.name.toLowerCase() === name.toLowerCase())) {
      throw new InputError('A workout type with that name already exists.');
    }
    types.push({ name, description, type, ranking });
    writeFileSync(`${typesFile}.tmp`, `${JSON.stringify(types, null, 2)}\n`);
    renameSync(`${typesFile}.tmp`, typesFile);
  }

  function logWorkout(input: Record<string, unknown>) {
    const person = personName(input.person);
    if (!people().includes(person)) throw new InputError('Choose an existing person.');
    const workout = workoutTypes().find((type) => type.name === input.workoutName);
    if (!workout) throw new InputError('Choose an existing workout type.');
    const text = required(input.value, 'Value');
    const value = workout.type === 'number' ? Number(text) : text;
    if (workout.type === 'number' && !Number.isFinite(value)) {
      throw new InputError('Enter a valid number.');
    }
    const entry = { id: randomUUID(), workoutName: workout.name, value, createdAt: new Date().toISOString() };
    appendFileSync(join(peopleDirectory, `${person}.jsonl`), `${JSON.stringify(entry)}\n`);
  }

  function workouts(person: string): WorkoutEntry[] {
    return readFileSync(join(peopleDirectory, `${person}.jsonl`), 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line, index) => {
        const entry: Omit<WorkoutEntry, 'id'> & { id?: string } = JSON.parse(line);
        return { ...entry, id: entry.id ?? createHash('sha256').update(`${index}:${line}`).digest('hex') };
      });
  }

  function writeWorkouts(person: string, entries: WorkoutEntry[]) {
    const path = join(peopleDirectory, `${person}.jsonl`);
    const text = entries.map((entry) => JSON.stringify(entry)).join('\n');
    writeFileSync(`${path}.tmp`, text ? `${text}\n` : '');
    renameSync(`${path}.tmp`, path);
  }

  function deletePerson(value: unknown) {
    const name = personName(value);
    if (!people().includes(name)) throw new InputError('Person not found.');
    const filename = pictureFile(name);
    if (filename) unlinkSync(join(peopleDirectory, filename));
    unlinkSync(join(peopleDirectory, `${name}.jsonl`));
  }

  function deleteWorkoutType(value: unknown) {
    const name = required(value, 'Workout name');
    const types = workoutTypes();
    if (!types.some((type) => type.name === name)) throw new InputError('Workout type not found.');
    const histories = people().map((person) => ({ person, entries: workouts(person) }));
    for (const { person, entries } of histories) {
      const remaining = entries.filter((entry) => entry.workoutName !== name);
      if (remaining.length !== entries.length) writeWorkouts(person, remaining);
    }
    writeFileSync(`${typesFile}.tmp`, `${JSON.stringify(types.filter((type) => type.name !== name), null, 2)}\n`);
    renameSync(`${typesFile}.tmp`, typesFile);
  }

  function deleteWorkout(input: Record<string, unknown>) {
    const person = personName(input.person);
    if (!people().includes(person)) throw new InputError('Person not found.');
    const id = required(input.entryId, 'Workout entry');
    const entries = workouts(person);
    const index = entries.findIndex((entry) => entry.id === id);
    if (index === -1) throw new InputError('This workout entry no longer exists. Refresh the page.');
    entries.splice(index, 1);
    writeWorkouts(person, entries);
  }

  function records<T extends WorkoutEntry>(entries: T[], types: WorkoutType[]) {
    const best = new Map<string, number>();
    const prs: (T & { value: number })[] = [];
    for (const entry of entries) {
      const type = types.find((type) => type.name === entry.workoutName);
      if (!type || type.type !== 'number' || typeof entry.value !== 'number') continue;
      const previous = best.get(entry.workoutName);
      if (previous === undefined || (type.ranking === 'lower' ? entry.value < previous : entry.value > previous)) {
        best.set(entry.workoutName, entry.value);
        prs.push({ ...entry, value: entry.value });
      }
    }
    return prs;
  }

  function dashboard() {
    const names = people();
    const types = workoutTypes();
    const prs = names.flatMap((person) => records(workouts(person), types).map((entry) => ({ person, ...entry })));
    prs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { prs: prs.slice(0, 10) };
  }

  function options(): WorkoutOptions {
    const names = people();
    return {
      people: names,
      pictureVersions: Object.fromEntries(names.map((name) => [name, pictureVersion(name)])),
      workoutTypes: workoutTypes()
    };
  }

  function personPage(name: string) {
    if (!people().includes(name)) return null;
    const entries = workouts(name);
    const types = workoutTypes();
    const best = new Map<string, WorkoutEntry & { value: number }>();
    for (const entry of records(entries, types)) {
      best.set(entry.workoutName, entry);
    }
    return {
      name,
      workoutTypes: types,
      pictureVersion: pictureVersion(name),
      prs: [...best.values()].sort((a, b) => a.workoutName.localeCompare(b.workoutName)),
      workouts: entries.slice(-25).reverse()
    };
  }

  function workoutPage(name: string) {
    const workout = workoutTypes().find((type) => type.name === name);
    if (!workout) return null;
    const prs: (PersonWorkout & { value: number })[] = [];
    const recent: PersonWorkout[] = [];
    for (const person of people()) {
      const version = pictureVersion(person);
      const entries = workouts(person)
        .filter((entry) => entry.workoutName === name)
        .map((entry) => ({ person, ...entry, pictureVersion: version }));
      recent.push(...entries);
      const best = records(entries, [workout]).at(-1);
      if (best) prs.push(best);
    }
    prs.sort((a, b) => {
      const difference = workout.ranking === 'lower' ? a.value - b.value : b.value - a.value;
      return difference || a.person.localeCompare(b.person);
    });
    recent.reverse().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { workout, prs, recent: recent.slice(0, 25) };
  }

  return { addPerson, addWorkoutType, logWorkout, deletePerson, deleteWorkoutType, deleteWorkout, dashboard, options, personPage, workoutPage, picture, savePicture };
}
