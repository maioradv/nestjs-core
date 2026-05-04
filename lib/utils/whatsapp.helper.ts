import { join } from "path";
import Handlebars from 'handlebars';
import { readFile, stat } from "fs/promises";

export class WhatsappBuilder {
  basePath = join(process.cwd(),'templates','whatsapp')
  pattern:string;
  group:string;
  locale:string;

  setGroup(group:string) {
    this.group = group
    return this
  }

  setPattern(pattern:string) {
    this.pattern = pattern
    return this
  }

  setLocale(locale:string) {
    this.locale = locale
    return this
  }

  private paths() {
    const mainPath = join(this.basePath,this.group)
    return [
      join(mainPath,'doc.hbs'),
      join(mainPath,'partials',`${this.pattern}.hbs`),
      join(mainPath,'locales',`${this.locale}.json`),
    ]
  }

  async safeCheck(){
    const paths = [
      join(this.basePath,this.group),
      ...this.paths()
    ]
    const results = await Promise.all(
      paths.map(p => stat(p).then(() => true).catch(() => false))
    );
   
    const missing = paths.filter((_, i) => !results[i]);

    if(missing.length > 0) throw new Error(`Missing paths: ${missing.join()}`)
  }

  private getNestedValue(obj: Record<string, any>, path: string): string {
    // @ts-ignore
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? path;
  }

  async init() {
    const [Container,Body,Labels] = await Promise.all(this.paths().map(path => readFile(path,'utf-8'))) 

    const labels = JSON.parse(Labels)
    Handlebars.registerHelper('fullDateTime', function(date, locale) {
      return new Date(date).toLocaleString(locale, { dateStyle: 'full', timeStyle: 'short' });
    });
    Handlebars.registerHelper('ternary', function (condition, valTrue, valFalse) {
      return condition ? valTrue : valFalse;
    });
    Handlebars.registerHelper('t', (key: string, options: Handlebars.HelperOptions) => {
      const template = this.getNestedValue(labels, key);
      if (options.hash && Object.keys(options.hash).length > 0) {
        return template.replace(/\{\{(\w+)\}\}/g, (_, k) => options.hash[k] ?? `{{${k}}}`);
      }
      return template;
    });
    Handlebars.registerPartial('body',Body)
    const template = Handlebars.compile(Container)
    return {
      template
    }
  }

  async build(args?:Record<string,any>) {
    const {template} = await this.init()
    return {
      message:template({
        ...args,
        locale:this.locale
      })
    }
  }

  replace(ctx:string,replace?:Record<string,any>) {
    if(!replace) return ctx;
    var re = new RegExp(Object.keys(replace).join("|"),"gi");
    return ctx.replace(re, function(matched){
      return replace[matched];
    })
  }
}