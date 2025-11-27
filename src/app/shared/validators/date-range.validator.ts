import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function parseDate(v: any): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;

  // Soporta "dd/MM/yyyy"
  if (typeof v === 'string') {
    const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [_, dd, mm, yyyy] = m;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return Number.isNaN(d.getTime()) ? null : d;
    }
    // fallback: ISO o parse nativo
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Valida que start <= end (allowEqual=true por defecto). */
export function dateRangeValidator(
  startKey: string,
  endKey: string,
  opts: { allowEqual?: boolean } = { allowEqual: true }
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const startCtrl = group.get(startKey);
    const endCtrl = group.get(endKey);
    if (!startCtrl || !endCtrl) return null;

    const start = parseDate(startCtrl.value);
    const end = parseDate(endCtrl.value);

    // limpia errores previos de este validador
    if (startCtrl.errors?.['startAfterEnd']) {
      const { startAfterEnd, ...rest } = startCtrl.errors;
      startCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }
    if (endCtrl.errors?.['endBeforeStart']) {
      const { endBeforeStart, ...rest } = endCtrl.errors;
      endCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }

    if (!start || !end) return null;

    const isAfter = start.getTime() > end.getTime();
    const isEqual = start.getTime() === end.getTime();

    if (isAfter || (!opts.allowEqual && isEqual)) {
      startCtrl.setErrors({ ...(startCtrl.errors || {}), startAfterEnd: true });
      endCtrl.setErrors({ ...(endCtrl.errors || {}), endBeforeStart: true });
      return { dateRange: true };
    }
    return null;
  };
}
