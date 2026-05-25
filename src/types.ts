export type Phase = 'idle' | 'throwing' | 'settling' | 'result';

export type ThrowResult = 'pending' | 'sheng-bei' | 'xiao-bei' | 'yin-bei';

export const RESULT_LABELS: Record<ThrowResult, string> = {
  pending: '',
  'sheng-bei': '圣杯 ✓',
  'xiao-bei': '笑杯 ○',
  'yin-bei': '阴杯 ✗',
};

export const RESULT_MEANINGS: Record<ThrowResult, string> = {
  pending: '',
  'sheng-bei': '一阴一阳，所求可行',
  'xiao-bei': '双阳，神明未定或一笑置之',
  'yin-bei': '双阴，所求不可行',
};
