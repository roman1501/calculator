import { Directive, ElementRef, Input, NgZone, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDateRangePicker } from '@angular/material/datepicker';

@Directive({
  selector: '[appRangeDaysTooltip]',
  standalone: true,
})
export class RangeDaysTooltipDirective implements OnDestroy {
  @Input({ required: true }) formGroup!: FormGroup;

  private tooltipEl?: HTMLDivElement;
  private overlayEl?: HTMLElement;
  private removeMove?: () => void;
  private removeLeave?: () => void;

  private readonly DEBUG = false;
  private log(...a: any[]) { if (this.DEBUG) console.log('[RANGE_TT]', ...a); }

  constructor(
    private picker: MatDateRangePicker<Date>,
    private zone: NgZone,
  ) {
    this.picker.openedStream.subscribe(() => this.onOpen());
    this.picker.closedStream.subscribe(() => this.onClose());
  }


  ngOnDestroy(): void {
    this.onClose();
  }

  private onOpen(): void {
    this.onClose();

    // ✅ беремо саме overlay календаря
    this.overlayEl = this.getActiveDatepickerContent() || undefined;

    this.log('overlayEl:', this.overlayEl);

    if (!this.overlayEl) return;

    this.ensureTooltipEl(this.overlayEl);

    // ✅ слухаємо рух миші всередині календаря
    this.zone.runOutsideAngular(() => {
      this.removeMove = this.listen(this.overlayEl!, 'mousemove', (e: MouseEvent) => this.onMove(e));
      this.removeLeave = this.listen(this.overlayEl!, 'mouseleave', () => this.hide());
    });
  }

  private onClose(): void {
    this.hide();
    this.removeMove?.(); this.removeMove = undefined;
    this.removeLeave?.(); this.removeLeave = undefined;
    this.overlayEl = undefined;
  }

  private onMove(e: MouseEvent): void {
    const target = e.target as HTMLElement;

    const cellBtn = target.closest('button.mat-calendar-body-cell') as HTMLButtonElement | null;
    if (!cellBtn) { this.hide(); return; }

    const start = this.formGroup?.get('beginningDate')?.value as Date | null;
    const end = this.formGroup?.get('endingDate')?.value as Date | null;

    // ✅ якщо start не вибрано — нічого не показуємо
    if (!start) { this.hide(); return; }

    // ✅ якщо end вже вибрано: показуємо ТІЛЬКИ на реальному end-cell
    if (end) {
      const isEnd =
        cellBtn.classList.contains('mat-calendar-body-range-end') ||
        cellBtn.classList.contains('mat-calendar-body-end-date');

      if (!isEnd) { this.hide(); return; }

      const days = this.diffDaysInclusive(start, end);
      if (!days) { this.hide(); return; }

      this.show(String(days), cellBtn);
      return;
    }

    // ✅ якщо end ще НЕ вибрано: показуємо ТІЛЬКИ на preview-end (куди ти “цілишся” мишкою)
    const isPreviewEnd =
      cellBtn.classList.contains('mat-calendar-body-preview-end') ||
      cellBtn.classList.contains('mat-calendar-body-in-preview');

    if (!isPreviewEnd) { this.hide(); return; }

    const aria = cellBtn.getAttribute('aria-label');
    if (!aria) { this.hide(); return; }

    const hovered = this.parseUaAriaDate(aria);
    if (!hovered) { this.hide(); return; }

    const days = this.diffDaysInclusive(start, hovered);
    if (!days) { this.hide(); return; }

    this.show(String(days), cellBtn);
  }

  private show(text: string, cellBtn: HTMLButtonElement): void {
    if (!this.tooltipEl || !this.overlayEl) return;

    this.tooltipEl.textContent = text;

    const r = cellBtn.getBoundingClientRect();
    const o = this.overlayEl.getBoundingClientRect();

    // позиціонуємо відносно overlay, щоб не було проблем зі скролом/з-індексом
    const left = (r.left - o.left) + r.width / 2;
    const top = (r.top - o.top);

    this.tooltipEl.style.left = `${left}px`;
    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.display = 'block';
  }

  private hide(): void {
    if (this.tooltipEl) this.tooltipEl.style.display = 'none';
  }

  private ensureTooltipEl(container: HTMLElement): void {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'range-days-tooltip';
    container.appendChild(this.tooltipEl);
  }

  private listen(el: HTMLElement, event: string, cb: any): () => void {
    el.addEventListener(event, cb, { passive: true });
    return () => el.removeEventListener(event, cb);
  }

  private getActiveDatepickerContent(): HTMLElement | null {
    // беремо останній відкритий datepicker-content
    const list = Array.from(document.querySelectorAll('.cdk-overlay-pane .mat-datepicker-content'));
    return (list[list.length - 1] as HTMLElement) ?? null;
  }

  private diffDaysInclusive(a: Date, b: Date): number | null {
    const s = new Date(a); s.setHours(0,0,0,0);
    const e = new Date(b); e.setHours(0,0,0,0);
    const diff = e.getTime() - s.getTime();
    if (diff < 0) return null;
    return Math.floor(diff / 86400000) + 1;
  }

  // ✅ потрібен парсер, бо aria-label: "17 грудня 2025 р."
  private parseUaAriaDate(aria: string): Date | null {
    const s = aria.trim().toLowerCase();

    const monthMap: Record<string, number> = {
      'січня': 0, 'лютого': 1, 'березня': 2, 'квітня': 3,
      'травня': 4, 'червня': 5, 'липня': 6, 'серпня': 7,
      'вересня': 8, 'жовтня': 9, 'листопада': 10, 'грудня': 11,
    };

    const m = s.match(/(\d{1,2})\s+([а-щьюяєіїґ]+)\s+(\d{4})/i);
    if (!m) return null;

    const day = Number(m[1]);
    const monthWord = m[2];
    const year = Number(m[3]);

    const month = monthMap[monthWord];
    if (month === undefined) return null;

    const d = new Date(year, month, day);
    d.setHours(0,0,0,0);

    if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
    return d;
  }
}
