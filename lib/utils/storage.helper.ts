import * as fs from 'fs';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { EOL } from 'os';
import { joinFromRoot } from './path.helper';

export default class StorageHelper {
  public rootPath = joinFromRoot('public')

  public async read(path:string): Promise<string | Buffer> {
    const realPath = join(this.rootPath,path)
    const readFile = promisify(fs.readFile);
    return await readFile(realPath, {});
  }

  public async write(path:string,data:string): Promise<void> {
    const realPath = join(this.rootPath,path)
    this.safeDirectory(realPath)
    const writeFile = promisify(fs.writeFile);
    return await writeFile(realPath, data, 'utf8');
  }

  public async append(path:string,data:string): Promise<void> {
    const realPath = join(this.rootPath,path)
    this.safeDirectory(realPath)
    const appendFile = promisify(fs.appendFile);
    return await appendFile(realPath, data + EOL);
  }

  public async delete(path:string): Promise<void> {
    const realPath = join(this.rootPath,path)
    const unlink = promisify(fs.unlink);
    return fs.existsSync(realPath) ? await unlink(realPath) : null;
  }

  private safeDirectory(path:string) {
    const dirPath = dirname(path)
    if(!fs.existsSync(dirPath)) fs.mkdirSync(dirPath,{recursive:true});
  }
}