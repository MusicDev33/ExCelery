import { Keypair } from './keypair';

describe('Keypair', () => {
  it('should create an instance', () => {
    expect(new Keypair()).toBeTruthy();
  });
});
