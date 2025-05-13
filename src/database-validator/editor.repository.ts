import { EditorHistoryModel } from "./entity/editor-history.entity";

import { BaseRepository } from "src/shared/database/BaseRepository";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IRedisUserModel } from "src/shared/interfaces/IRedisUserModel";
import { GetPaginationOptions } from "src/shared/helpers/UtilHelper";

@Injectable()
export class EditorHistoryRepository extends BaseRepository<EditorHistoryModel> {
  constructor(
    @InjectRepository(EditorHistoryModel)
    private dbconnectionRepository: Repository<EditorHistoryModel>,
  ) {
    super(dbconnectionRepository);
  }

  public async GetHistory(user: IRedisUserModel,data){
    let pagination = GetPaginationOptions(data);
    const editorHistory = this.Repository.createQueryBuilder('editor_history')
    .where('editor_history.employee_id = :employee_id', { employee_id: user.employee_id })

    if(pagination){
        editorHistory.offset(pagination.offset).take(pagination.limit);
    }

    editorHistory.orderBy('editor_history.created_at', 'DESC');

    const result = await editorHistory.getManyAndCount();
    return result;
  }
}