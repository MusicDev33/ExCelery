// This class will make managing keys a little easier (hopefully)
// It'll basically help the KeyService keep track of more than one pair of keys
// by storing

export class KeyPair {
  primaryKey = '';
  secondaryKey = '';

  primaryFile = '';
  primaryHeader = '';

  secondaryFile = '';
  secondaryHeader = '';

  constructor () { }

  createKey(filename: string, header: string) {
    return filename + ':' + header;
  }

  setKey(filename: string, header: string) {
    if (this.keyExists(filename, header)) {
      this.deleteKey(filename, header);
      return;
    }

    if (this.primaryKey !== '' && this.secondaryKey === '') {
      this.setSecondaryKey(filename, header);
    } else if (this.primaryKey === '') {
      this.setPrimaryKey(filename, header);
    }
  }

  setPrimaryKey(filename: string, header: string) {
    this.primaryKey = this.createKey(filename, header);
    this.primaryFile = filename;
    this.primaryHeader = header;
  }

  setSecondaryKey(filename: string, header: string) {
    this.secondaryKey = this.createKey(filename, header);
    this.secondaryFile = filename;
    this.secondaryHeader = header;
  }

  doBothKeysExist() {
    return this.primaryKey.length > 0 && this.secondaryKey.length > 0;
  }

  getIsPrimaryKey(filename: string, header: string) {
    return this.primaryKey === this.createKey(filename, header);
  }

  getIsSecondaryKey(filename: string, header: string) {
    return this.secondaryKey === this.createKey(filename, header);
  }

  keyExists(filename: string, header: string) {
    return this.getIsPrimaryKey(filename, header) || this.getIsSecondaryKey(filename, header);
  }

  getWhichKey(filename: string, header: string) {
    if (!this.keyExists(filename, header)) {
      return 0;
    }
    // Still not sure about readability here
    return this.getIsPrimaryKey(filename, header) ? 1 : 2;
  }

  getHeaderFromFile(filename: string) {
    if (!this.doBothKeysExist) { return; }

    return this.primaryKey.includes(filename) ? this.primaryHeader : this.secondaryHeader;
  }

  getWhichKeyFileIn(filename) {
    if (!this.isFilenameInKey(filename)) {
      return 0;
    }
    // Again, might change for readability's sake
    return this.primaryKey.includes(filename) ? 1 : 2;
  }

  isFilenameInKey(filename: string) {
    return this.primaryKey.includes(filename) || this.secondaryKey.includes(filename);
  }

  getKeyTypeText(filename: string) {
    if (!this.isFilenameInKey(filename)) {
      return '';
    }

    return this.primaryKey.includes(filename) ? 'Primary' : 'Secondary';
  }

  // DELETE Methods
  deleteKey(filename: string, header: string) {
    if (this.getWhichKey(filename, header) === 1) {
      this.deletePrimaryKey();
    } else if (this.getWhichKey(filename, header) === 2) {
      this.deleteSecondaryKey();
    }
  }

  deleteKeys() {
    this.deletePrimaryKey();
    this.deleteSecondaryKey();
  }

  deletePrimaryKey() {
    this.primaryKey = '';
    this.primaryFile = '';
    this.primaryHeader = '';
  }

  deleteSecondaryKey() {
    this.secondaryKey = '';
    this.secondaryFile = '';
    this.secondaryHeader = '';
  }
}
