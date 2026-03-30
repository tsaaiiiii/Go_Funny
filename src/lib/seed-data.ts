import { Trip } from '@/types'

export const tripCoverPool = [
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
]

export const seedTrips: Trip[] = [
  {
    id: 'kyoto-spring',
    title: '京都初春散策',
    location: '京都 · 日本',
    startDate: '2025-03-18',
    endDate: '2025-03-24',
    mode: 'expense',
    cover: tripCoverPool[0],
    members: [
      { id: 'm1', name: 'Alice', avatar: 'A', color: 'bg-[#D5E9EF]' },
      { id: 'm2', name: 'Mina', avatar: 'M', color: 'bg-[#DCEAD9]' },
      { id: 'm3', name: 'Ken', avatar: 'K', color: 'bg-[#EFE2D4]' },
    ],
    expenses: [
      {
        id: 'e1',
        title: '町家早餐',
        amount: 1260,
        date: '2025-03-19',
        splitType: 'equal_all',
        participants: ['m1', 'm2', 'm3'],
        payerId: 'm1',
      },
      {
        id: 'e2',
        title: '嵐山小火車',
        amount: 2100,
        date: '2025-03-20',
        splitType: 'equal_selected',
        participants: ['m1', 'm2'],
        payerId: 'm2',
        note: 'Ken 去拍照沒有搭乘',
      },
      {
        id: 'e3',
        title: '和菓子伴手禮',
        amount: 980,
        date: '2025-03-21',
        splitType: 'custom',
        participants: ['m1', 'm2', 'm3'],
        payerId: 'm3',
        splits: [
          { memberId: 'm1', amount: 180 },
          { memberId: 'm2', amount: 300 },
          { memberId: 'm3', amount: 500 },
        ],
      },
    ],
    contributions: [],
  },
  {
    id: 'okinawa-pool',
    title: '沖繩海風小旅行',
    location: '沖繩 · 日本',
    startDate: '2025-06-11',
    endDate: '2025-06-15',
    mode: 'pool',
    cover: tripCoverPool[1],
    members: [
      { id: 'm4', name: 'Ari', avatar: 'A', color: 'bg-[#D5E9EF]' },
      { id: 'm5', name: 'Sora', avatar: 'S', color: 'bg-[#DCEAD9]' },
      { id: 'm6', name: 'Nori', avatar: 'N', color: 'bg-[#EFE2D4]' },
      { id: 'm7', name: 'Yui', avatar: 'Y', color: 'bg-[#E2E1F5]' },
    ],
    expenses: [
      {
        id: 'e4',
        title: '浮潛行程',
        amount: 5600,
        date: '2025-06-12',
        splitType: 'equal_all',
        participants: ['m4', 'm5', 'm6', 'm7'],
      },
      {
        id: 'e5',
        title: '租車加油',
        amount: 1800,
        date: '2025-06-13',
        splitType: 'equal_all',
        participants: ['m4', 'm5', 'm6', 'm7'],
      },
    ],
    contributions: [
      { id: 'c1', memberId: 'm4', amount: 3000, date: '2025-06-11' },
      { id: 'c2', memberId: 'm5', amount: 3000, date: '2025-06-11' },
      { id: 'c3', memberId: 'm6', amount: 2000, date: '2025-06-11' },
      { id: 'c4', memberId: 'm7', amount: 2000, date: '2025-06-11' },
    ],
  },
]

export function getRandomCover(index = 0) {
  return tripCoverPool[index % tripCoverPool.length]
}
