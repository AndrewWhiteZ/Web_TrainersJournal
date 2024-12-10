import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'beltLevelColor',
  standalone: true
})
export class BeltLevelColorPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    switch (value) {
      case 6:
        return "Snow";
      case 5:
        return "LightYellow";
      case 4:
        return "LightSalmon";
      case 3:
        return "LightGreen";
      case 2:
        return "LightBlue";
      case 1:
        return "Peru";
      case 0:
        return "LightGray";
      default:
        return "<Неопределено>";
    }
  }

}
