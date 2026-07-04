export const routes = {
  home: '/',
  rooms: '/api/room',
  room: (roomId: number) => `/api/room/${roomId}`,
  availableRooms: (checkin: string, checkout: string) => `/api/room?checkin=${checkin}&checkout=${checkout}`,
  booking: '/api/booking',
  message: '/api/message',
  branding: '/api/branding'
} as const;

export const businessRules = {
  minimumRoomPrice: 1,
  roomFields: ['roomid', 'roomName', 'type', 'roomPrice', 'features', 'accessible', 'image', 'description']
} as const;

