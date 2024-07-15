import { promises as fs, Stats } from 'fs';
import { join, dirname } from 'path';
import { EOL } from 'os';
import { joinFromRoot } from './path.helper';
import internal from 'stream';

export class StorageHelper {
  public rootPath = joinFromRoot('public')

  public async read(path:string): Promise<Buffer> {
    const realPath = join(this.rootPath,path)
    return await fs.readFile(realPath, {});
  }

  public async write(path:string,data:string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | internal.Stream): Promise<void> {
    const realPath = join(this.rootPath,path)
    await this.safeDirectory(realPath)
    return await fs.writeFile(realPath, data, 'utf8');
  }

  public async append(path:string,data:string | Uint8Array): Promise<void> {
    const realPath = join(this.rootPath,path)
    await this.safeDirectory(realPath)
    return await fs.appendFile(realPath, data + EOL);
  }

  public async delete(path:string): Promise<void> {
    const realPath = join(this.rootPath,path)
    try {
      return await fs.unlink(realPath)
    }
    catch(e){}
  }

  public async stat(path:string): Promise<Stats> {
    const realPath = join(this.rootPath,path)
    return fs.stat(realPath)
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