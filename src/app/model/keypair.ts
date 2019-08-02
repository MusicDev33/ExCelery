// This class will make managing keys a little easier (hopefully)
// It'll basically help the KeyService keep track of more than one pair of keys
// by storing

export class Keypair {
  primaryKey = '';
  secondaryKey = '';

  primaryFile = '';
  primaryHeader = '';

  secondaryFile = '';
  secondaryHeader = '';

  constructor () { }
}
