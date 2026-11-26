import { createWriteStream, promises as fs, Stats } from 'fs';
import { join, dirname } from 'path';
import { EOL } from 'os';
import { joinFromRoot } from '../utils/path.helper';
import { Injectable } from '@nestjs/common';
import { pipeline } from 'stream/promises';
import { TarArchive } from 'archiver';

@Injectable()
export class StorageService {
  public rootPath = joinFromRoot('public')
  public useRealPath = false

  public async read(relativePath:string): Promise<Buffer> {
    const realPath = this.realPath(relativePath)
    return await fs.readFile(realPath, {});
  }

  public async write(relativePath:string,data:string | NodeJS.ArrayBufferView): Promise<void> {
    const realPath = this.realPath(relativePath)
    await this.safeDirectory(realPath)
    return await fs.writeFile(realPath, data, 'utf8');
  }

  public async append(relativePath:string,data:string | Uint8Array): Promise<void> {
    const realPath = this.realPath(relativePath)
    await this.safeDirectory(realPath)
    return await fs.appendFile(realPath, data + EOL);
  }

  public async delete(relativePath:string): Promise<void> {
    const realPath = this.realPath(relativePath)
    try {
      return await fs.unlink(realPath)
    }
    catch(e){}
  }

  public async stat(relativePath:string): Promise<Stats> {
    const realPath = this.realPath(relativePath)
    return fs.stat(realPath)
  }

  public async createDir(relativePath:string): Promise<void> {
    const realPath = this.realPath(relativePath)
    try {
      await fs.stat(realPath)
    }
    catch(e){
      await fs.mkdir(realPath,{recursive:true})
    }
  }

  async compressDir(dir: string,removeAfterCompress?:boolean) {
    const out = `${dir.replace(/\/+$/, '')}.tar.gz`;

    const archive = new TarArchive({ gzip: true, gzipOptions: { level: 6 } });
    const done = pipeline(archive, createWriteStream(out));
    archive.directory(dir, false);
    await archive.finalize();
    await done; 

    const { size } = await fs.stat(out);
    if (size === 0) throw new Error('Compress error: empty archive');

    if(removeAfterCompress) await fs.rm(dir, { recursive: true, force: true });
    return out;
  }

  private realPath(relativePath:string): string {
    return this.useRealPath ? relativePath : join(this.rootPath,relativePath)
  }

  private async safeDirectory(path:string): Promise<void> {
    const dirPath = dirname(path)
    try {
      await fs.stat(dirPath)
    }
    catch(e){
      await fs.mkdir(dirPath,{recursive:true})
    }
  }
}