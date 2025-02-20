import { promises as fs, Stats } from 'fs';
import { join, dirname } from 'path';
import { EOL } from 'os';
import { joinFromRoot } from '../utils/path.helper';
import internal from 'stream';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  public rootPath = joinFromRoot('public')
  public useRealPath = false

  public async read(relativePath:string): Promise<Buffer> {
    const realPath = this.realPath(relativePath)
    return await fs.readFile(realPath, {});
  }

  public async write(relativePath:string,data:string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | internal.Stream): Promise<void> {
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
    await this.safeDirectory(realPath)
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