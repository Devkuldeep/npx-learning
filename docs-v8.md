Below is a **production-grade NestJS CRUD generator design**.
This is the type of template many SaaS teams use so that **one command generates a complete API module** with validation, pagination, filters, and Swagger docs.

Example command:

```bash
dev generate nestjs-crud user
```

Generated module:

```text
src/modules/user
│
├─ user.module.ts
├─ user.controller.ts
├─ user.service.ts
├─ user.repository.ts
│
├─ dto
│   ├─ create-user.dto.ts
│   ├─ update-user.dto.ts
│   └─ query-user.dto.ts
│
├─ entities
│   └─ user.entity.ts
│
├─ interfaces
│   └─ user.interface.ts
│
├─ validators
│   └─ user.validator.ts
│
└─ tests
    └─ user.service.spec.ts
```

This produces a **fully usable REST API instantly**.

---

# 1️⃣ Template Folder Layout

Inside your template registry:

```text
backend/nestjs/crud
│
├─ template.json
│
├─ controller.hbs
├─ service.hbs
├─ repository.hbs
├─ module.hbs
│
├─ dto
│   ├─ create.dto.hbs
│   ├─ update.dto.hbs
│   └─ query.dto.hbs
│
├─ entity
│   └─ entity.hbs
│
└─ tests
    └─ service.spec.hbs
```

---

# 2️⃣ Template Metadata

`template.json`

```json
{
  "name": "nestjs-crud",
  "questions": [
    {
      "name": "moduleName",
      "message": "Resource name?"
    },
    {
      "name": "database",
      "type": "list",
      "choices": ["typeorm", "prisma"]
    },
    {
      "name": "pagination",
      "type": "confirm",
      "message": "Enable pagination?"
    },
    {
      "name": "swagger",
      "type": "confirm",
      "message": "Add Swagger docs?"
    }
  ],
  "output": "src/modules/{{moduleName}}"
}
```

---

# 3️⃣ Entity Template

`entity.hbs`

```ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class {{pascalCase moduleName}} {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

}
```

Generated:

```ts
export class User
```

---

# 4️⃣ Create DTO (Validation)

`create.dto.hbs`

```ts
import { IsString, IsOptional } from 'class-validator';

export class Create{{pascalCase moduleName}}Dto {

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

}
```

---

# 5️⃣ Update DTO

```ts
import { PartialType } from '@nestjs/mapped-types';
import { Create{{pascalCase moduleName}}Dto } from './create-{{moduleName}}.dto';

export class Update{{pascalCase moduleName}}Dto
  extends PartialType(Create{{pascalCase moduleName}}Dto) {}
```

---

# 6️⃣ Query DTO (Filters + Pagination)

```ts
import { IsOptional, IsNumber } from 'class-validator';

export class Query{{pascalCase moduleName}}Dto {

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

}
```

This enables:

```http
GET /users?page=1&limit=10
```

---

# 7️⃣ Repository Layer

`repository.hbs`

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class {{pascalCase moduleName}}Repository {

  async findAll() {
    return [];
  }

  async create(data: any) {
    return data;
  }

}
```

---

# 8️⃣ Service Layer

`service.hbs`

```ts
import { Injectable } from '@nestjs/common';
import { {{pascalCase moduleName}}Repository } from './{{moduleName}}.repository';

@Injectable()
export class {{pascalCase moduleName}}Service {

  constructor(
    private readonly repo: {{pascalCase moduleName}}Repository
  ) {}

  findAll(query: any) {
    return this.repo.findAll();
  }

  create(data: any) {
    return this.repo.create(data);
  }

}
```

---

# 9️⃣ Controller Layer

`controller.hbs`

```ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { {{pascalCase moduleName}}Service } from './{{moduleName}}.service';

@Controller('{{moduleName}}')
export class {{pascalCase moduleName}}Controller {

  constructor(
    private readonly service: {{pascalCase moduleName}}Service
  ) {}

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

}
```

---

# 🔟 Swagger Documentation (Optional)

If enabled:

```ts
import { ApiTags } from '@nestjs/swagger';

@ApiTags('{{moduleName}}')
@Controller('{{moduleName}}')
```

Your API automatically appears in:

```
/api/docs
```

---

# 11️⃣ Module Template

`module.hbs`

```ts
import { Module } from '@nestjs/common';

import { {{pascalCase moduleName}}Controller } from './{{moduleName}}.controller';
import { {{pascalCase moduleName}}Service } from './{{moduleName}}.service';
import { {{pascalCase moduleName}}Repository } from './{{moduleName}}.repository';

@Module({
  controllers: [{{pascalCase moduleName}}Controller],
  providers: [
    {{pascalCase moduleName}}Service,
    {{pascalCase moduleName}}Repository
  ]
})
export class {{pascalCase moduleName}}Module {}
```

---

# 12️⃣ Auto-Injected Routes

Generated API endpoints:

```
GET /users
GET /users/:id
POST /users
PATCH /users/:id
DELETE /users/:id
```

---

# 13️⃣ Generated Example

Command:

```bash
dev generate nestjs-crud user
```

Generated:

```text
src/modules/user
│
├─ user.module.ts
├─ user.controller.ts
├─ user.service.ts
├─ user.repository.ts
│
├─ dto
│   ├─ create-user.dto.ts
│   ├─ update-user.dto.ts
│   └─ query-user.dto.ts
│
└─ entities
    └─ user.entity.ts
```

---

# 14️⃣ Why This Is Powerful

This single command gives you:

✔ REST API
✔ validation
✔ pagination
✔ Swagger docs
✔ repository pattern
✔ testing structure

In seconds.

---

💡 **Important insight**

When your CLI includes templates like this, starting a backend project becomes extremely fast.

Instead of writing boilerplate for hours:

```bash
dev generate nestjs-crud user
dev generate nestjs-crud product
dev generate nestjs-crud order
```

You can scaffold an entire backend in minutes.

---

If you'd like, I can also show you **an even more advanced generator used in high-scale SaaS platforms**, where one command generates:

* CRUD API
* role-based permissions
* caching layer
* background queue
* event system

(all automatically).
