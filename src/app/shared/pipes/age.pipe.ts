import { Pipe, PipeTransform } from '@angular/core';
import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';

@Pipe({
  name: 'age',
  standalone: true
})
export class AgePipe implements PipeTransform {

  transform(value: Date, ...args: unknown[]): number {
    const dayFrom = new TuiDay(value.getFullYear(), value.getMonth(), value.getDate())
    const diff = TuiDay.lengthBetween(dayFrom, TuiDay.currentLocal());
    const years = Math.floor(diff / 365.25);
    return years;
  }

}
