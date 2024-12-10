import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'beltLevel',
  standalone: true
})
export class BeltLevelPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    switch (value) {
      case 6:
        return "Белый пояс (6 кю)";
      case 5:
        return "Желтый пояс (5 кю)";
      case 4:
        return "Красный пояс (4 кю)";
      case 3:
        return "Зеленый пояс (3 кю)";
      case 2:
        return "Синий пояс (2 кю)";
      case 1:
        return "Коричневый пояс (1 кю)";
      case 0:
        return "Черный пояс";
      default:
        return "<Неопределено>";
    }
  }

}
