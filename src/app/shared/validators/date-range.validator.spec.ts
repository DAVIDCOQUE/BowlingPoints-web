import { FormControl, FormGroup } from '@angular/forms';
import { dateRangeValidator } from './date-range.validator';

describe('dateRangeValidator', () => {
  it('should pass when start is before end', () => {
    const form = new FormGroup(
      {
        start: new FormControl('01/01/2022'),
        end: new FormControl('10/01/2022'),
      },
      [dateRangeValidator('start', 'end')]
    );

    expect(form.errors).toBeNull();
    expect(form.get('start')?.errors).toBeNull();
    expect(form.get('end')?.errors).toBeNull();
  });

  it('should fail when start is after end', () => {
    const form = new FormGroup(
      {
        start: new FormControl('15/01/2022'),
        end: new FormControl('10/01/2022'),
      },
      [dateRangeValidator('start', 'end')]
    );

    expect(form.errors).toEqual({ dateRange: true });
    expect(form.get('start')?.errors).toEqual({ startAfterEnd: true });
    expect(form.get('end')?.errors).toEqual({ endBeforeStart: true });
  });

  it('should fail when start equals end and allowEqual is false', () => {
    const form = new FormGroup(
      {
        start: new FormControl('10/01/2022'),
        end: new FormControl('10/01/2022'),
      },
      [dateRangeValidator('start', 'end', { allowEqual: false })]
    );

    expect(form.errors).toEqual({ dateRange: true });
  });

  it('should pass when start equals end and allowEqual is true', () => {
    const form = new FormGroup(
      {
        start: new FormControl('10/01/2022'),
        end: new FormControl('10/01/2022'),
      },
      [dateRangeValidator('start', 'end', { allowEqual: true })]
    );

    expect(form.errors).toBeNull();
  });

  it('should do nothing if start or end is missing', () => {
    const form = new FormGroup(
      {
        start: new FormControl(null),
        end: new FormControl(null),
      },
      [dateRangeValidator('start', 'end')]
    );

    expect(form.errors).toBeNull();
  });

  it('should return null if startCtrl is missing', () => {
    const form = new FormGroup({}, [dateRangeValidator('start', 'end')]);
    expect(form.errors).toBeNull();
  });

  it('should return null if dates are invalid', () => {
    const form = new FormGroup(
      {
        start: new FormControl('fecha inválida'),
        end: new FormControl('otra inválida'),
      },
      [dateRangeValidator('start', 'end')]
    );

    expect(form.errors).toBeNull();
  });

  it('should clean previous validation errors if range is valid', () => {
    const form = new FormGroup(
      {
        start: new FormControl('01/01/2022'),
        end: new FormControl('10/01/2022'),
      },
      [dateRangeValidator('start', 'end')]
    );

    // Simula errores antiguos
    form.get('start')?.setErrors({ startAfterEnd: true, anotherError: true });
    form.get('end')?.setErrors({ endBeforeStart: true });

    form.updateValueAndValidity();

    // El validador debe limpiar startAfterEnd y endBeforeStart, dejando otherErrors
    expect(form.get('start')?.errors).toEqual({ anotherError: true });
    expect(form.get('end')?.errors).toBeNull();
  });



});
