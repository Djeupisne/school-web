import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'gradeFormat' })
export class GradeFormatPipe implements PipeTransform {
  transform(value: number): string {
    return value !== null && value !== undefined ? value.toFixed(2) + ' / 20' : 'N/A';
  }
}