import { APIRequestContext, expect } from '@playwright/test';
import { routes } from './constants';
import { recordDuration, incrementCounter } from './datadog/Metrics';
import { BookingValidationResponse, expectValidRoomsResponse, RoomsResponse } from './schemas';
import { invalidBookingPayload, testDates } from './testData';

export class ApiClient {
  private latestRoomsResponse?: RoomsResponse;
  private latestBookingValidationResponse?: { status: number; body: BookingValidationResponse };

  constructor(private readonly request: APIRequestContext) {}

  async getRooms(): Promise<RoomsResponse> {
    const response = await this.trackApiRequest('rooms', 'get', () => this.request.get(routes.rooms));
    expect(response.status()).toBe(200);
    return response.json() as Promise<RoomsResponse>;
  }

  async getAvailableRooms(checkin: string, checkout: string): Promise<RoomsResponse> {
    const response = await this.trackApiRequest('availability', 'get', () => this.request.get(routes.availableRooms(checkin, checkout)));
    expect(response.status()).toBe(200);
    return response.json() as Promise<RoomsResponse>;
  }

  async createInvalidBooking(): Promise<{ status: number; body: BookingValidationResponse }> {
    const response = await this.trackApiRequest('booking', 'post', () => this.request.post(routes.booking, {
      data: invalidBookingPayload
    }));

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

  private async trackApiRequest<T extends { status(): number }>(
    endpoint: string,
    method: string,
    action: () => Promise<T>
  ): Promise<T> {
    const startedAt = Date.now();
    const tags = [`endpoint:${endpoint}`, `method:${method}`];

    try {
      const response = await action();
      const status = response.status();
      const outcome = status >= 200 && status < 400 ? 'pass' : 'fail';

      await recordDuration('api.duration', Date.now() - startedAt, [...tags, `status_code:${status}`, `outcome:${outcome}`]);
      await incrementCounter(`api.${outcome}`, [...tags, `status_code:${status}`]);

      return response;
    } catch (error) {
      await recordDuration('api.duration', Date.now() - startedAt, [...tags, 'outcome:error']);
      await incrementCounter('api.fail', [...tags, 'outcome:error']);
      throw error;
    }
  }
}
