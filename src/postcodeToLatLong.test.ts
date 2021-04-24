import { postCodeToLatLong } from './postcodeToLatLong';

describe('postcodeToLatLong', () => {
  test('L153HP', async () => {
    const result = await postCodeToLatLong('L153HP');
    expect (result.lat).toBeDefined();
  })
});