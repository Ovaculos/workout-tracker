export function displayName(name: string) {
  const characters = Array.from(name);
  return characters.length > 20 ? `${characters.slice(0, 20).join('')}-` : name;
}

export function nameColor(name: string) {
  let hash = 1779033703 ^ name.length;
  for (const character of name) {
    hash = Math.imul(hash ^ character.codePointAt(0)!, 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  while (true) {
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    hash ^= hash >>> 16;
    const rgb = [hash & 255, (hash >>> 8) & 255, (hash >>> 16) & 255];
    const linear = rgb.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    if (Math.max(...rgb) - Math.min(...rgb) >= 64 && luminance >= 0.31) {
      return `rgb(${rgb.join(' ')})`;
    }
    hash = (hash + 0x9e3779b9) | 0;
  }
}
