import { createChain, applyChains } from './validator-chain';

describe('createChain', () => {
  it('returns valid when no rules are defined', () => {
    const chain = createChain<number>();
    expect(chain.validate(42)).toEqual([]);
  });

  it('min() passes when value meets minimum', () => {
    const chain = createChain<number>().min(5);
    expect(chain.validate(10)).toEqual([]);
  });

  it('min() fails when value is below minimum', () => {
    const chain = createChain<number>().min(5);
    const results = chain.validate(3);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ valid: false, message: expect.stringContaining('minimum 5') });
  });

  it('max() passes when value is within maximum', () => {
    const chain = createChain<number>().max(100);
    expect(chain.validate(50)).toEqual([]);
  });

  it('max() fails when value exceeds maximum', () => {
    const chain = createChain<number>().max(100);
    const results = chain.validate(200);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ valid: false, message: expect.stringContaining('exceeds maximum 100') });
  });

  it('matches() passes on matching pattern', () => {
    const chain = createChain<string>().matches(/^[a-z]+$/);
    expect(chain.validate('hello')).toEqual([]);
  });

  it('matches() fails on non-matching pattern', () => {
    const chain = createChain<string>().matches(/^[a-z]+$/);
    const results = chain.validate('Hello123');
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ valid: false });
  });

  it('oneOf() passes for valid option', () => {
    const chain = createChain<string>().oneOf(['dev', 'prod', 'test']);
    expect(chain.validate('prod')).toEqual([]);
  });

  it('oneOf() fails for invalid option', () => {
    const chain = createChain<string>().oneOf(['dev', 'prod']);
    const results = chain.validate('staging');
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ valid: false, message: expect.stringContaining('staging') });
  });

  it('chains multiple rules and collects all failures', () => {
    const chain = createChain<number>().min(10).max(5);
    const results = chain.validate(7);
    expect(results).toHaveLength(1);
  });

  it('custom rule() is applied', () => {
    const chain = createChain<string>().rule((v) =>
      v !== '' ? { valid: true } : { valid: false, message: 'must not be empty' }
    );
    expect(chain.validate('')).toHaveLength(1);
    expect(chain.validate('hi')).toHaveLength(0);
  });
});

describe('applyChains', () => {
  it('returns empty errors when all chains pass', () => {
    const env = { PORT: 8080, NODE_ENV: 'production' };
    const chains = {
      PORT: createChain<unknown>().min(1024).max(65535),
      NODE_ENV: createChain<unknown>().oneOf(['development', 'production', 'test']),
    };
    expect(applyChains(env, chains)).toEqual({});
  });

  it('collects errors for failing keys', () => {
    const env = { PORT: 80, NODE_ENV: 'unknown' };
    const chains = {
      PORT: createChain<unknown>().min(1024),
      NODE_ENV: createChain<unknown>().oneOf(['development', 'production']),
    };
    const errors = applyChains(env, chains);
    expect(Object.keys(errors)).toContain('PORT');
    expect(Object.keys(errors)).toContain('NODE_ENV');
  });

  it('ignores keys without a chain', () => {
    const env = { PORT: 80, EXTRA: 'anything' };
    const chains = { PORT: createChain<unknown>().min(1024) };
    const errors = applyChains(env, chains);
    expect(Object.keys(errors)).not.toContain('EXTRA');
  });
});
