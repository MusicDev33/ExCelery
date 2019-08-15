import { KeyPair } from './keypair';

describe('KeyPair', () => {
  it('should create an instance', () => {
    expect(new KeyPair()).toBeTruthy();
  });
});
