import mongoose from 'mongoose';
import { connectDB } from '../../src/config/db';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  set: jest.fn(),
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    fatal: jest.fn(),
  },
}));

describe('Database Connection', () => {
  const mockConnect = mongoose.connect as jest.MockedFunction<
    typeof mongoose.connect
  >;
  const mockSet = mongoose.set as jest.MockedFunction<typeof mongoose.set>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.exit mock
    jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('connectDB', () => {
    it('should connect successfully on first attempt', async () => {
      const testUri = 'mongodb://localhost:27017/test';
      mockConnect.mockResolvedValueOnce(mongoose as any);

      await connectDB(testUri);

      expect(mockSet).toHaveBeenCalledWith('strictQuery', false);
      expect(mockConnect).toHaveBeenCalledWith(testUri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should retry connection on failure and succeed on second attempt', async () => {
      const testUri = 'mongodb://localhost:27017/test';

      // Mock delay function to avoid actual waiting
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      mockConnect
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce(mongoose as any);

      await connectDB(testUri);

      expect(mockConnect).toHaveBeenCalledTimes(2);
    });

    it('should exit process after all retries fail', async () => {
      const testUri = 'mongodb://localhost:27017/test';

      // Mock delay function
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      mockConnect
        .mockRejectedValue(new Error('Connection failed'))
        .mockRejectedValue(new Error('Connection failed'))
        .mockRejectedValue(new Error('Connection failed'));

      await expect(connectDB(testUri)).rejects.toThrow('process.exit called');

      expect(mockConnect).toHaveBeenCalledTimes(3);
    });
  });
});
