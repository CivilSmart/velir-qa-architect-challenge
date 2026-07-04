import { APIRequestContext, expect } from '@playwright/test';
import { routes } from './constants';
import { BookingValidationResponse, expectValidRoomsResponse, RoomsResponse } from './schemas';
import { invalidBookingPayload, testDates } from './testData';

export class ApiClient {
  private latestRoomsResponse?: RoomsResponse;
  private latestBookingValidationResponse?: { status: number; body: BookingValidationResponse };

  constructor(private readonly request: APIRequestContext) {}

  async getRooms(): Promise<RoomsResponse> {
    const response = await this.request.get(routes.rooms);
    expect(response.status()).toBe(200);
    return response.json() as Promise<RoomsResponse>;
  }

  async getAvailableRooms(checkin: string, checkout: string): Promise<RoomsResponse> {
    const response = await this.request.get(routes.availableRooms(checkin, checkout));
    expect(response.status()).toBe(200);
    return response.json() as Promise<RoomsResponse>;
  }

  async createInvalidBooking(): Promise<{ status: number; body: BookingValidationResponse }> {
    const response = await this.request.post(routes.booking, {
      data: invalidBookingPayload
    });

    return {
      status: response.status(),
      body: (await response.json()) as BookingValidationResponse
    };
  }

  async expectRoomInventoryContractIsValid(): Promise<void> {
    const body = await this.getRooms();
    expectValidRoomsResponse(body);
  }

  async expectFutureAvailabilityContractIsValid(): Promise<void> {
    const body = await this.getAvailableRooms(testDates.checkin, testDates.checkout);
    expectValidRoomsResponse(body);
  }

  async expectInvalidBookingPayloadIsRejected(): Promise<void> {
    const { status, body } = await this.createInvalidBooking();

    expect(status).toBe(400);
    expect(body.errors).toEqual(expect.arrayContaining([
      expect.stringContaining('Firstname'),
      expect.stringContaining('Lastname')
    ]));
  }

  async requestRoomInventory(): Promise<void> {
    this.latestRoomsResponse = await this.getRooms();
  }

  async requestFutureRoomAvailability(): Promise<void> {
    this.latestRoomsResponse = await this.getAvailableRooms(testDates.checkin, testDates.checkout);
  }

  async submitInvalidBookingRequest(): Promise<void> {
    this.latestBookingValidationResponse = await this.createInvalidBooking();
  }

  async expectLatestRoomResponseContractIsValid(): Promise<void> {
    expect(this.latestRoomsResponse, 'room API response should be available before validation').toBeDefined();
    expectValidRoomsResponse(this.latestRoomsResponse as RoomsResponse);
  }

  async expectLatestBookingRequestRejectedWithValidationErrors(): Promise<void> {
    expect(
      this.latestBookingValidationResponse,
      'booking validation response should be available before validation'
    ).toBeDefined();

    const { status, body } = this.latestBookingValidationResponse as {
      status: number;
      body: BookingValidationResponse;
    };

    expect(status).toBe(400);
    expect(body.errors).toEqual(expect.arrayContaining([
      expect.stringContaining('Firstname'),
      expect.stringContaining('Lastname')
    ]));
  }
}
