import {
  In,
  IsNull,
  Repository,
  UpdateResult,
  DeleteResult,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import { PaginationDBParams } from '../helpers/UtilHelper';

export abstract class BaseRepository<T> {
  protected DefaultOrderByColumn = 'created_at';
  protected DefaultOrderByDirection = 'ASC';
  protected PrimaryColumnKey = 'id';

  constructor(protected Repository: Repository<T>) {}

  protected ApplyPagination(
    whereParams: any,
    options?: PaginationDBParams,
  ): any {
    if (options && options.limit != -1) {
      whereParams.take = options.limit;
      whereParams.skip = options.offset;
    }

    return whereParams;
  }

  protected GetPrimaryColumnKey() {
    return this.PrimaryColumnKey;
  }

  protected GetPrimaryColumnValue(val) {
    return val;
  }

  protected InOperator(val): any {
    return In(val);
  }

  protected PrepareParams(whereParams, options?: PaginationDBParams) {
    const whereClauses = {};
    for (const key in whereParams) {
      let val = whereParams[key];
      if (Array.isArray(val)) {
        val = this.InOperator(val);
      } else if (val === null) {
        val = IsNull();
      }
      whereClauses[key] = val;
    }
    // TODO: check if is_deleted column exists
    whereClauses['is_deleted'] = 0;

    return whereClauses;
  }

  protected ApplyRelations(param, relations) {
    if (!relations) {
      return param;
    }
    param.relations = relations;
    return param;
  }

  protected ApplyOrder(
    whereParams: any,
    orderOptions?: { Column: string; Direction: 'ASC' | 'DESC' },
  ): any {
    let Column: string = this.DefaultOrderByColumn;
    let Direction: string = this.DefaultOrderByDirection;

    if (orderOptions !== undefined) {
      if (orderOptions.Column) {
        Column = orderOptions.Column;
      }

      if (orderOptions.Direction) {
        Direction = orderOptions.Direction;
      }
    }

    if (whereParams.order === undefined) {
      whereParams.order = {};
    }

    whereParams.order[Column] = Direction;

    return whereParams;
  }

  public async Create(instance: any, creatorId = null): Promise<T> {
    if (creatorId) {
      instance.CreatedBy = creatorId;
      instance.UpdatedBy = creatorId;
    }

    return await this.Save(instance);
  }

  public async CreateAll(instance: T[]): Promise<T[]> {
    return await this.SaveAll(instance);
  }

  public async FindById(id?: number | string, params?: any): Promise<T> {
    return await this.Repository.findOne({
      where: { id },
      ...params,
    });
  }

  public async FindByIds(ids: any[]): Promise<T[]> {
    return await this.Repository.findBy({
      id: In(ids),
    } as FindOptionsWhere<any>);
  }

  public async Find(
    whereParams,
    options?: PaginationDBParams,
    relations?,
    select?: string[],
    order?: { Column: string; Direction: 'ASC' | 'DESC' },
  ): Promise<T[]> {
    let params = {
      where: this.PrepareParams(whereParams),
    };

    params = this.ApplyPagination(params, options);
    params = this.ApplyOrder(params, order);
    params = this.ApplyRelations(params, relations);

    if (select) {
      params["select"] = ['id', ...select]
    }
    return await this.Repository.find(params);
  }

  public async FindOne(whereParams, params?: any): Promise<T> {
    return await this.Repository.findOne({
      where: whereParams,
      ...params,
    });
  }

  public async Count(whereParams, params?: any): Promise<number> {
    return await this.Repository.count({
      where: whereParams,
      ...params,
    });
  }

  public async FindAndCount(
    whereParams,
    options?: PaginationDBParams,
    relations?,
    order?: { Column: string; Direction: 'ASC' | 'DESC' },
  ): Promise<[T[], number]> {
    let params = {
      where: this.PrepareParams(whereParams),
    };
    params = this.ApplyPagination(params, options);
    params = this.ApplyOrder(params, order);
    params = this.ApplyRelations(params, relations);

    return await this.Repository.findAndCount(params as FindManyOptions);
  }

  public async GetAll(options?: PaginationDBParams): Promise<T[]> {
    let params = {};

    params = this.ApplyPagination(params, options);
    params = this.ApplyOrder(params);
    return await this.Repository.find(params);
  }

  public async Where(whereParams = null): Promise<T[]> {
    return await this.Repository.find(whereParams);
  }

  public async Save(instance: T): Promise<T> {
    return (await this.Repository.save(instance as any)) as T;
  }

  public async SaveAll(instance: T[]): Promise<T[]> {
    return (await this.Repository.save(instance as any)) as T[];
  }

  public async Update(condition: FindOptionsWhere<T>, updateObject) {
    return await this.Repository.update(condition, updateObject as any);
  }

  public async Delete(
    param: any,
    softDelete = true,
  ): Promise<UpdateResult | DeleteResult> {
    if (softDelete) {
      return await this.Repository.update(param, {
        is_deleted: 1,
      } as any);
    } else {
      //TODO: We have remove function as well.
      return await this.Repository.delete(param);
    }
  }

  public async DeleteById(
    id: number,
    softDelete = true,
  ): Promise<UpdateResult | DeleteResult> {
    return await this.Delete(
      {
        id: id,
      },
      softDelete,
    );
  }

  public async DeleteByIds(
    ids: number[],
    softDelete = true,
  ): Promise<UpdateResult | DeleteResult> {
    if (ids.length == 0) {
      return null;
    }
    const idList = [];
    for (let i = 0, l = ids.length; i < l; i++) {
      const paramObj = {
        id: ids[i],
      };
      idList.push(paramObj);
    }
    return await this.Delete(idList, softDelete);
  }
}
