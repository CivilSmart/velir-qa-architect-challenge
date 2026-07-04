export const routes = {
  rooms: '/api/room',
  availableRooms: (checkin: string, checkout: string) => `/api/room?checkin=${checkin}&checkout=${checkout}`,
  booking: '/api/booking'
} as const;

export const businessRules = {
  minimumRoomPrice: 1,
  roomFields: ['roomid', 'roomName', 'type', 'roomPrice', 'features', 'accessible', 'image', 'description']
} as const;
