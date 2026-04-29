import { BadRequestException, ValidationError } from "@nestjs/common";
import { Field, ObjectType } from "@nestjs/graphql";
import { IsOptional, IsString, validate } from "class-validator";

@ObjectType()
export abstract class ServiceConfig {
  @Field({nullable:true})
  @IsString()
  @IsOptional()
  plan?:string;

  toRecords(customs:Record<string,any> = {}): Array<{name:string,value:string,customValue?:string}> {
    return Object.entries(this).map(entry => {
      return {
        name:entry[0],
        value:typeof entry[1] === 'string' ? entry[1] : JSON.stringify(entry[1]),
        customValue: customs[entry[0]] !== undefined ? (typeof customs[entry[0]] === 'string' || customs[entry[0]] === null ? customs[entry[0]] : JSON.stringify(customs[entry[0]])) : undefined
      };
    });
  }

  setPlan(plan:string): this {
    this.plan = plan
    return this
  }

  override(props:Record<string,any> = {}): this {
    Object.assign(this,{...props})
    return this
  }

  async validate() {
    const errors = await validate(this,{
      whitelist:true,
      forbidNonWhitelisted:true,
    })
    if(errors.length > 0) throw new BadRequestException(errors.map((error) => this.extractAllErrors(error)).flat());
  }
  
  private extractAllErrors(e: ValidationError): string[] {
    if (!!e.children && e.children.length) {
      const errors: string[] = [];
      e.children.forEach((child) => {
        errors.push(
          ...this.extractAllErrors(child).map(
            (childErr) => `${e.property}.${childErr}`,
          ),
        );
      });
      return errors;
    } else {
      return Object.values(e.constraints);
    }
  };
}