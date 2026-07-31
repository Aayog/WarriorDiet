import { Protocol } from '../types';

export const PROTOCOLS: Protocol[] = [
  { id: '16_8', name: '16/8', hours: 16 },
  { id: '18_6', name: '18/6', hours: 18 },
  { id: '20_4', name: '20/4', hours: 20 },
  { id: '22_2', name: '22/2', hours: 22 },
  { id: 'omad', name: 'OMAD 23/1', hours: 23 },
];

export function getProtocol(id: string): Protocol {
  return PROTOCOLS.find((p) => p.id === id) ?? PROTOCOLS[2];
}
