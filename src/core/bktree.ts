export type DistanceResult = { candidate: string; score: number };

/**
 * Compute the Damerau–Levenshtein edit distance between two strings.
 * 
 * //TODO: needed to look this algorithm up
 */
export function damerauLevenshtein(source: string, target: string): number {
  const sourceLength = source.length;
  const targetLength = target.length;
  const distanceTable: number[][] = Array.from({ length: sourceLength + 1 }, () => new Array(targetLength + 1).fill(0));
  for (let i = 0; i <= sourceLength; i++) distanceTable[i][0] = i;
  for (let j = 0; j <= targetLength; j++) distanceTable[0][j] = j;
  for (let i = 1; i <= sourceLength; i++) {
    for (let j = 1; j <= targetLength; j++) {
      const same = source[i - 1] === target[j - 1];
      const substitutionCost = same ? 0 : 1;
      const del = distanceTable[i - 1][j] + 1;
      const ins = distanceTable[i][j - 1] + 1;
      const sub = distanceTable[i - 1][j - 1] + substitutionCost;
      let best = Math.min(del, ins, sub);
      if (i > 1 && j > 1 && source[i - 1] === target[j - 2] && source[i - 2] === target[j - 1]) {
        best = Math.min(best, distanceTable[i - 2][j - 2] + 1);
      }
      distanceTable[i][j] = best;
    }
  }
  return distanceTable[sourceLength][targetLength];
}

type BKNode = { word: string; children: Map<number, BKNode> };

/**
 * BK-tree for approximate string matching by edit distance.
 * //TODO: needed to look this algorithm up
 */
export class BKTree {
  private root: BKNode | null = null;
  constructor(private readonly distanceFn: (a: string, b: string) => number = damerauLevenshtein) {}

  add(word: string): void {
    if (!this.root) {
      this.root = { word, children: new Map() };
      return;
    }
    let node = this.root;
    while (true) {
      const editDistance = this.distanceFn(word, node.word);
      const childNode = node.children.get(editDistance);
      if (!childNode) {
        node.children.set(editDistance, { word, children: new Map() });
        return;
      }
      node = childNode;
    }
  }

  search(query: string, maxDistance: number): DistanceResult[] {
    if (!this.root) return [];
    const results: DistanceResult[] = [];
    const nodesToVisit: BKNode[] = [this.root];
    while (nodesToVisit.length) {
      const node = nodesToVisit.pop() as BKNode;
      const editDistance = this.distanceFn(query, node.word);
      if (editDistance <= maxDistance) {
        results.push({ candidate: node.word, score: editDistance });
      }
      const minEdge = editDistance - maxDistance;
      const maxEdge = editDistance + maxDistance;
      for (const [edgeDistance, childNode] of node.children) {
        if (edgeDistance >= minEdge && edgeDistance <= maxEdge) {
          nodesToVisit.push(childNode);
        }
      }
    }
    return results;
  }
}


