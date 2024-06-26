import { join } from 'path';

export const ROOT_PATH = join(process.cwd())//join(__dirname,'..','../../','../../')

export const joinFromRoot = (...paths:string[]):string => join(ROOT_PATH,...paths)