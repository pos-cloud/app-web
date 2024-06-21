import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
// import { DatabaseService } from 'src/database/services/database.service';
import { PoolDatabase } from 'src/database/services/database-2.service';
import { TiendaNubeService } from 'src/services/tienda-nube/services/tienda-nube.service';

@Injectable()
export class CategoriesService {
  constructor(
    // private readonly databaseService: DatabaseService,
    private readonly poolDatabase: PoolDatabase,
    private readonly tiendaNubeService: TiendaNubeService,
  ) {}

  async create(
    // createCategoryDto: CreateCategoryDto,
    database: string,
    categoryId: string,
  ) {
    try {
      if (!database) {
        throw new BadRequestException(`Database is required `);
      }
      const connectionDb = await this.poolDatabase.initConnection(database);
      const { token, userID } =
        await this.poolDatabase.getCredentialsTiendaNube(database);

      const foundCollection = await this.poolDatabase.getCollection(
        'categories',
        database,
      );

      const foundCategory = await this.poolDatabase.getDocumentById(
        'categories',
        categoryId,
        database,
      );

      if (!foundCategory) {
        throw new BadRequestException(
          ` Category with id${categoryId} not found`,
        );
      }

      let categoryTN
      if (foundCategory.tiendaNubeId) {
        categoryTN = await this.tiendaNubeService.getCategoryId(
          foundCategory.tiendaNubeId,
          token,
          userID,
        );
      } else {
        categoryTN = await this.tiendaNubeService.createCategory(
          {
            name: {
              es: foundCategory.description,
            }
          },
          token,
          userID,
        );

        await foundCollection.updateOne(
          { _id: foundCategory._id },
          {
            $set: {
              tiendaNubeId: categoryTN.id,
            },
          },
        );

      }

      if (foundCategory.parent) {
        let parent = foundCategory.parent;
        let categoryTiendaNubeId = categoryTN;
        while (parent !== null) {
          const foundCategoryParent = await this.poolDatabase.getDocumentById('categories', parent, database);
          const categoryTiendaNube = foundCategoryParent.tiendaNubeId
            ? await this.tiendaNubeService.getCategoryId(
              foundCategoryParent.tiendaNubeId,
              token,
              userID,
            )
            : await this.tiendaNubeService.createCategory(
              { name: { es: foundCategoryParent.description } },
              token,
              userID
            );

          if (!foundCategoryParent.tiendaNubeId) {
            await foundCollection.updateOne(
              { _id: foundCategoryParent._id },
              { $set: { tiendaNubeId: categoryTiendaNube.id } }
            );
          }

          const result = await this.tiendaNubeService.updateCategory(
            {
              id: categoryTiendaNubeId.id,
              parent: categoryTiendaNube.id,
              name: { es: categoryTiendaNubeId.name.es },
            },
            token,
            userID,
            categoryTiendaNubeId.id//   categoryTiendaNube.id
          );
          categoryTiendaNubeId = categoryTiendaNube;
          parent = foundCategoryParent.parent || null;

          categoryTN = result
        }
      }
      return categoryTN;
    } catch (err) {
      throw err;
    }
  }

  findAll() {
    return `This action returns all categories`;
  }
  async findOneCategoryDb(categoryId: string, database: string) {
    const foundCategory = await this.poolDatabase.getDocumentById(
      'categories',
      categoryId,
      database,
    );
    if (!foundCategory) {
      throw new BadRequestException(` Category with id${categoryId} not found`);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
