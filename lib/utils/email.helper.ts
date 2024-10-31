import { join } from "path";
import Handlebars from 'handlebars';
import { readFile } from "fs/promises";

export class EmailBuilder {
  basePath = join(process.cwd(),'templates','email')
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

  async build(args?:Record<string,any>) {
    const [Subject,Locales,Body,Doc,Header,Footer] = await Promise.all([
      readFile(join(this.basePath,this.group,'locales',`subject.json`),'utf-8'),
      readFile(join(this.basePath,this.group,'locales',`${this.locale}.json`),'utf-8'),
      readFile(join(this.basePath,this.group,'partials',`${this.pattern}.hbs`),'utf-8'),
      readFile(join(this.basePath,this.group,'doc.hbs'),'utf-8'),
      readFile(join(this.basePath,this.group,'partials',`header.hbs`),'utf-8'),
      readFile(join(this.basePath,this.group,'partials',`footer.hbs`),'utf-8'),
    ])
    const subject = JSON.parse(Subject)[this.pattern][this.locale]
    const locale = JSON.parse(Locales)
    Handlebars.registerHelper('locale',(ctx) => locale[ctx] ?? ctx)
    Handlebars.registerPartial('header',Header)
    Handlebars.registerPartial('footer',Footer)
    Handlebars.registerPartial('body',Body)
    const template = Handlebars.compile(Doc)
    return {
      subject:this.replace(subject,args),
      html:template(args)
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