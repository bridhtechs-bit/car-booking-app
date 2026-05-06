import authReducer, { logout } from './authSlice';

describe('auth slice', () => {
  const initial = { admin: null, token: null, loading: false, error: null };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('should handle logout', () => {
    const state = { admin: { name: 'A' }, token: 'tok', loading:false, error:null };
    const next = authReducer(state, logout());
    expect(next.admin).toBeNull();
    expect(next.token).toBeNull();
  });
});
