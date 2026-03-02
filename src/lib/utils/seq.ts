export function parseSeq(seqStr: string | null): number | null {
  if (!seqStr) return null;

  const seq = Number(seqStr);
  if (!Number.isInteger(seq) || seq <= 0) return null;

  return seq;
}
