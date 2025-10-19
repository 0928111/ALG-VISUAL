export const STEP_MAPPING = {
  STEP_0: 'INIT',
  STEP_1: 'FETCH_PAGES',
  STEP_2: 'REDISTRIBUTE', 
  STEP_3: 'AGGREGATE',
  STEP_4: 'ITERATE',
  STEP_5: 'CONVERGE',
  STEP_6: 'NORMALIZE',
  STEP_7: 'FINALIZE',
  STEP_8: 'COMPLETE'
} as const

export type StepNodeId = typeof STEP_MAPPING[keyof typeof STEP_MAPPING]

export const getNodeIdByStep = (step: number): string => {
  const mapping: { [key: number]: string } = {
    0: STEP_MAPPING.STEP_0,
    1: STEP_MAPPING.STEP_1,
    2: STEP_MAPPING.STEP_2,
    3: STEP_MAPPING.STEP_3,
    4: STEP_MAPPING.STEP_4,
    5: STEP_MAPPING.STEP_5,
    6: STEP_MAPPING.STEP_6,
    7: STEP_MAPPING.STEP_7,
    8: STEP_MAPPING.STEP_8
  }
  return mapping[step] || STEP_MAPPING.STEP_0
}