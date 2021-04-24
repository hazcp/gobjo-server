import { generateLatLongRange } from './generateLatLongRange';


describe('generateLatLongRange', () => {
  test('2km LatLong Range',  () => {
    const result = generateLatLongRange({
      "lat": 53.392752,
      "long": -2.931828
    }, 2000);
    expect (result).toBeDefined();
  })
});