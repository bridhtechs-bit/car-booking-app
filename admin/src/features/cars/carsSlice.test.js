import carsReducer from './carsSlice';

describe('cars slice', () => {
  const initial = { list: [], loading: false, error: null };

  it('should return initial state', () => {
    expect(carsReducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('should handle fetch fulfilled', () => {
    const action = { type: 'cars/fetchAll/fulfilled', payload: [{ _id: '1', name: 'x' }] };
    const next = carsReducer(initial, action);
    expect(next.list.length).toBe(1);
  });
});
