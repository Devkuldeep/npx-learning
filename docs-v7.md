Below is a **practical design for a NestJS module generator template** so that **one CLI command generates a full production-ready module**.

Goal:

```bash
dev generate nestjs-module user
```

Generated structure:

```
src/modules/user
   user.module.ts
   user.controller.ts
   user.service.ts
   dto/
       create-user.dto.ts
       update-user.dto.ts
   entities/
       user.entity.ts
   repository/
       user.repository.ts
   tests/
       user.service.spec.ts
```

This is the **same pattern used in large NestJS codebases**.

---

# 1. Template Folder Structure

Inside your template registry:

```
backend/nestjs/module
│
├─ template.json
├─ files
│
├─ module.hbs
├─ controller.hbs
├─ service.hbs
│
├─ dto
│   ├─ create.dto.hbs
│   └─ update.dto.hbs
│
├─ entity
│   └─ entity.hbs
│
├─ repository
│   └─ repository.hbs
│
└─ tests
    └─ service.spec.hbs
```

The CLI reads this folder and generates files.

---

# 2. Template Metadata

`template.json`

```json
{
  "name": "nestjs-module",
  "questions": [
    {
      "name": "moduleName",
      "message": "Module name?"
    },
    {
      "name": "database",
      "type": "list",
      "choices": ["typeorm", "prisma"]
    },
    {
      "name": "auth",
      "type": "confirm",
      "message": "Add authentication guard?"
    }
  ],
  "output": "src/modules/{{moduleName}}"
}
```

The CLI will ask these questions.

---

# 3. Module Template

`module.hbs`

```ts
import { Module } from '@nestjs/common';
import { {{pascalCase moduleName}}Controller } from './{{moduleName}}.controller';
import { {{pascalCase moduleName}}Service } from './{{moduleName}}.service';

@Module({
  controllers: [{{pascalCase moduleName}}Controller],
  providers: [{{pascalCase moduleName}}Service],
})
export class {{pascalCase moduleName}}Module {}
```

Generated:

```ts
export class UserModule {}
```

---

# 4. Controller Template

`controller.hbs`

```ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { {{pascalCase moduleName}}Service } from './{{moduleName}}.service';

@Controller('{{moduleName}}')
export class {{pascalCase moduleName}}Controller {

  constructor(
    private readonly service: {{pascalCase moduleName}}Service
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

}
```

---

# 5. Service Template

`service.hbs`

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class {{pascalCase moduleName}}Service {

  findAll() {
    return [];
  }

  create(data: any) {
    return data;
  }

}
```

---

# 6. DTO Templates

`create.dto.hbs`

```ts
export class Create{{pascalCase moduleName}}Dto {

}
```

`update.dto.hbs`

```ts
import { PartialType } from '@nestjs/mapped-types';
import { Create{{pascalCase moduleName}}Dto } from './create-{{moduleName}}.dto';

export class Update{{pascalCase moduleName}}Dto
extends PartialType(Create{{pascalCase moduleName}}Dto) {}
```

---

# 7. Entity Template

`entity.hbs`

```ts
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class {{pascalCase moduleName}} {

  @PrimaryGeneratedColumn()
  id: number;

}
```

---

# 8. Repository Template

`repository.hbs`

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class {{pascalCase moduleName}}Repository {

}
```

---

# 9. Test Template

`service.spec.hbs`

```ts
import { Test } from '@nestjs/testing';
import { {{pascalCase moduleName}}Service } from '../{{moduleName}}.service';

describe('{{pascalCase moduleName}}Service', () => {

  let service: {{pascalCase moduleName}}Service;

  beforeEach(async () => {

    const module = await Test.createTestingModule({
      providers: [{{pascalCase moduleName}}Service],
    }).compile();

    service = module.get({{pascalCase moduleName}}Service);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});
```

---

# 10. Generated Output Example

Command:

```bash
dev generate nestjs-module
```

CLI prompts:

```
Module name: user
Database: typeorm
Add auth guard: yes
```

Generated:

```
src/modules/user
│
├─ user.module.ts
├─ user.controller.ts
├─ user.service.ts
│
├─ dto
│   ├─ create-user.dto.ts
│   └─ update-user.dto.ts
│
├─ entities
│   └─ user.entity.ts
│
├─ repository
│   └─ user.repository.ts
│
└─ tests
    └─ user.service.spec.ts
```

---

# 11. Next-Level Feature (Important)

Your CLI should also **inject the module automatically** into `app.module.ts`.

Example:

Before:

```ts
imports: []
```

After generation:

```ts
imports: [UserModule]
```

This can be done using:

```
ts-morph
```

---

# 12. Real Command Examples

Your CLI could support:

```bash
dev generate nestjs-module user
dev generate nestjs-crud product
dev generate nestjs-auth
dev generate microservice kafka
dev generate docker-service
```

---

💡 **Important insight**

If you build this properly, your CLI becomes your **personal development framework**.

Every new project becomes:

```
create project
run CLI
generate everything
```

---

If you want, I can also show you **the ultimate NestJS template system used in large SaaS apps**, where **one command generates a full CRUD API including validation, pagination, filters, and Swagger docs automatically.**
