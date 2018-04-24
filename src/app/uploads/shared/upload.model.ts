import * as hash from 'object-hash';

export class Upload {
  key: string;

  file: File;
  fileHash: string;
  name: string;
  url: string;
  progress: number;
  thumbUrl: string;
  createdAt = new Date();

  constructor(file: File) {
    const prefix = `${new Date().getTime()}-${Math.random().toString().slice(2, 12)}`;
    this.name = `${prefix}-${file.name}`;

    this.file = file;
    this.fileHash = this.generateHash(this.name, file);

    this.thumbUrl = this.setThumbUrl(file.name);
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

  private setThumbUrl(filename: string): string {
    const documentTypes = [
      'doc',
      'docx',
      'txt'
    ];
    const imageTypes = [
      'gif',
      'jpeg',
      'jpg',
      'png'
    ];
    const pdfTypes = [
      'pdf'
    ];
    const spreadsheetTypes = [
      'csv',
      'xls',
      'xlsx'
    ];

    const extension = filename.split('.').pop();

    if (documentTypes.includes(extension)) {
      return 'assets/document.png';
    }
    if (imageTypes.includes(extension.toLowerCase())) {
      return null;
    }
    if (pdfTypes.includes(extension)) {
      return 'assets/pdf.png';
    }
    if (spreadsheetTypes.includes(extension)) {
      return 'assets/spreadsheet.png';
    }
    return 'assets/file.png';
  }
}
