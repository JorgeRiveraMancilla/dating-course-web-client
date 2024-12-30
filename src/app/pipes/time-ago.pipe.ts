import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  private readonly formatter = new Intl.RelativeTimeFormat('es', {
    numeric: 'auto',
  });

  transform(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Menos de un minuto
    if (diffInSeconds < 60) {
      return 'ahora mismo';
    }

    // Menos de una hora
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return this.formatter.format(-diffInMinutes, 'minute');
    }

    // Menos de un día
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return this.formatter.format(-diffInHours, 'hour');
    }

    // Menos de una semana
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return this.formatter.format(-diffInDays, 'day');
    }

    // Menos de un mes
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return this.formatter.format(-diffInWeeks, 'week');
    }

    // Menos de un año
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return this.formatter.format(-diffInMonths, 'month');
    }

    // Más de un año
    const diffInYears = Math.floor(diffInDays / 365);
    return this.formatter.format(-diffInYears, 'year');
  }
}
