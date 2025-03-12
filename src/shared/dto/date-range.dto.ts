import { IsDateString } from 'class-validator';
import { Check } from '../decorators/check.decorator';

export class DateRangeDto {
  @IsDateString()
  start_date: string;

  @IsDateString()
  @Check((end_date, o) => new Date(end_date) >= new Date(o.start_date), {
    message: 'End date must be greater than or equal to start date',
  })
  end_date: string;
}