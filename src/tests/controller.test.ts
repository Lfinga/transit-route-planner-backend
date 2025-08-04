import { Request, Response } from "express";
import { getRouteStops } from "../routes/v1/routes/controller";
import { getRouteStopsById } from "../repository/routes";

jest.mock("../repository/routes", () => ({
  getRouteStopsById: jest.fn(),
}));

describe("Routes Controller Tests", () => {
  describe("getRouteStops", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
      mockJson = jest.fn();
      mockStatus = jest.fn().mockReturnThis();

      mockRequest = {
        params: { id: "route-1" },
      };

      mockResponse = {
        json: mockJson,
        status: mockStatus,
      };

      jest.clearAllMocks();
    });

    it("should return stops when they exist for the route", async () => {
      const mockStops = [
        {
          stop_id: 1,
          stop_name: "Stop 1",
          location: "Location 1",
          stop_sequence: 1,
        },
        {
          stop_id: 2,
          stop_name: "Stop 2",
          location: "Location 2",
          stop_sequence: 2,
        },
      ];

      (getRouteStopsById as jest.Mock).mockResolvedValue(mockStops);

      await getRouteStops(mockRequest as Request, mockResponse as Response);

      expect(getRouteStopsById).toHaveBeenCalledWith("route-1");
      expect(mockJson).toHaveBeenCalledWith({
        data: mockStops,
      });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it("should return 404 when no stops are found", async () => {
      (getRouteStopsById as jest.Mock).mockResolvedValue([]);

      await expect(
        getRouteStops(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(
        "No stops found for this route or route does not exist",
      );

      expect(getRouteStopsById).toHaveBeenCalledWith("route-1");
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: "No stops found for this route or route does not exist",
      });
    });

    it("should handle database errors properly", async () => {
      const dbError = new Error("Database connection failed");
      (getRouteStopsById as jest.Mock).mockRejectedValue(dbError);

      await expect(
        getRouteStops(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow("Database connection failed");

      expect(getRouteStopsById).toHaveBeenCalledWith("route-1");
    });
  });
});
