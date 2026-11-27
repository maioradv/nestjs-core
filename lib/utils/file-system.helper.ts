import { createWriteStream, promises as fs, Stats } from 'fs';
import { join, dirname } from 'path';
import { pipeline } from 'stream/promises';
import { TarArchive } from 'archiver';
import { getAttribute, setAttribute, removeAttribute } from 'fs-xattr';

export class FileSystem {
  static async compressDirectory(path: string,removeAfterCompress?:boolean) {
    const out = `${path.replace(/\/+$/, '')}.tar.gz`;

    const archive = new TarArchive({ gzip: true, gzipOptions: { level: 6 } });
    const done = pipeline(archive, createWriteStream(out));
    archive.directory(path, false);
    await archive.finalize();
    await done; 

    const { size } = await fs.stat(out);
    if (size === 0) throw new Error('Compress error: empty archive');

    if(removeAfterCompress) await fs.rm(path, { recursive: true, force: true });
    return out;
  }

  static async getAttr(path:string,name:string): Promise<string|undefined> {
    try {
      const result = await getAttribute(path, `user.${name}`);
      return result.toString();
    } catch (error: any) {
      if (error.code === 'ENOATTR' || error.code === 'ENODATA') {
        return undefined;
      }
      throw error;
    }
  }

  static async setAttr(path:string,name:string,value:string): Promise<void> {
    await setAttribute(
      path,
      `user.${name}`,
      value
    );
  }

  static async removeAttr(path: string, name: string): Promise<void> {
    try {
      await removeAttribute(path, `user.${name}`);
    } catch (error: any) {
      if (error.code !== 'ENOATTR' && error.code !== 'ENODATA') {
        throw error;
      }
    }
  }

  static async list(path: string) {
    const entries = await fs.readdir(path, {
      withFileTypes: true,
    });

    return entries.map(entry => ({
      name: entry.name,
      path: join(path, entry.name),
      isDirectory: entry.isDirectory(),
      isFile: entry.isFile()
    }));
  }
}