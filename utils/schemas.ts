import { expect } from '@playwright/test';
import { businessRules } from './constants';

export type Room = {
  accessible: boolean;
  description: string;
  features: string[];
  image: string;
  roomName: string;
  roomPrice: number;
  roomid: number;
  type: string;
};

export type RoomsResponse = {
  rooms: Room[];
};

export type BookingValidationResponse = {
  errors: string[];
};

export function expectValidRoom(room: Room): void {
  for (const field of businessRules.roomFields) {
    expect(room, `room should expose ${field}`).toHaveProperty(field);
  }

  expect(room.roomid).toBeGreaterThanOrEqual(1);
  expect(room.roomName).not.toHaveLength(0);
  expect(room.type).not.toHaveLength(0);
  expect(room.roomPrice).toBeGreaterThanOrEqual(businessRules.minimumRoomPrice);
  expect(Array.isArray(room.features)).toBe(true);
  expect(room.image).toMatch(/^\/images\//);
}

export function expectValidRoomsResponse(body: RoomsResponse): void {
  expect(Array.isArray(body.rooms)).toBe(true);
  expect(body.rooms.length).toBeGreaterThan(0);
  body.rooms.forEach(expectValidRoom);
}
