export function displayName(name) {
  const characters = Array.from(name);
  return characters.length > 20 ? `${characters.slice(0, 20).join('')}-` : name;
}
