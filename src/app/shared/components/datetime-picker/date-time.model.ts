import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

export interface NgbDateTimeStruct extends NgbDateStruct, NgbTimeStruct {}

export class DateTimeModel implements NgbDateTimeStruct {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;

  timeZoneOffset: number;

  public constructor(init?: Partial<DateTimeModel>) {
    Object.assign(this, init);
  }

  public static fromLocalString(dateString: string): DateTimeModel {
    const date = new Date(dateString);

    const isValidDate = !isNaN(date.valueOf());

    if (!dateString || !isValidDate) {
      return null;
    }

    // Verificar si el string es solo fecha (formato YYYY-MM-DD o similar sin hora)
    // En ese caso, usar métodos UTC para evitar problemas de zona horaria
    const isDateOnly = /^\d{4}-\d{1,2}-\d{1,2}$/.test(dateString.trim());

    if (isDateOnly) {
      return new DateTimeModel({
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: 0,
        minute: 0,
        second: 0,
        timeZoneOffset: date.getTimezoneOffset(),
      });
    }

    return new DateTimeModel({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      timeZoneOffset: date.getTimezoneOffset(),
    });
  }

  /** Parsea fechas tipadas en formato visible: dd/MM/yyyy, dd/MM/yyyy H:mm o con segundos. */
  public static fromDisplayString(value: string): DateTimeModel {
    if (!value) {
      return null;
    }

    const match = value
      .trim()
      .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);

    if (!match) {
      return null;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    const hour = match[4] !== undefined ? parseInt(match[4], 10) : 0;
    const minute = match[5] !== undefined ? parseInt(match[5], 10) : 0;
    const second = match[6] !== undefined ? parseInt(match[6], 10) : 0;

    if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
      return null;
    }

    const date = new Date(year, month - 1, day, hour, minute, second);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return new DateTimeModel({
      year,
      month,
      day,
      hour,
      minute,
      second,
      timeZoneOffset: date.getTimezoneOffset(),
    });
  }

  private isInteger(value: any): value is number {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
  }

  public toString(): string {
    if (this.isInteger(this.year) && this.isInteger(this.month) && this.isInteger(this.day)) {
      const year = this.year.toString().padStart(2, '0');
      const month = this.month.toString().padStart(2, '0');
      const day = this.day.toString().padStart(2, '0');

      if (!this.hour) {
        this.hour = 0;
      }
      if (!this.minute) {
        this.minute = 0;
      }
      if (!this.second) {
        this.second = 0;
      }
      if (!this.timeZoneOffset) {
        this.timeZoneOffset = new Date().getTimezoneOffset();
      }

      const hour = this.hour.toString().padStart(2, '0');
      const minute = this.minute.toString().padStart(2, '0');
      const second = this.second.toString().padStart(2, '0');

      const tzo = -this.timeZoneOffset;
      const dif = tzo >= 0 ? '+' : '-',
        pad = function (num) {
          const norm = Math.floor(Math.abs(num));
          return (norm < 10 ? '0' : '') + norm;
        };

      const isoString = `${pad(year)}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}${dif}${pad(
        tzo / 60
      )}:${pad(tzo % 60)}`;
      return isoString;
    }

    return null;
  }
}
