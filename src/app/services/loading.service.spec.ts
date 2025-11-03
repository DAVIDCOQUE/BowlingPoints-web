import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService]
    });

    service = TestBed.inject(LoadingService);
  });

  it('debe inicializar con loading en false', (done) => {
    service.loading$.subscribe(value => {
      expect(value).toBeFalse();
      done();
    });
  });

  it('debe emitir true cuando se llama show()', (done) => {
    const emissions: boolean[] = [];

    const subscription = service.loading$.subscribe(value => {
      emissions.push(value);
      if (emissions.length === 2) {
        expect(emissions).toEqual([false, true]); // estado inicial + show()
        subscription.unsubscribe();
        done();
      }
    });

    service.show();
  });

  it('debe emitir false cuando se llama hide()', (done) => {
    const emissions: boolean[] = [];

    const subscription = service.loading$.subscribe(value => {
      emissions.push(value);
      if (emissions.length === 3) {
        expect(emissions).toEqual([false, true, false]); // init → show() → hide()
        subscription.unsubscribe();
        done();
      }
    });

    service.show();
    service.hide();
  });

  it('debe alternar correctamente entre show() y hide()', (done) => {
    const expectedStates = [false, true, false, true];
    const results: boolean[] = [];

    const subscription = service.loading$.subscribe(state => {
      results.push(state);
      if (results.length === expectedStates.length) {
        expect(results).toEqual(expectedStates);
        subscription.unsubscribe();
        done();
      }
    });

    service.show();
    service.hide();
    service.show();
  });
});
