import { join } from "path";
import Handlebars from 'handlebars';
import { readFile, stat } from "fs/promises";

export class EmailBuilder {
  basePath = join(process.cwd(),'templates','email')
  pattern:string;
  group:string;
  locale:string;
  header = 'header';
  footer = 'footer';

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

  setHeader(header:string) {
    this.header = header
    return this
  }

  setFooter(footer:string) {
    this.footer = footer
    return this
  }

  private paths() {
    const mainPath = join(this.basePath,this.group)
    return [
      join(mainPath,'doc.hbs'),
      join(mainPath,'partials',`${this.header}.hbs`),
      join(mainPath,'partials',`${this.footer}.hbs`),
      join(mainPath,'partials',`${this.pattern}.hbs`),
      join(mainPath,'locales',`subject.json`),
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

  async initEmail() {
    const [Container,Header,Footer,Body,Subjects,Labels] = await Promise.all(this.paths().map(path => readFile(path,'utf-8'))) 

    const parsedSubjects = JSON.parse(Subjects)
    if(!(this.pattern in parsedSubjects)) throw new Error(`Missing subject: ${this.pattern}`)
    if(!(this.locale in parsedSubjects[this.pattern])) throw new Error(`Missing locale: ${this.locale} for subject ${this.pattern}`)
    const subject = parsedSubjects[this.pattern][this.locale]
    const labels = JSON.parse(Labels)
    Handlebars.registerHelper('locale',(ctx) => labels[ctx] ?? ctx)
    Handlebars.registerHelper('dateToLocaleString', function(date, locale) {
      return new Date(date).toLocaleString(locale, { dateStyle: 'full', timeStyle: 'short' });
    });
    Handlebars.registerHelper('ternary', function (condition, valTrue, valFalse) {
      return condition ? valTrue : valFalse;
    });
    Handlebars.registerPartial('header',Header)
    Handlebars.registerPartial('footer',Footer)
    Handlebars.registerPartial('body',Body)
    const template = Handlebars.compile(Container)
    return {
      subject,
      template
    }
  }

  async build(args?:Record<string,any>) {
    const {subject,template} = await this.initEmail()
    return {
      subject:this.replace(subject,args),
      html:template({
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