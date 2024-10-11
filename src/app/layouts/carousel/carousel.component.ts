import { Component, OnInit } from '@angular/core';


declare var bootstrap: any;

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Iniciar el carrusel con cambio automático
    setTimeout(() => {
      const carouselElement = document.querySelector('#carouselExampleCaptions');
      const carousel = new bootstrap.Carousel(carouselElement, {
        interval: 3500, // Cambiar cada 2 segundos (ajusta este valor según lo necesario)
        wrap: true // Permite que el carrusel vuelva al principio después de la última diapositiva
      });
    }, 100); // Asegura que el carrusel se inicialice después de que Angular haya renderizado el HTML
  }

}
