import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DatabaseService } from 'src/database/services/database.service';
import { TiendaNubeService } from 'src/services/tienda-nube/services/tienda-nube.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tiendaNubeService: TiendaNubeService,
  ) {}

  async create(
    // createCategoryDto: CreateCategoryDto,
    database: string,
    categoryId: string,
  ) {
    if (!database) {
      throw new BadRequestException(`Database is required `);
    }
    await this.databaseService.initConnection(database);
    const { token, userID  } =
      await this.databaseService.getCredentialsTiendaNube();

    const foundCollection = this.databaseService.getCollection('categories');

    const foundCategory = await this.databaseService.getDocumentById(
      'categories',
      categoryId,
    );

    if (!foundCategory) {
      throw new BadRequestException(` Category with id${categoryId} not found`);
    }

    if (foundCategory.tiendaNubeId) {
      const foundCategoryTiendaMia = await this.tiendaNubeService.getCategoryId(
        foundCategory.tiendaNubeId,
        token,
        userID 
      );
      if (foundCategoryTiendaMia) {
        return foundCategoryTiendaMia;
      }
    }

    const categoryTiendaNube = await this.tiendaNubeService.createCategory(
      {
        name: {
          es: foundCategory.description,
        },
      },
      token,
      userID
    );

    await foundCollection.updateOne(
      { _id: foundCategory._id },
      {
        $set: {
          tiendaNubeId: categoryTiendaNube.id,
        },
      },
    );
    return categoryTiendaNube;
  }

  findAll() {
    return `This action returns all categories`;
  }
  async findOneCategoryDb(categoryId: string) {
    const foundCategory = await this.databaseService.getDocumentById(
      'categories',
      categoryId,
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
