export default class Slugger {
  private unique;
  constructor(private readonly word: string) {}

  public get(): string {
    return this.word.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/gi, '').replaceAll(' ','-').toLowerCase() + (this.unique ? '-'+this.randomString(5) : '')
  }

  public makeUnique() {
    this.unique = true
  }

  private randomString(length:number) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}