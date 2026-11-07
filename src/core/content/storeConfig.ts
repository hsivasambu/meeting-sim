// Technical spec → RNG and persistence; these are browser protocol values.
export const storeConfig = {
  seedBytes: 8,
  hexRadix: 16,
  hexByteWidth: 2,
  titlesKey: 'tcbae:v1:titles',
  lunchTitlesKey: 'tcbae:v2:titles',
} as const;
