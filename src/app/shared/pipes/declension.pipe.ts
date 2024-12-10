import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'declension',
  standalone: true
})
export class DeclensionPipe implements PipeTransform {

  transform(value: number, single: string, few: string, many: string, ...args: unknown[]): string {
    if (10 <= value % 100 && value % 100 <= 20) {
      return `${value} ${many}`;
    } else if (value % 10 === 1) {
      return `${value} ${single}`;
    } else if (2 <= value % 10 && value % 10 <= 4) {
      return `${value} ${few}`;
    } else {
      return `${value} ${many}`;
    }
  }

}
