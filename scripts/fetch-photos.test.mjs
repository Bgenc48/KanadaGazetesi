import { describe, it, expect } from 'vitest';
import { queryLadder } from './fetch-photos.mjs';

describe('queryLadder', () => {
  it('tam sorgudan gittikçe genelleşen sorgular üretir', () => {
    expect(queryLadder('Douala port Cameroon trade')).toEqual([
      'Douala port Cameroon trade',
      'Douala port Cameroon',
      'Douala port',
      'Douala',
    ]);
  });

  it('kısa sorgularda gereksiz basamak üretmez', () => {
    expect(queryLadder('Lagos Nigeria')).toEqual(['Lagos Nigeria', 'Lagos']);
    expect(queryLadder('Lagos')).toEqual(['Lagos']);
  });

  it('yinelenen basamakları eler', () => {
    // Üç kelimede slice(0,3) tam sorguyla aynıdır; iki kez eklenmemeli.
    const out = queryLadder('Accra Ghana skyline');
    expect(out).toEqual(['Accra Ghana skyline', 'Accra Ghana', 'Accra']);
    expect(new Set(out).size).toBe(out.length);
  });

  it('boş ve boşluklu girdilerde güvenli davranır', () => {
    expect(queryLadder('')).toEqual([]);
    expect(queryLadder('   ')).toEqual([]);
    expect(queryLadder(undefined)).toEqual([]);
    expect(queryLadder('  Kampala   market  ')).toEqual(['Kampala market', 'Kampala']);
  });
});
