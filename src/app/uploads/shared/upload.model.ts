import * as hash from 'object-hash';

export class Upload {
  key: string;

  file: File;
  fileHash: string;
  name: string;
  url: string;
  progress: number;
  createdAt = new Date();

  constructor(file: File) {
    const prefix = `${new Date().getTime()}-${Math.random().toString().slice(2, 12)}`;
    this.name = `${prefix}-${file.name}`;

    this.file = file;
    this.fileHash = this.generateHash(this.name, file);
  }

  private generateHash(name, file): string {
    const metadata = {
      lastModified: file.lastModified,
      lastModifiedDate: file.lastModifiedDate,
      name: name,
      size: file.size,
      type: file.type
    };
    return hash(metadata);
  }
}
