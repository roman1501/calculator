import { Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { DateRange, MatDateRangeSelectionStrategy } from '@angular/material/datepicker';

@Injectable()
export class SameDayRangeStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  constructor(private adapter: DateAdapter<D>) {}

  selectionFinished(date: D | null, currentRange: DateRange<D>): DateRange<D> {
    return this.buildRange(date, currentRange);
  }

  createPreview(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
    return this.buildRange(activeDate, currentRange);
  }

  private buildRange(date: D | null, range: DateRange<D>): DateRange<D> {
    if (!date) {
      return range;
    }

    const { start, end } = range;

    if (!start || end) {
      return new DateRange(date, null);
    }

    const sameDay = this.adapter.compareDate(date, start) === 0;
    if (sameDay) {
      return new DateRange(start, start);
    }

    const afterStart = this.adapter.compareDate(date, start) > 0;
    return afterStart ? new DateRange(start, date) : new DateRange(date, null);
  }
}
